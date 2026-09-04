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
import {
  contactNotification,
  subscriberWelcome,
  bridgeIssue,
  contactReply,
  unsubscribePage,
  DEFAULT_BRIDGE_SECTIONS,
  type BridgeArticlePick,
  type BridgeIssueSections,
} from "./templates";
import { verifyRecaptcha } from "./recaptcha";
import { isSendCapable, isActiveStaff } from "./staff";
import { unsubscribeUrl, verifyUnsubscribeToken } from "./unsubscribe-token";
import { resolveArticleContent, articleLeadImage, type LangCode } from "./locale-content";

/** storybridge.news is also the article-URL host — see apps/website/src/i18n/metadata.ts's SITE_URL. */
const SITE_URL = "https://storybridge.news";

/** Issue.audienceId ("all"|"en"|"fr"|"ar") → the locale a Bridge pick should be resolved in. "all" reads as English. */
function audienceLocale(audienceId: string): LangCode {
  return audienceId === "fr" || audienceId === "ar" ? (audienceId.toUpperCase() as LangCode) : "EN";
}

function parseBridgeSections(data: unknown): BridgeIssueSections {
  const d = (data ?? {}) as Partial<BridgeIssueSections>;
  return {
    showHero: typeof d.showHero === "boolean" ? d.showHero : DEFAULT_BRIDGE_SECTIONS.showHero,
    showQuote: typeof d.showQuote === "boolean" ? d.showQuote : DEFAULT_BRIDGE_SECTIONS.showQuote,
    quoteText: typeof d.quoteText === "string" ? d.quoteText : DEFAULT_BRIDGE_SECTIONS.quoteText,
    quoteAttribution: typeof d.quoteAttribution === "string" ? d.quoteAttribution : DEFAULT_BRIDGE_SECTIONS.quoteAttribution,
  };
}

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

// Real config for the contact form — see apps/cms/src/lib/contact-form-
// settings.ts for the CMS write side and apps/website/src/lib/contact-form-
// settings.ts for the live form's read side. These mirror the same defaults
// so an unset document (nobody has ever saved the form) behaves exactly
// like the old hardcoded version did.
type ContactFormSettings = {
  fields?: Partial<Record<"organisation" | "need" | "languages" | "deadline", { required?: boolean }>>;
  routing?: { sendTo?: string; assignMode?: string };
  protection?: { honeypotEnabled?: boolean; consentLine?: string };
};

const DEFAULT_FIELD_REQUIRED: Record<"organisation" | "need" | "languages" | "deadline", boolean> = {
  organisation: false,
  need: true,
  languages: false,
  deadline: false,
};

async function loadContactFormSettings(): Promise<ContactFormSettings> {
  const snap = await getFirestore().collection("settings").doc("contactForm").get();
  return (snap.data() as ContactFormSettings | undefined) ?? {};
}

/** The explicit override address if one's set, else the active owner/chief roster (or the fallback if that's empty). */
async function notifyRecipients(settings: ContactFormSettings): Promise<string[]> {
  const sendTo = settings.routing?.sendTo?.trim();
  if (sendTo) return [sendTo];
  const snap = await getFirestore()
    .collection("staff")
    .where("active", "==", true)
    .where("role", "in", ["owner", "chief"])
    .get();
  const emails = snap.docs.map((d) => d.id);
  return emails.length > 0 ? emails : [FALLBACK_NOTIFY_EMAIL];
}

/**
 * Who a new enquiry is assigned to: the explicit staff email in
 * `routing.assignMode`, if they're still active staff, otherwise (or for
 * the literal "roundRobin") the next name in an active-staff round robin.
 * The cursor lives in its own Function-only document, never exposed to
 * either app's client SDK — see the comment on settings/contactForm in
 * firestore.rules. Reading and incrementing it isn't wrapped in a
 * transaction: two enquiries landing in the same instant could get the
 * same cursor value and the same assignee, an occasional duplicate assign
 * accepted the same way an occasional duplicate Bridge send already is
 * elsewhere in this file, rather than adding transaction overhead to every
 * single submission for it.
 */
