/**
 * StoryBridge Cloud Functions — the Resend mail pipeline plus the
 * server-side half of contact-form reCAPTCHA. See the root README's
 * "roadmap" link for why this didn't exist before Blaze.
 *
 * Eight functions:
 *  - onSubmissionCreated  Firestore trigger → notifies staff of a new enquiry
 *  - onSubscriberCreated  Firestore trigger → welcomes a new Bridge subscriber
 *  - submitContact        callable → verifies reCAPTCHA, writes the enquiry
 *                          (replaces the public site's direct Firestore
 *                          write — see firestore.rules)
 *  - sendBridgeTest       callable → one real test send of an in-progress
 *                          issue, to the signed-in staff member only
 *  - sendReply            callable → a staff member's reply to an enquiry,
 *                          sent to the enquirer directly (any active staff,
 *                          not just owner/chief — matches the Inbox, which
 *                          has no per-role gating either)
 *  - enforceContributorGeoRestriction  Auth blocking function (blocking.ts)
 *                          → the "outside Tunisia" switch in Settings
 *  - sendScheduledBridgeIssues  scheduled (every 5 min) → the actual send
 *                          pipeline for The Bridge; see lib/bridge-issues.ts
 *  - unsubscribe           onRequest → the link in every real Bridge send
 *
 * All eight run in europe-west1 — Cloud Functions has no eur3 (that's a
 * Firestore-only multi-region id), europe-west1 is the closest Blaze region
 * to the eur3 data.
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore, type Query } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions/v2";

import { sendEmail, sendBatch } from "./resend";
import { contactNotification, subscriberWelcome, bridgeIssue, contactReply, unsubscribePage } from "./templates";
import { verifyRecaptcha } from "./recaptcha";
import { isSendCapable, isActiveStaff } from "./staff";
import { unsubscribeUrl, verifyUnsubscribeToken } from "./unsubscribe-token";

export { enforceContributorGeoRestriction } from "./blocking";

initializeApp();
setGlobalOptions({ region: "europe-west1" });

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const RECAPTCHA_SECRET_KEY = defineSecret("RECAPTCHA_SECRET_KEY");
const UNSUBSCRIBE_SECRET = defineSecret("UNSUBSCRIBE_SECRET");

const FALLBACK_NOTIFY_EMAIL = process.env.NOTIFY_FALLBACK_EMAIL || "contact@storybridge.news";

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

// ---------------------------------------------------------------------------

type ReplyInput = { to: string; name: string; subject: string; body: string };

function isReplyInput(v: unknown): v is ReplyInput {
  const d = v as Partial<ReplyInput> | null;
  return !!d && typeof d.to === "string" && typeof d.name === "string" && typeof d.subject === "string" && typeof d.body === "string";
}

export const sendReply = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  const callerEmail = request.auth?.token.email;
  if (!callerEmail) {
    throw new HttpsError("unauthenticated", "Sign in to reply.");
  }
  if (!(await isActiveStaff(callerEmail))) {
    throw new HttpsError("permission-denied", "Only staff can reply to enquiries.");
  }

  const input = request.data;
  if (!isReplyInput(input) || !input.to.trim() || !input.body.trim()) {
    throw new HttpsError("invalid-argument", "Missing recipient or reply text.");
  }

  const { html, text } = contactReply({ name: input.name, body: input.body });
  try {
    await sendEmail(RESEND_API_KEY.value(), {
      to: input.to,
      subject: input.subject || "Re: your enquiry",
      html,
      text,
      // contact@storybridge.news isn't a verified Resend sender yet (see
      // resend.ts's DEFAULT_FROM) — routing replies there instead of
      // making it the From address means at least the enquirer sees a
      // real inbox to write back to, even while the send itself still
      // comes from Resend's sandbox address.
      replyTo: "contact@storybridge.news",
    });
  } catch (err) {
    logger.error("sendReply: send failed", err);
    throw new HttpsError(
      "internal",
      "Couldn't send that. If the recipient isn't the Resend account owner, this is almost certainly the sandbox-sender limit in resend.ts — storybridge.news needs to be a verified Resend domain first.",
    );
  }

  // Marking the submission Replied stays a client-side write (setSubmissionStatus,
  // already allowed by firestore.rules for any active staff member) rather
  // than something this function also does — no reason to hand this
  // function Firestore-write scope it doesn't otherwise need.
  return { ok: true };
});

// ---------------------------------------------------------------------------

/**
 * The actual send pipeline for The Bridge. Everything in
 * apps/cms/src/components/views/issues.tsx up to "Schedule send" is
 * composing and bookkeeping; this is the one thing in that whole flow that
 * reaches a subscriber's inbox. Runs every 5 minutes, picks up any issue
 * whose scheduled instant has arrived, and sends it.
 *
 * A failed issue is deliberately left `Scheduled` rather than marked
 * failed or Sent — the next tick retries it. That risks a duplicate send
 * if the failure happened after Resend accepted the batch but before this
 * function could write `status: 'Sent'` back; there is no dedupe / idempotency
 * key on the send itself. Accepted for now: at this project's volume, an
 * occasional duplicate newsletter is a far smaller problem than a send that
 * silently never goes out and never retries.
 */
