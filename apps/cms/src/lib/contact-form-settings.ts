/**
 * Real config for the public contact form — `settings/contactForm`. Read by
 * both this CMS screen (components/views/inbox.tsx's "Contact form fields"
 * tab) and the live website form (apps/website/src/lib/contact-form-settings.ts,
 * a separate read-only copy of the normalize logic — the website has no
 * reason to import from the CMS app). Also read by functions/src/index.ts's
 * submitContact/onSubmissionCreated via the Admin SDK, which bypasses rules.
 *
 * Deliberately bounded: this configures the *existing* seven fields (which
 * ones are required, where enquiries route, honeypot/consent) rather than
 * letting the field list itself be edited — the website form's inputs and
 * translations are still fixed JSX, not schema-driven. See firestore.rules
 * for the public-read/staff-write split.
 *
 * `routing.assignMode` is either the literal "roundRobin" or a specific
 * staff email. The round-robin cursor itself lives in a separate,
 * Function-only document (`settings/contactFormRouting`, see
 * functions/src/index.ts) — never read or written from here, so a CMS save
 * can never clobber it.
 */

import { doc, onSnapshot, setDoc, serverTimestamp, type Firestore } from "firebase/firestore";

export type ContactFormSettings = {
  fields: {
    organisation: { required: boolean };
    need: { required: boolean };
    languages: { required: boolean };
    deadline: { required: boolean };
  };
  routing: {
    /** Empty = notify the active owner/chief roster (today's behaviour). */
    sendTo: string;
    /** "roundRobin" or one staff member's email. */
    assignMode: string;
  };
  protection: {
    honeypotEnabled: boolean;
    consentLine: string;
  };
};

/** Matches what was hardcoded before this went real — nothing changes for anyone until a save happens. */
export const DEFAULT_CONTACT_FORM_SETTINGS: ContactFormSettings = {
  fields: {
    organisation: { required: false },
    need: { required: true },
    languages: { required: false },
    deadline: { required: false },
  },
  routing: { sendTo: "", assignMode: "roundRobin" },
  protection: {
    honeypotEnabled: true,
    consentLine: "We use what you send only to answer your enquiry. We never sell or share it.",
  },
};

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function normalize(data: Record<string, unknown> | undefined): ContactFormSettings {
  const d = DEFAULT_CONTACT_FORM_SETTINGS;
  if (!data) return d;
  const f = (data.fields ?? {}) as Record<string, { required?: unknown } | undefined>;
  const r = (data.routing ?? {}) as Record<string, unknown>;
  const p = (data.protection ?? {}) as Record<string, unknown>;
  return {
    fields: {
      organisation: { required: bool(f.organisation?.required, d.fields.organisation.required) },
      need: { required: bool(f.need?.required, d.fields.need.required) },
      languages: { required: bool(f.languages?.required, d.fields.languages.required) },
      deadline: { required: bool(f.deadline?.required, d.fields.deadline.required) },
    },
    routing: {
      sendTo: typeof r.sendTo === "string" ? r.sendTo.trim() : d.routing.sendTo,
      assignMode: typeof r.assignMode === "string" && r.assignMode ? r.assignMode : d.routing.assignMode,
    },
    protection: {
      honeypotEnabled: bool(p.honeypotEnabled, d.protection.honeypotEnabled),
      consentLine: typeof p.consentLine === "string" ? p.consentLine : d.protection.consentLine,
    },
  };
}

export function watchContactFormSettings(
  db: Firestore,
  onChange: (settings: ContactFormSettings) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    doc(db, "settings", "contactForm"),
    (snap) => onChange(normalize(snap.data())),
    onError,
  );
}

export async function saveContactFormSettings(db: Firestore, settings: ContactFormSettings): Promise<void> {
  await setDoc(doc(db, "settings", "contactForm"), { ...settings, updatedAt: serverTimestamp() });
}