async function resolveAssignee(assignMode: string): Promise<string | undefined> {
  const staffSnap = await getFirestore().collection("staff").where("active", "==", true).get();
  const roster = staffSnap.docs.map((d) => d.id).sort();
  if (roster.length === 0) return undefined;

  if (assignMode !== "roundRobin" && roster.includes(assignMode)) return assignMode;

  const routingRef = getFirestore().collection("settings").doc("contactFormRouting");
  const routingSnap = await routingRef.get();
  const cursor = typeof routingSnap.data()?.roundRobinCursor === "number" ? routingSnap.data()!.roundRobinCursor : 0;
  const assignee = roster[cursor % roster.length];
  await routingRef.set({ roundRobinCursor: cursor + 1 }, { merge: true });
  return assignee;
}

// ---------------------------------------------------------------------------

export const onSubmissionCreated = onDocumentCreated(
  { document: "submissions/{submissionId}", secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    const to = await notifyRecipients(await loadContactFormSettings());
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
  { document: "subscribers/{email}", secrets: [RESEND_API_KEY, UNSUBSCRIBE_SECRET] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    const email = event.params.email;
    const { subject, html, text } = subscriberWelcome(
      String(data.lang ?? "EN"),
      unsubscribeUrl(UNSUBSCRIBE_SECRET.value(), email),
    );
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

  const settings = await loadContactFormSettings();
  const honeypotEnabled = settings.protection?.honeypotEnabled ?? true;

  // Bot-filled honeypot: pretend success, write nothing. Matches the
  // client's own honeypot handling in the pre-Function version of this
  // form. Skipped entirely when the CMS has turned the honeypot off — the
  // website then doesn't render the field either, see contact-form.tsx.
  if (honeypotEnabled && input.honeypot) {
    return { ok: true };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const brief = input.brief.trim();
  const organisation = String(input.organisation ?? "").trim();
  const need = String(input.need ?? "").trim();
  const languages = String(input.languages ?? "").trim();
  const deadline = String(input.deadline ?? "").trim();
  if (!name || !email || !brief) {
    throw new HttpsError("invalid-argument", "Name, email and a brief are required.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "That doesn't look like an email address.");
  }

  // The client already enforces these as `required` per settings/contactForm
  // (see contact-form.tsx), but a caller of this callable directly could
  // skip that — re-check server-side, same reasoning as name/email/brief above.
  const requiredFields = { ...DEFAULT_FIELD_REQUIRED, ...settings.fields } as Record<
    "organisation" | "need" | "languages" | "deadline",
    { required?: boolean } | boolean
  >;
  const isRequired = (key: "organisation" | "need" | "languages" | "deadline") => {
    const v = requiredFields[key];
    return typeof v === "boolean" ? v : (v?.required ?? DEFAULT_FIELD_REQUIRED[key]);
  };
  const FIELD_LABEL: Record<"organisation" | "need" | "languages" | "deadline", string> = {
    organisation: "Organisation",
    need: "What you need",
    languages: "Languages",
    deadline: "Deadline",
  };
  const values = { organisation, need, languages, deadline };
  for (const key of ["organisation", "need", "languages", "deadline"] as const) {
    if (isRequired(key) && !values[key]) {
      throw new HttpsError("invalid-argument", `${FIELD_LABEL[key]} is required.`);
    }
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

  const assignedTo = await resolveAssignee(settings.routing?.assignMode ?? "roundRobin");

  await getFirestore()
    .collection("submissions")
    .add({
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      org: organisation.slice(0, 200),
      need,
      langs: languages.slice(0, 200),
      deadline: deadline.slice(0, 100),
      body: brief.slice(0, 5000),
      status: "New",
      createdAt: new Date(),
      ...(assignedTo ? { assignedTo } : {}),
    });

  // onSubmissionCreated picks up notification from here.
  return { ok: true };
});

// ---------------------------------------------------------------------------

type BridgeTestInput = {
  subject: string;
  preheader: string;
  issueNo: string;
  issueDate: string | null;
  picks: BridgeArticlePick[];
  sections: BridgeIssueSections;
};

function isPick(v: unknown): v is BridgeArticlePick {
  const d = v as Partial<BridgeArticlePick> | null;
  return (
    !!d &&
    typeof d.title === "string" &&
    typeof d.excerpt === "string" &&
    typeof d.url === "string" &&
    (d.imageUrl === undefined || typeof d.imageUrl === "string") &&
    (d.imageAlt === undefined || typeof d.imageAlt === "string")
  );
}

function isSections(v: unknown): v is BridgeIssueSections {
  const d = v as Partial<BridgeIssueSections> | null;
  return (
    !!d &&
    typeof d.showHero === "boolean" &&
    typeof d.showQuote === "boolean" &&
    typeof d.quoteText === "string" &&
    typeof d.quoteAttribution === "string"
  );
}

function isBridgeTestInput(v: unknown): v is BridgeTestInput {
  const d = v as Partial<BridgeTestInput> | null;
  return (
    !!d &&
    typeof d.subject === "string" &&
    typeof d.preheader === "string" &&
    typeof d.issueNo === "string" &&
    (d.issueDate === null || typeof d.issueDate === "string") &&
    Array.isArray(d.picks) &&
    d.picks.every(isPick) &&
    isSections(d.sections)
  );
}

/**
 * The client (apps/cms/src/components/views/issues.tsx) already has full
 * Article data (translations, leadImage) in hand, so it resolves picks to
 * the composer's audience locale itself and sends the same shape the
 * scheduled send builds server-side — "Send test" and the real send produce
 * byte-identical HTML for the same input.
 */
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
    throw new HttpsError("invalid-argument", "Missing subject, preview text, issue number, picks, or sections.");
  }

  const { subject, html, text } = bridgeIssue({
    subject: input.subject,
    preheader: input.preheader,
    issueNo: input.issueNo,
    issueDate: input.issueDate,
    picks: input.picks,
    sections: input.sections,
    test: true,
    requesterEmail: callerEmail,
  });

  await sendEmail(RESEND_API_KEY.value(), { to: callerEmail, subject, html, text });
  return { ok: true };
});

// ---------------------------------------------------------------------------

type ReplyInput = {
  to: string;
  name: string;
  subject: string;
  body: string;
  /** The enquirer's original message and when they sent it, for the reply's quoted-original block (contactReply in templates.ts). Optional — inbox.tsx always has both to hand, but the reply still sends sensibly without them. */
  originalMessage?: string;
  submittedDate?: string;
};

function isReplyInput(v: unknown): v is ReplyInput {
  const d = v as Partial<ReplyInput> | null;
  return (
    !!d &&
    typeof d.to === "string" &&
    typeof d.name === "string" &&
    typeof d.subject === "string" &&
    typeof d.body === "string" &&
    (d.originalMessage === undefined || typeof d.originalMessage === "string") &&
    (d.submittedDate === undefined || typeof d.submittedDate === "string")
  );
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

  const { html, text } = contactReply({
    name: input.name,
    body: input.body,
    originalMessage: input.originalMessage,
    submittedDate: input.submittedDate,
  });
  try {
    await sendEmail(RESEND_API_KEY.value(), {
      to: input.to,
      subject: input.subject || "Re: your enquiry",
      html,
      text,
      // No explicit replyTo needed anymore — DEFAULT_FROM (resend.ts) is
      // already contact@storybridge.news now that the domain's verified,
      // so a reply to the From address already lands in the right inbox.
    });
  } catch (err) {
    logger.error("sendReply: send failed", err);
    throw new HttpsError(
      "internal",
      "Couldn't send that. Check the Cloud Functions logs for the underlying Resend error.",
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

        // The locale a recipient in this audience reads the site in — see
        // audienceLocale() above. resolveArticleContent() may still resolve
        // an individual pick to a *different* locale (its own primary
        // language) when it has no translation here — the link always
        // follows whichever locale the content actually resolved to, or it
        // 404s (apps/website's Journal has no cross-locale fallback).
        const localeCode = audienceLocale(audienceId);
        const pickIds: string[] = Array.isArray(issue.pickArticleIds) ? issue.pickArticleIds : [];
        const picks: BridgeArticlePick[] = [];
        for (const id of pickIds) {
          const articleSnap = await db.collection("articles").doc(id).get();
          if (!articleSnap.exists) continue;
          const data = articleSnap.data() ?? {};
          const content = resolveArticleContent(data, localeCode);
          if (!content.title || !content.slug) continue; // nothing real to link to
          const image = articleLeadImage(data);
          picks.push({
            title: content.title,
            excerpt: content.excerpt,
            url: `${SITE_URL}/${content.locale.toLowerCase()}/journal/${content.slug}`,
            imageUrl: image?.url,
            imageAlt: image?.alt || content.title,
          });
        }
        const sections = parseBridgeSections(issue.sections);

        if (recipients.length > 0) {
          const messages = recipients.map((email) => {
            const built = bridgeIssue({
              subject,
              preheader: String(issue.preheader ?? ""),
              issueNo,
              issueDate: typeof issue.date === "string" ? issue.date : null,
              picks,
              sections,
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
