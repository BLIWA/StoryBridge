/**
 * Read-only copy of the contact form's real config, `settings/contactForm`
 * — written from the CMS (apps/cms/src/lib/contact-form-settings.ts, same
 * normalize logic, kept separate rather than shared since the CMS's own
 * settings screen doesn't otherwise depend on this package). Public read,
 * per firestore.rules.
 *
 * Fetched once on mount rather than watched live: the form doesn't need to
 * react to a mid-session config change, and a plain read means one fewer
 * open listener. A read failure (or the doc not existing yet) falls back to
 * defaults rather than blocking the form.
 */

import { doc, getDoc } from "firebase/firestore";
import { getDb } from "./firebase-client";

export type ContactFormSettings = {
  /** Required flags for the fields that are configurable — name/email/brief always stay required. */
  fields: { organisation: boolean; need: boolean; languages: boolean; deadline: boolean };
  honeypotEnabled: boolean;
  consentLine: string;
};

export const DEFAULT_CONTACT_FORM_SETTINGS: ContactFormSettings = {
  fields: { organisation: false, need: true, languages: false, deadline: false },
  honeypotEnabled: true,
  consentLine: "We use what you send only to answer your enquiry. We never sell or share it.",
};

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export async function fetchContactFormSettings(): Promise<ContactFormSettings> {
  const d = DEFAULT_CONTACT_FORM_SETTINGS;
  try {
    const snap = await getDoc(doc(getDb(), "settings", "contactForm"));
    const data = snap.data();
    if (!data) return d;
    const f = (data.fields ?? {}) as Record<string, { required?: unknown } | undefined>;
    const p = (data.protection ?? {}) as Record<string, unknown>;
    return {
      fields: {
        organisation: bool(f.organisation?.required, d.fields.organisation),
        need: bool(f.need?.required, d.fields.need),
        languages: bool(f.languages?.required, d.fields.languages),
        deadline: bool(f.deadline?.required, d.fields.deadline),
      },
      honeypotEnabled: bool(p.honeypotEnabled, d.honeypotEnabled),
      consentLine: typeof p.consentLine === "string" && p.consentLine.trim() ? p.consentLine : d.consentLine,
    };
  } catch {
    return d;
  }
}
