/**
 * Newsletter subscribers — same shape of write as lib/submissions.ts: a
 * public, unauthenticated Firestore create, validated by firestore.rules
 * rather than by any privileged code, because there isn't any yet (Blaze,
 * see the root README). The email itself is the document id, so a second
 * signup from the same address overwrites rather than duplicates.
 *
 * What this doesn't do: send anything, confirm the address is real, or
 * offer a self-service unsubscribe. The Bridge's actual send pipeline is
 * Cloud Functions + a transactional email provider — roadmap Phase 06,
 * blocked on Blaze and on picking that provider (still an open question).
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
