/**
 * Contact-form submissions — the website's first real Firestore write.
 *
 * No Cloud Function sits behind this (see the root README on Blaze): a
 * submission lands directly in Firestore from the visitor's browser, the
 * same way a staff member's own arrival gets stamped in lib/staff.ts.
 * firestore.rules is the only thing standing between the public internet
 * and this collection — it validates shape and field lengths, since unlike
 * every other collection in this app, the writer here is never staff.
 *
 * What this deliberately doesn't do: notify anyone, route to a person, or
 * check for spam beyond a honeypot field. Real enquiry routing and outbound
 * email are Cloud Functions work — roadmap Phase 06, blocked on Blaze.
 */

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDb } from "./firebase";

export type EnquiryInput = {
  name: string;
  email: string;
  organisation: string;
  need: string;
  languages: string;
  deadline: string;
  brief: string;
  /** Filled in only by a bot — a human never sees this field. Reject if non-empty. */
  honeypot: string;
};

export class SubmissionError extends Error {}

export async function submitEnquiry(input: EnquiryInput): Promise<void> {
  if (input.honeypot) {
    // Silently succeed from the bot's point of view; don't write anything.
    return;
  }
  if (!input.name.trim() || !input.email.trim() || !input.brief.trim()) {
    throw new SubmissionError("Name, email and a brief are required.");
  }

  await addDoc(collection(getDb(), "submissions"), {
    name: input.name.trim().slice(0, 200),
    email: input.email.trim().slice(0, 200),
    org: input.organisation.trim().slice(0, 200),
    need: input.need,
    langs: input.languages.trim().slice(0, 200),
    deadline: input.deadline.trim().slice(0, 100),
    body: input.brief.trim().slice(0, 5000),
    status: "New",
    createdAt: serverTimestamp(),
  });
}
