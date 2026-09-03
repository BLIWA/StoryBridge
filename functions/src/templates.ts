/**
 * Every outbound email shares one plain, brand-coloured wrapper rather than a
 * bespoke layout per message — three templates (contact notification,
 * subscriber welcome, Bridge issue) is not enough variety to justify a
 * templating library.
 */

const NAVY = "#002D62";
const BRONZE = "#B57D49";
const CREAM = "#FDF8F1";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrap(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${CREAM};font-family:Georgia,'Source Serif 4',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#FFFFFF;border:1px solid #E6E0D8;border-radius:8px;overflow:hidden;">
        <tr><td style="background:${NAVY};padding:22px 28px;">
          <span style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:${CREAM};">StoryBridge</span>
          <span style="font-family:monospace;font-size:10px;letter-spacing:0.14em;color:${BRONZE};margin-inline-start:10px;text-transform:uppercase;">Content &amp; Media</span>
        </tr></td>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:20px;color:${NAVY};">${escapeHtml(title)}</h1>
          <div style="font-family:'IBM Plex Sans',Arial,sans-serif;font-size:14.5px;line-height:1.7;color:#3E4650;">
            ${bodyHtml}
          </div>
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #EDE7DE;font-family:monospace;font-size:11px;color:#8A8378;">
          StoryBridge Content &amp; Media · contact@storybridge.news
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function contactNotification(input: {
  name: string;
  email: string;
  org: string;
  need: string;
  langs: string;
  deadline: string;
  body: string;
}): { subject: string; html: string; text: string } {
  const subject = `New enquiry — ${input.name}${input.org ? ` (${input.org})` : ""}`;
  const rows: Array<[string, string]> = [
    ["From", `${input.name} <${input.email}>`],
    ["Organisation", input.org || "—"],
    ["Need", input.need || "—"],
    ["Languages", input.langs || "—"],
    ["Deadline", input.deadline || "—"],
  ];
  const html = wrap(
    "New enquiry via the contact form",
    `<table role="presentation" style="width:100%;margin-bottom:18px;">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 0;color:#8A8378;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;width:120px;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:4px 0;">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <div style="border-top:1px solid #EDE7DE;padding-top:14px;white-space:pre-wrap;">${escapeHtml(input.body)}</div>
    <p style="margin-top:22px;"><a href="https://cms.storybridge.news" style="color:${BRONZE};font-weight:600;">Open the CMS inbox →</a></p>`,
  );
  const text = `New enquiry via the contact form\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${input.body}\n\nOpen the CMS inbox: https://cms.storybridge.news`;
  return { subject, html, text };
}

/** The plain confirmation page the unsubscribe link (index.ts) lands on — not an email, so it skips wrap(). */
export function unsubscribePage(message: string, ok: boolean): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>The Bridge</title></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:48px 16px;min-height:100vh;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px;background:#FFFFFF;border:1px solid #E6E0D8;border-radius:8px;overflow:hidden;">
        <tr><td style="background:${NAVY};padding:22px 28px;">
          <span style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:${CREAM};">StoryBridge</span>
        </tr></td>
        <tr><td style="padding:32px 28px;font-family:'IBM Plex Sans',Arial,sans-serif;font-size:15px;line-height:1.7;color:${ok ? "#3E4650" : "#8A3B3B"};">
          ${escapeHtml(message)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** A staff reply to a contact-form enquiry — see the sendReply callable in index.ts. */
export function contactReply(input: { name: string; body: string }): { html: string; text: string } {
  const html = wrap(
    `Hi ${escapeHtml(input.name)},`,
    `<div style="white-space:pre-wrap;">${escapeHtml(input.body)}</div>`,
  );
  const text = `Hi ${input.name},\n\n${input.body}`;
  return { html, text };
}

export function subscriberWelcome(lang: string): { subject: string; html: string; text: string } {
  // Only English copy for now — the site's fr/ar catalogs live in
  // packages/content, not here; a trilingual transactional template is a
  // reasonable follow-up once the subscriber's chosen language is worth
  // routing on for more than the newsletter itself.
  void lang;
  const subject = "Welcome to The Bridge";
  const html = wrap(
    "You're on the list",
    `<p>Thanks for subscribing to The Bridge, StoryBridge's newsletter — a monthly note on translation, editorial craft, and what we're working on.</p>
     <p>The first issue reaches you the next time we send one. No spam, no list-selling, no cookies involved in getting you here.</p>
     <p style="margin-top:22px;"><a href="https://storybridge.news" style="color:${BRONZE};font-weight:600;">Visit storybridge.news →</a></p>`,
  );
  const text = "You're on the list.\n\nThanks for subscribing to The Bridge, StoryBridge's newsletter. The first issue reaches you the next time we send one.";
  return { subject, html, text };
}

export function bridgeIssue(input: {
  subject: string;
  preheader: string;
  picks: string[];
  test: boolean;
  /** Set only on a real send — a per-recipient unsubscribe link. Omitted on a test send: there's no subscriber to unsubscribe. */
  unsubscribeUrl?: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = input.test ? `[TEST] ${input.subject}` : input.subject;
  const footer = input.unsubscribeUrl
    ? `<p style="margin-top:26px;font-size:11px;color:#8A8378;"><a href="${input.unsubscribeUrl}" style="color:#8A8378;">Unsubscribe from The Bridge</a></p>`
    : "";
  const html = wrap(
    input.subject,
    `<p style="color:#8A8378;font-size:13px;">${escapeHtml(input.preheader)}</p>
     ${input.test ? `<p style="background:#F8F4EE;border:1px solid #E6E0D8;padding:10px 14px;border-radius:4px;font-family:monospace;font-size:11px;color:${BRONZE};">TEST COPY — sent only to you, not to subscribers.</p>` : ""}
     <ul style="padding-inline-start:20px;">
       ${input.picks.map((p) => `<li style="margin-bottom:8px;">${escapeHtml(p)}</li>`).join("")}
     </ul>${footer}`,
  );
  const unsubLine = input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : "";
  const text = `${input.subject}\n${input.preheader}\n\n${input.picks.map((p) => `- ${p}`).join("\n")}${unsubLine}`;
  return { subject, html, text };
}