export const sendScheduledBridgeIssues = onSchedule(
  { schedule: "every 5 minutes", secrets: [RESEND_API_KEY, UNSUBSCRIBE_SECRET] },
  async () => {
    const db = getFirestore();
    const now = Date.now();
    const due = await db.collection("bridgeIssues").where("status", "==", "Scheduled").where("sendAt", "<=", now).get();
    if (due.empty) return;

    for (const issueDoc of due.docs) {
      const issue = issueDoc.data();
      const issueNo = String(issue.no ?? "");
      const subject = String(issue.subject ?? "");
      try {
        let subsQuery: Query = db.collection("subscribers").where("status", "==", "Subscribed");
        const audienceId = typeof issue.audienceId === "string" ? issue.audienceId : "all";
        if (audienceId !== "all") {
          subsQuery = subsQuery.where("lang", "==", audienceId.toUpperCase());
        }
        const subsSnap = await subsQuery.get();
        const recipients = subsSnap.docs.map((d) => d.id);

        const pickIds: string[] = Array.isArray(issue.pickArticleIds) ? issue.pickArticleIds : [];
        const picks: string[] = [];
        for (const id of pickIds) {
          const articleSnap = await db.collection("articles").doc(id).get();
          if (articleSnap.exists) picks.push(String(articleSnap.data()?.title ?? id));
        }

        if (recipients.length > 0) {
          const messages = recipients.map((email) => {
            const built = bridgeIssue({
              subject,
              preheader: String(issue.preheader ?? ""),
              picks,
              test: false,
              unsubscribeUrl: unsubscribeUrl(UNSUBSCRIBE_SECRET.value(), email),
            });
            return { to: email, subject: built.subject, html: built.html, text: built.text };
          });
          await sendBatch(RESEND_API_KEY.value(), messages);
        }

        await issueDoc.ref.set(
          { status: "Sent", recipients: recipients.length, stats: `${recipients.length} sent`, sentAt: now },
          { merge: true },
        );
        await db.collection("bridgeLog").add({
          at: new Date(),
          issueNo,
          subject,
          action: "Sent",
          detail: `${recipients.length} delivered`,
          actor: "Scheduler",
        });
      } catch (err) {
        logger.error(`sendScheduledBridgeIssues: issue ${issueDoc.id} (No. ${issueNo}) failed`, err);
        // Left as `Scheduled` — see the doc comment above.
      }
    }
  },
);

/**
 * The link at the bottom of every real Bridge send. Deliberately not staff-
 * gated (a subscriber isn't signed in) — the HMAC token in
 * unsubscribe-token.ts is what stops this from being "anyone can
 * unsubscribe anyone," not an auth check.
 */
export const unsubscribe = onRequest({ secrets: [UNSUBSCRIBE_SECRET] }, async (req, res) => {
  const email = String(req.query.email ?? "");
  const token = String(req.query.token ?? "");

  if (!email || !token || !verifyUnsubscribeToken(UNSUBSCRIBE_SECRET.value(), email, token)) {
    res.status(400).send(unsubscribePage("That unsubscribe link isn't valid.", false));
    return;
  }

  try {
    await getFirestore()
      .collection("subscribers")
      .doc(email.trim().toLowerCase())
      .set({ status: "Unsubscribed" }, { merge: true });
    res.status(200).send(unsubscribePage(`${email} is unsubscribed from The Bridge.`, true));
  } catch (err) {
    logger.error("unsubscribe: write failed", err);
    res.status(500).send(unsubscribePage("Something went wrong. Try again in a moment.", false));
  }
});
