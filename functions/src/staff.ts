/**
 * Server-side mirror of apps/cms/src/lib/staff.ts's role table — just the
 * one lookup this project's callables need (is this caller allowed to send
 * The Bridge?). Kept separate from the client copy rather than shared via a
 * package: it reads with the Admin SDK, which has no client-side equivalent,
 * and the role table is two roles wide here, not the full CAPABILITIES map.
 */

import { getFirestore } from "firebase-admin/firestore";

export async function isSendCapable(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const snap = await getFirestore().collection("staff").doc(normalized).get();
  if (!snap.exists) return false;
  const data = snap.data() ?? {};
  return data.active === true && (data.role === "owner" || data.role === "chief");
}

/** Any active staff member, any role — the Inbox has no per-role gating, so replying doesn't either. */
export async function isActiveStaff(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const snap = await getFirestore().collection("staff").doc(normalized).get();
  if (!snap.exists) return false;
  return snap.data()?.active === true;
}

/** The role on an active staff record, or null if there isn't one (or it's inactive). See blocking.ts. */
export async function activeRoleOf(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const snap = await getFirestore().collection("staff").doc(normalized).get();
  if (!snap.exists) return null;
  const data = snap.data() ?? {};
  return data.active === true && typeof data.role === "string" ? data.role : null;
}
