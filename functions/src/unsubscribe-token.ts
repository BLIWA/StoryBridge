/**
 * A per-recipient unsubscribe link needs to prove it was actually generated
 * for that address, not just guessed — otherwise anyone could unsubscribe
 * anyone else by visiting the URL with their email swapped in. An HMAC over
 * the email, keyed by a secret only these Functions hold, is enough for
 * that: no database round-trip needed to issue a link, and
 * verifyUnsubscribeToken() below is what the unsubscribe endpoint checks
 * before touching Firestore.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const FUNCTIONS_BASE = "https://europe-west1-storybridge-eb71e.cloudfunctions.net";

function tokenFor(secret: string, email: string): string {
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex");
}

export function unsubscribeUrl(secret: string, email: string): string {
  const token = tokenFor(secret, email);
  return `${FUNCTIONS_BASE}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

export function verifyUnsubscribeToken(secret: string, email: string, token: string): boolean {
  const expected = Buffer.from(tokenFor(secret, email), "hex");
  const given = Buffer.from(token, "hex");
  // timingSafeEqual throws on a length mismatch rather than returning
  // false — a malformed/truncated token is common enough (someone editing
  // the URL by hand) that it shouldn't read as a crash.
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}
