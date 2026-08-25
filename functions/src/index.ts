/**
 * StoryBridge Cloud Functions — the Resend mail pipeline plus the
 * server-side half of contact-form reCAPTCHA. See the root README's
 * "roadmap" link for why this didn't exist before Blaze.
 *
 * Four functions:
 *  - onSubmissionCreated  Firestore trigger → notifies staff of a new enquiry
 *  - onSubscriberCreated  Firestore trigger → welcomes a new Bridge subscriber
 *  - submitContact        callable → verifies reCAPTCHA, writes the enquiry
 *                          (replaces the public site's direct Firestore
 *                          write — see firestore.rules)
 *  - sendBridgeTest       callable → one real test send of an in-progress
 *                          issue, to the signed-in staff member only
 *
 * All four run in europe-west1 — Cloud Functions has no eur3 (that's a
 * Firestore-only multi-region id), europe-west1 is the closest Blaze region
 * to the eur3 data.
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions/v2";

import { sendEmail } from "./resend";
import { contactNotification, subscriberWelcome, bridgeIssue } from "./templates";
import { verifyRecaptcha } from "./recaptcha";
import { isSendCapable } from "./staff";

initializeApp();
setGlobalOptions({ region: "europe-west1" });

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const RECAPTCHA_SECRET_KEY = defineSecret("RECAPTCHA_SECRET_KEY");

const FALLBACK_NOTIFY_EMAIL = process.env.NOTIFY_FALLBACK_EMAIL || "hello@storybridge.tn";

// Secret Manager won't hold an empty string, so the placeholder that ships
// before https://www.google.com/recaptcha/admin has been visited is this
// literal rather than "". See recaptcha.ts for what happens once a real
// secret replaces it (`firebase functions:secrets:set RECAPTCHA_SECRET_KEY`).
const RECAPTCHA_NOT_CONFIGURED = "not-configured";

/** Active owners/chiefs, or the fallback address if the roster is somehow empty. */
async function notifyRecipients(): Promise<string[]> {
  const snap = await getFirestore()
    .collection("staff")
    .where("active", "==", true)
    .where("role", "in", ["owner", "chief"])
    .get();
  const emails = snap.docs.map((d) => d.id);
  return emails.length > 0 ? emails : [FALLBACK_NOTIFY_EMAIL];
}

// ---------------------------------------------------------------------------

export const onSubmissionCreated = onDocumentCreated(
  { document: "submissions/{submissionId}", secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    const to = await notifyRecipients();
    const { subject, html, text } = contactNotification({
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      org: String(data.org ?? ""),
      need: String(data.need ?? ""),
      langs: String(data.langs ?? ""),
      deadline: String(data.deadline ?? ""),
      body: String(data.body ?? ""),
    });
    try {
      await sendEmail(RESEND_API_KEY.value(), {
        to,
        subject,
        html,
        text,
        replyTo: typeof data.email === "string" ? data.email : undefined,
      });
    } catch (err) {
      // A failed notification email must never look like a failed submission
      // to the visitor who already got their "thanks" screen — the enquiry
      // is safely in Firestore either way. Log for the desk to notice.
      logger.error("onSubmissionCreated: notification send failed", err);
    }
  },
);

export const onSubscriberCreated = onDocumentCreated(
  { document: "subscribers/{email}", secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    const email = event.params.email;
    const { subject, html, text } = subscriberWelcome(String(data.lang ?? "EN"));
    try {
      await sendEmail(RESEND_API_KEY.value(), { to: email, subject, html, text });
    } catch (err) {
      logger.error("onSubscriberCreated: welcome send failed", err);
    }
  },
);

// ---------------------------------------------------------------------------

type ContactInput = {
  name: string;
  email: string;
  organisation: string;
  need: string;
  languages: string;
  deadline: string;
  brief: string;
  honeypot: string;
  captchaToken?: string;
};

function isContactInput(v: unknown): v is ContactInput {
  const d = v as Partial<ContactInput> | null;
  return !!d && typeof d.name === "string" && typeof d.email === "string" && typeof d.brief === "string";
}

export const submitContact = onCall({ secrets: [RECAPTCHA_SECRET_KEY] }, async (request) => {
  const input = request.data;
  if (!isContactInput(input)) {
    throw new HttpsError("invalid-argument", "That form didn't come through right — please try again.");
  }

  // Bot-filled honeypot: pretend success, write nothing. Matches the
  // client's own honeypot handling in the pre-Function version of this form.
  if (input.honeypot) {
    return { ok: true };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const brief = input.brief.trim();
  if (!name || !email || !brief) {
    throw new HttpsError("invalid-argument", "Name, email and a brief are required.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "That doesn't look like an email address.");
  }

  const secret = RECAPTCHA_SECRET_KEY.value();
  if (secret && secret !== RECAPTCHA_NOT_CONFIGURED) {
    const verdict = await verifyRecaptcha(secret, input.captchaToken, "contact");
    if (!verdict.ok) {
      logger.warn("submitContact: reCAPTCHA rejected", { reason: verdict.reason });
      throw new HttpsError("failed-precondition", "Couldn't verify that submission. Please try again.");
    }
  } else {
    // Site/secret key pair not registered yet — see recaptcha.ts. Left open
    // rather than blocking every enquiry on a step only the project owner
    // can complete.
    logger.warn("submitContact: RECAPTCHA_SECRET_KEY not set — skipping verification");
  }

  await getFirestore()
    .collection("submissions")
    .add({
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      org: input.organisation.trim().slice(0, 200),
      need: input.need,
      langs: input.languages.trim().slice(0, 200),
      deadline: input.deadline.trim().slice(0, 100),
      body: brief.slice(0, 5000),
      status: "New",
      createdAt: new Date(),
    });

  // onSubmissionCreated picks up notification from here.
  return { ok: true };
});

// ---------------------------------------------------------------------------

type BridgeTestInput = { subject: string; preheader: string; picks: string[] };

function isBridgeTestInput(v: unknown): v is BridgeTestInput {
  const d = v as Partial<BridgeTestInput> | null;
  return !!d && typeof d.subject === "string" && typeof d.preheader === "string" && Array.isArray(d.picks);
}

export const sendBridgeTest = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  const callerEmail = request.auth?.token.email;
  if (!callerEmail) {
    throw new HttpsError("unauthenticated", "Sign in to send a test.");
  }
  if (!(await isSendCapable(callerEmail))) {
    throw new HttpsError("permission-denied", "Sending The Bridge is an owner and chief capability.");
  }

  const input = request.data;
  if (!isBridgeTestInput(input)) {
    throw new HttpsError("invalid-argument", "Missing subject, preview text, or picks.");
  }

  const { subject, html, text } = bridgeIssue({
    subject: input.subject,
    preheader: input.preheader,
    picks: input.picks.filter((p): p is string => typeof p === "string"),
    test: true,
  });

  await sendEmail(RESEND_API_KEY.value(), { to: callerEmail, subject, html, text });
  return { ok: true };
});
