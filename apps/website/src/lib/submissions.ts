/**
 * Contact-form submissions.
 *
 * Used to be a direct, unauthenticated Firestore write with firestore.rules
 * as the only gate. Now it goes through submitContact() — a Cloud Function
 * (functions/src/index.ts) that checks the reCAPTCHA v3 token before writing
 * anything, so firestore.rules denies public `create` on /submissions
 * outright (the Function's Admin SDK write bypasses rules, same as every
 * other privileged write in this project). See recaptcha in
 * components/contact-form.tsx for the client half.
 *
 * A successful write triggers onSubmissionCreated, which emails the active
 * owner/chief roster via Resend — the enquiry no longer sits unnoticed until
 * someone opens the CMS inbox.
 */

import { httpsCallable, type HttpsCallableResult } from "firebase/functions";
import { getFn } from "./firebase";

export type EnquiryInput = {
  name: string;
  email: string;
  organisation: string;
  need: string;
  languages: string;
  deadline: string;
  brief: string;
  /** Filled in only by a bot — a human never sees this field. */
  honeypot: string;
  /** From grecaptcha.execute() — undefined until NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set. */
  captchaToken?: string;
};

export class SubmissionError extends Error {}

export async function submitEnquiry(input: EnquiryInput): Promise<void> {
  if (!input.name.trim() || !input.email.trim() || !input.brief.trim()) {
    // Same client-side guard as before — the Function re-checks this
    // regardless, but there's no reason to round-trip an incomplete form.
    throw new SubmissionError("Name, email and a brief are required.");
  }

  const submitContact = httpsCallable<EnquiryInput, { ok: true }>(getFn(), "submitContact");
  let result: HttpsCallableResult<{ ok: true }>;
  try {
    result = await submitContact(input);
  } catch {
    throw new SubmissionError("Couldn't send that. Check your connection and try again.");
  }
  if (!result.data?.ok) {
    throw new SubmissionError("Couldn't send that. Check your connection and try again.");
  }
}
