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
 * (functions/src/index.ts), which sends a welcome email via Resend —
 * storybridge.news is a verified sending domain as of 3 Sep 2026, so this
 * reaches the real address, not just the Resend account owner (see
 * functions/src/resend.ts). What still isn't real: confirming the address
 * is genuine (no double opt-in), and a self-service unsubscribe (the
 * per-recipient unsubscribe link only exists on Bridge issues today, see
 * unsubscribe-token.ts — a welcome email has nothing to unsubscribe from
 * yet).
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
