/**
 * Newsletter subscribers — a public, unauthenticated Firestore create,
 * validated by firestore.rules rather than by a Cloud Function. Unlike the
 * contact form (see lib/submissions.ts), this write stays direct: there is
 * no captcha requirement on it (see the root's open questions — the user
 * asked for captcha protection on the contact form specifically), so there
 * was nothing to gate it on a Function for. The email itself is the
 * document id, so a second signup from the same address overwrites rather
 * than duplicates.
 *
 * What is real now: the write triggers onSubscriberCreated
 * (functions/src/index.ts), which sends a welcome email via Resend. What
 * still isn't: confirming the address is real (no double opt-in), a
 * self-service unsubscribe, and — until storybridge.tn is a verified
 * sending domain on Resend — delivery to anyone but the Resend account
 * owner (Resend's sandbox sender can only reach its own account's address;
 * see functions/src/resend.ts).
 */

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "./firebase";

export class SubscribeError extends Error {}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function subscribe(email: string, options: { lang: string; source: string }): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new SubscribeError("That doesn't look like an email address.");
  }

  await setDoc(doc(getDb(), "subscribers", normalized), {
    status: "Subscribed",
    lang: options.lang.toUpperCase(),
    source: options.source,
    subscribedAt: serverTimestamp(),
  });
}
