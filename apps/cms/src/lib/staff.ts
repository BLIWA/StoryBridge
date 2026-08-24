/**
 * Staff records and roles — the CMS's real access control.
 *
 * A person has access to Studio if and only if `staff/{their lowercased email}`
 * exists in Firestore with `active: true`. That document also carries their
 * role, which drives both the UI and firestore.rules — the rules do the same
 * lookup server-side, so a hidden button is not the security boundary.
 *
 * Why a Firestore document rather than Firebase custom claims: claims can only
 * be set from a privileged environment (Admin SDK in a Cloud Function), which
 * needs Blaze billing. This project is deliberately still on Spark — see the
 * root README. A document lookup in rules costs one extra read per evaluation
 * and gets us genuine enforcement today. Moving to claims later means changing
 * `roleOf()` and the rules' helper functions; nothing else here.
 */

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { firebaseConfig, getFirebase } from "./firebase";

export const ROLES = ["owner", "chief", "journalist", "contributor"] as const;
export type Role = (typeof ROLES)[number];

export type StaffMember = {
  /** Lowercased email. Also the document id. */
  email: string;
  name: string;
  role: Role;
  active: boolean;
  /** Set on first successful sign-in; absent means the invite is outstanding. */
  lastSignInAt?: Timestamp | null;
  invitedBy?: string;
  createdAt?: Timestamp | null;
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  chief: "Chief",
  journalist: "Journalist",
  contributor: "Contributor",
};

/** Plain-language scope, shown in the People table. Matches the board's copy. */
export const ROLE_SCOPE: Record<Role, string> = {
  owner: "Everything, including people and billing",
  chief: "Publishing, pages, newsletter, inbox",
  journalist: "Writes and edits; publishing goes through review",
  contributor: "Own drafts only",
};

export type Capability =
  | "writeOwnDrafts"
  | "editAnyDraft"
  | "publish"
  | "editPages"
  | "sendNewsletter"
  | "managePeople";

/**
 * The board's role matrix, as data. firestore.rules encodes the same table —
 * keep the two in step, and treat the rules as the authority.
 */
export const CAPABILITIES: Record<Capability, { label: string; roles: readonly Role[] }> = {
  writeOwnDrafts: {
    label: "Write and edit own drafts",
    roles: ["owner", "chief", "journalist", "contributor"],
  },
  editAnyDraft: { label: "Edit anyone's draft", roles: ["owner", "chief", "journalist"] },
  publish: { label: "Publish to the live site", roles: ["owner", "chief"] },
  editPages: { label: "Edit pages and sections", roles: ["owner", "chief"] },
  sendNewsletter: { label: "Send The Bridge", roles: ["owner", "chief"] },
  managePeople: { label: "Manage people and access", roles: ["owner"] },
};

export function can(role: Role | null, capability: Capability): boolean {
  if (!role) return false;
  return CAPABILITIES[capability].roles.includes(role);
}

/** Emails are the document id, so they must be normalised the same way everywhere. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function toStaff(id: string, data: Record<string, unknown>): StaffMember {
  return {
    email: id,
    name: typeof data.name === "string" && data.name ? data.name : id,
    role: isRole(data.role) ? data.role : "contributor",
    active: data.active !== false,
    lastSignInAt: (data.lastSignInAt as Timestamp) ?? null,
    invitedBy: typeof data.invitedBy === "string" ? data.invitedBy : undefined,
    createdAt: (data.createdAt as Timestamp) ?? null,
  };
}

/**
 * The signed-in user's own record. Returns null both when no record exists and
 * when the read is denied — from the caller's point of view those are the same
 * answer ("you are not staff"), and rules deny reads of other people's records.
 */
export async function fetchOwnStaff(db: Firestore, email: string): Promise<StaffMember | null> {
  const id = normalizeEmail(email);
  try {
    const snap = await getDoc(doc(db, "staff", id));
    if (!snap.exists()) return null;
    const member = toStaff(snap.id, snap.data());
    return member.active ? member : null;
  } catch {
    return null;
  }
}

/** Live roster for the People table. Only readable by staff, per rules. */
export function watchStaff(
  db: Firestore,
  onChange: (members: StaffMember[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    collection(db, "staff"),
    (snap) => {
      const members = snap.docs.map((d) => toStaff(d.id, d.data()));
      members.sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || a.name.localeCompare(b.name));
      onChange(members);
    },
    onError,
  );
}

