/**
 * A thin wrapper over Resend's HTTP API — no SDK dependency, since the whole
 * surface this project needs is "POST one email" and "POST up to 100 in a
 * batch." Node 20's Cloud Functions runtime ships a global `fetch`, so there
 * is nothing to install for that either.
 *
 * `RESEND_API_KEY` comes in as a Firebase Secret (see index.ts), never a
 * plain env var — `firebase functions:secrets:set RESEND_API_KEY`.
 */

const RESEND_API = "https://api.resend.com";

// storybridge.news is verified as a sending domain in Resend as of 3 Sep
// 2026 (DKIM at resend._domainkey.storybridge.news, SPF/MX/bounce handling
// on send.storybridge.news, DMARC at _dmarc.storybridge.news — all present
// in DNS). Real sends now go out as StoryBridge <contact@storybridge.news>
// instead of Resend's sandbox sender. Override via the RESEND_FROM env var
// if that ever needs to change (e.g. a dedicated bridge@ sender) without a
// code change — still needs a `firebase deploy --only functions` to pick up
// a new functions/.env value, just not a source edit.
export const DEFAULT_FROM = process.env.RESEND_FROM || "StoryBridge <contact@storybridge.news>";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
};

export class ResendError extends Error {}

async function post(apiKey: string, path: string, body: unknown): Promise<void> {
  const res = await fetch(`${RESEND_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ResendError(`Resend ${path} → ${res.status}: ${detail.slice(0, 500)}`);
  }
}

export async function sendEmail(apiKey: string, input: SendEmailInput): Promise<void> {
  await post(apiKey, "/emails", {
    from: input.from ?? DEFAULT_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    reply_to: input.replyTo,
  });
}

/**
 * Resend's batch endpoint, for the newsletter send — one HTTP call per up to
 * 100 recipients rather than one per recipient. Each entry is its own
 * message (so unsubscribe/reply-to could vary per recipient later); today
 * every entry shares the same subject/html/text and differs only in `to`.
 */
export async function sendBatch(
  apiKey: string,
  messages: Array<{ to: string; subject: string; html: string; text: string; from?: string }>,
): Promise<void> {
  if (messages.length === 0) return;
  const CHUNK = 100;
  for (let i = 0; i < messages.length; i += CHUNK) {
    const chunk = messages.slice(i, i + CHUNK).map((m) => ({
      from: m.from ?? DEFAULT_FROM,
      to: m.to,
      subject: m.subject,
      html: m.html,
      text: m.text,
    }));
    await post(apiKey, "/emails/batch", chunk);
  }
}
