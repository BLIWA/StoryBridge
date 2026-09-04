import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "./firebase-client";

export class SubscribeError extends Error {}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Public, unauthenticated create — see firestore.rules. The email is the doc id, so a repeat signup overwrites rather than duplicates. */
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