/** Records that this person has actually arrived. Best-effort — never blocks sign-in. */
export async function touchLastSignIn(db: Firestore, email: string): Promise<void> {
  try {
    await setDoc(
      doc(db, "staff", normalizeEmail(email)),
      { lastSignInAt: serverTimestamp() },
      { merge: true },
    );
  } catch {
    // A contributor may not be allowed to write their own record; not worth surfacing.
  }
}

export type InviteResult = {
  /** True when a brand-new Firebase Auth account was provisioned for them. */
  accountCreated: boolean;
  /** True when a set-your-password email went out. */
  emailSent: boolean;
  /** Set when the record saved but the email step could not run. */
  warning?: string;
};

export class InviteError extends Error {}

/**
 * Adds a person to the team.
 *
 * Two things have to happen and they are deliberately ordered: the staff record
 * is written first, because that document *is* the access grant. Provisioning
 * the Firebase Auth account is the convenience half — if it fails (or if they
 * already have an account, or intend to use Google sign-in) the invite is still
 * valid and they can sign in perfectly well.
 *
 * The account is created through a throwaway secondary Firebase app.
 * `createUserWithEmailAndPassword` signs the new user in on whatever Auth
 * instance it is given, which on the default instance would kick the owner out
 * of their own session mid-invite. A second named app has its own auth state,
 * so the owner stays signed in; it is torn down immediately afterwards.
 */
export async function inviteStaff(input: {
  email: string;
  name: string;
  role: Role;
  invitedBy: string;
}): Promise<InviteResult> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InviteError("That doesn't look like an email address.");
  }
  if (!name) throw new InviteError("Give them a name — it shows on their drafts.");

  const { db } = getFirebase();

  const existing = await getDoc(doc(db, "staff", email));
  if (existing.exists()) {
    throw new InviteError(`${email} is already on the team.`);
  }

  try {
    await setDoc(doc(db, "staff", email), {
      name,
      role: input.role,
      active: true,
      invitedBy: normalizeEmail(input.invitedBy),
      createdAt: serverTimestamp(),
      lastSignInAt: null,
    });
  } catch (err) {
    throw new InviteError(
      (err as { code?: string })?.code === "permission-denied"
        ? "Only an owner can add people."
        : "Couldn't save them to the team. Check your connection and try again.",
    );
  }

  // Convenience half — a failure here leaves a usable invite behind.
  const secondary = initializeApp(firebaseConfig, `invite-${Date.now()}`);
  const secondaryAuth = getAuth(secondary);
  try {
    // No pre-flight "does this account exist?" check: the project has email
    // enumeration protection on, so fetchSignInMethodsForEmail() answers []
    // for everyone. We just try, and read the answer off the failure.
    // Never shown to anyone. They set their own password from the email link.
    const throwaway = crypto.randomUUID() + crypto.randomUUID();
    await createUserWithEmailAndPassword(secondaryAuth, email, throwaway);
    await sendPasswordResetEmail(secondaryAuth, email);
    return { accountCreated: true, emailSent: true };
  } catch (err) {
    const code = (err as { code?: string })?.code ?? "";
    if (code === "auth/email-already-in-use") {
      return { accountCreated: false, emailSent: false };
    }
    return {
      accountCreated: false,
      emailSent: false,
      warning:
        "They're on the team, but the invite email didn't send. They can still sign in with Google, or use “Forgot?” on the sign-in screen.",
    };
  } finally {
    await secondaryAuth.signOut().catch(() => {});
    await deleteApp(secondary).catch(() => {});
  }
}

/** Changes someone's role. Owners only, enforced in rules. */
export async function setStaffRole(email: string, role: Role): Promise<void> {
  const { db } = getFirebase();
  await setDoc(doc(db, "staff", normalizeEmail(email)), { role }, { merge: true });
}

/**
 * Removes someone's access. The Firebase Auth account is left alone — deleting
 * it needs the Admin SDK, and it is not what revoking access means anyway.
 * Without a staff record the rules refuse them, which is the whole grant.
 */
export async function removeStaff(email: string): Promise<void> {
  const { db } = getFirebase();
  await deleteDoc(doc(db, "staff", normalizeEmail(email)));
}
