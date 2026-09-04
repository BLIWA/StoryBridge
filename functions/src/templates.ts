/**
 * Every outbound email's markup, ported from "StoryBridge Email Templates.html"
 * — the design reference for all five of the templates this project actually
 * sends through Resend (the other two, password reset and invite, are still
 * Firebase Auth's own default email; see index.ts). richDocument()/richHeader()/
 * richFooter()/richDivider()/richButton() below are the shared fragments those
 * five are built from; bridgeIssue() is the one exception that keeps its own
 * copy of the document boilerplate (see its comment for why).
 */

const NAVY = "#002D62";
const BRONZE = "#B57D49";
const CREAM = "#FDF8F1";
const BRONZE_DARK = "#8F6135";
const INK = "#3E4650";
const MUTED = "#5A6472";
const FAINT = "#8A8378";
const GUTTER = "#E4DED6";
const DIVIDER = "#D8D1C7";
const SWATCH_BG = "#EFE8DC";
const SWATCH_BORDER = "#DCD2BE";
const QUOTE_BG = "#F4EFE7";
const FOOTER_MUTED = "#B9C2D0";
const FOOTER_FAINT = "#8FA0BC";
const MARK_URL = "https://storybridge.news/assets/storybridge-mark.png";

// Decorative textures — a quote-mark watermark (header, pull quote) and a
// bridge-arc watermark (footer). These used to be inline `data:image/svg+xml`
// URIs; Gmail (web and its iOS/Android apps — unlike Apple Mail, which never
// had a problem with this) strips `data:` URIs from CSS background-image,
// so the watermarks silently disappeared there while looking fine
// everywhere else. Hosting the exact same SVGs as real files under
// storybridge.news/assets (same convention as MARK_URL below) fixes it —
// Gmail's proxy loads a normal image URL the same as any other client. The
// source files live at apps/website/public/assets/email-*.svg.
const HEADER_TEXTURE = "https://storybridge.news/assets/email-header-texture.svg";
const QUOTE_TEXTURE = "https://storybridge.news/assets/email-quote-texture.svg";
const FOOTER_TEXTURE = "https://storybridge.news/assets/email-footer-texture.svg";
// Same Gmail issue applies to CSS gradients, not just data URIs — Gmail
// doesn't support `background-image: repeating-linear-gradient(...)`
// either. These are the two placeholder swatches bridgeIssue() shows when
// a picked article has no lead image, now backed by hosted tile images too.
const SWATCH_TEXTURE_LG = "https://storybridge.news/assets/email-swatch-lg.svg";
const SWATCH_TEXTURE_SM = "https://storybridge.news/assets/email-swatch-sm.svg";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The full boilerplate (doctype/head/Outlook-safe style block) shared by
 * every "rich" table-based email below — subscriberWelcome, contactReply,
 * contactNotification — ported from the "StoryBridge Email Templates.html"
 * design file. bridgeIssue() keeps its own copy of the same boilerplate
 * inline (see its comment) since it predates this helper and is the one
 * template already proven in a real send; not worth the risk of
 * refactoring a working production template just to share this.
 */
function richDocument(input: { title: string; preheader?: string; bodyRows: string }): string {
  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(input.title)}</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img{ -ms-interpolation-mode:bicubic; border:0; line-height:100%; outline:none; text-decoration:none; }
  body{ margin:0; padding:0; width:100% !important; height:100% !important; }
  a[x-apple-data-detectors]{ color:inherit !important; text-decoration:none !important; }
  @media screen and (max-width:600px){
    .sb-wrap{ width:100% !important; }
    .sb-px{ padding-left:20px !important; padding-right:20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${GUTTER};">
${
  input.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${GUTTER};opacity:0;">
${escapeHtml(input.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>`
    : ""
}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${GUTTER};">
<tr>
<td align="center" style="padding:32px 16px;">

<table role="presentation" class="sb-wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${CREAM};">
${input.bodyRows}
</table>
</td>
</tr>
</table>

</body>
</html>`;
}

/** Header row shared by every richDocument() email — wordmark left, a small caps label right. */
function richHeader(rightLabel: string): string {
  return `<tr>
<td class="sb-px" style="padding:36px 48px 24px 48px;border-bottom:2px solid ${NAVY};background-color:${CREAM};background-image:url('${HEADER_TEXTURE}');background-repeat:repeat;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left" valign="middle">
<img src="${MARK_URL}" width="34" height="34" alt="StoryBridge" style="display:inline-block;vertical-align:middle;width:34px;height:34px;">
<span style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:22px;color:${NAVY};letter-spacing:-0.01em;vertical-align:middle;padding-left:10px;">StoryBridge</span>
</td>
<td align="right" valign="middle" style="font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:0.12em;color:${BRONZE_DARK};text-transform:uppercase;">${escapeHtml(rightLabel)}</td>
</tr>
</table>
</td>
</tr>`;
}

/** Footer row shared by every richDocument() email. `lines` is 1+ lines of already-safe inline HTML under the wordmark — every line but the last renders muted with extra bottom padding, the last renders faint (matches bridgeIssue()'s footer). */
function richFooter(lines: string[]): string {
  const rows = lines
    .map((line, i) => {
      const isLast = i === lines.length - 1;
      return `<tr><td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:${isLast ? "1.7" : "1.6"};color:${isLast ? FOOTER_FAINT : FOOTER_MUTED};${isLast ? "" : "padding-bottom:14px;"}">${line}</td></tr>`;
    })
    .join("\n");
  return `<tr>
<td bgcolor="${NAVY}" style="padding:32px 48px;background-color:${NAVY};background-image:url('${FOOTER_TEXTURE}');background-repeat:repeat;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:16px;color:${CREAM};padding-bottom:6px;">StoryBridge Content &amp; Media</td></tr>
${rows}
</table>
</td>
</tr>`;
}

/** Hairline divider row, same as bridgeIssue()'s. */
function richDivider(): string {
  return `<tr><td class="sb-px" style="padding:0 48px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${DIVIDER};font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td></tr>`;
}

/** The navy CTA button used across every email. */
function richButton(href: string, label: string): string {
  return `<tr>
<td class="sb-px" style="padding:0 48px 40px 48px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td bgcolor="${NAVY}" style="border-radius:4px;">
<a href="${escapeHtml(href)}" target="_blank" style="display:block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${CREAM};text-decoration:none;border-radius:4px;">${escapeHtml(label)} &rarr;</a>
</td>
</tr>
</table>
</td>
</tr>`;
}

function richEyebrow(text: string): string {
  return `<tr><td class="sb-px" style="padding:40px 48px 0 48px;"><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:${BRONZE_DARK};">${escapeHtml(text)}</span></td></tr>`;
}

function richTitle(text: string): string {
  return `<tr><td class="sb-px" style="padding:12px 48px 0 48px;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:32px;line-height:1.2;color:${NAVY};">${escapeHtml(text)}</td></tr>`;
}

/**
 * Ported from the "New enquiry notification" design (template 7 of
 * "StoryBridge Email Templates.html"): a bordered detail table plus a CTA
 * button, rather than the old plain wrap() row list. The reference file's
 * button links to a per-submission CMS route (`studio.storybridge.tn/inbox/{id}`)
 * that doesn't exist — the real CMS domain is cms.storybridge.news
 * (apps/cms/src/app/layout.tsx) and it's a single-page view-switcher with
 * no deep-linkable submission route, so this keeps linking to the plain
 * inbox, same as before. It also keeps Organisation/Need/Languages/Deadline
 * in the detail table — real fields the contact form collects that the
 * reference file's simpler 3-row mockup dropped.
 */
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
  const fieldRows: Array<[string, string]> = [
    ["Name", input.name || "—"],
    ["Organisation", input.org || "—"],
    ["Email", input.email || "—"],
    ["Need", input.need || "—"],
    ["Languages", input.langs || "—"],
    ["Deadline", input.deadline || "—"],
  ];
  const detailTable = `<tr><td class="sb-px" style="padding:0 48px 28px 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${DIVIDER};">
${fieldRows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:14px 20px;border-bottom:1px solid ${DIVIDER};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${FAINT};width:120px;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:14px 20px;border-bottom:1px solid ${DIVIDER};font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${NAVY};${k === "Name" ? "font-weight:bold;" : ""}">${escapeHtml(v)}</td></tr>`,
  )
  .join("\n")}
<tr><td valign="top" style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${FAINT};">Message</td><td style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${INK};white-space:pre-wrap;">${escapeHtml(input.body)}</td></tr>
</table>
</td></tr>`;

  const html = richDocument({
    title: subject,
    bodyRows: [
      richHeader("Studio Alert"),
      richEyebrow("New enquiry"),
      richTitle("New contact form submission"),
      `<tr><td class="sb-px" style="padding:20px 48px 24px 48px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${INK};">Someone reached out through storybridge.news. Reply from the Studio Inbox when you're ready.</td></tr>`,
      detailTable,
      richButton("https://cms.storybridge.news", "View in CMS"),
      richDivider(),
      richFooter(["This is an automated notification sent to active owners and chief editors."]),
    ].join("\n"),
  });

  const text = `New enquiry via the contact form\n\n${fieldRows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${input.body}\n\nOpen the CMS inbox: https://cms.storybridge.news`;
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

/**
 * A staff reply to a contact-form enquiry — see the sendReply callable in
 * index.ts. Ported from the "Contact-form reply" design (template 6): the
 * plain wrap() layout gains a bordered/italic quote of the enquirer's
 * original message, when the caller has it to hand.
 */
export function contactReply(input: {
  name: string;
  body: string;
  originalMessage?: string;
  submittedDate?: string;
}): { html: string; text: string } {
  const quoteBlock = input.originalMessage
    ? `<tr><td class="sb-px" style="padding:0 48px 40px 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="border-left:3px solid ${BRONZE};padding:20px 24px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:16px;line-height:1.55;color:${NAVY};background-color:${QUOTE_BG};">
&ldquo;${escapeHtml(input.originalMessage)}&rdquo;
<div style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-style:normal;font-size:13px;color:${BRONZE_DARK};">&mdash; Your original message${input.submittedDate ? `, ${escapeHtml(input.submittedDate)}` : ""}</div>
</td>
</tr></table>
</td></tr>`
    : "";

  const html = richDocument({
    title: "Re: your message",
    bodyRows: [
      richHeader("Support"),
      richEyebrow("Re: your message"),
      richTitle("Thanks for reaching out"),
      `<tr><td class="sb-px" style="padding:20px 48px 28px 48px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${INK};white-space:pre-wrap;">Hi ${escapeHtml(input.name)},<br><br>${escapeHtml(input.body)}</td></tr>`,
      quoteBlock,
      richDivider(),
      richFooter(["You reached us through the contact form on storybridge.news."]),
    ].join("\n"),
  });

  const text = `Hi ${input.name},\n\n${input.body}${
    input.originalMessage
      ? `\n\n"${input.originalMessage}"\n— Your original message${input.submittedDate ? `, ${input.submittedDate}` : ""}`
      : ""
  }`;
  return { html, text };
}

/**
 * Ported from the "Newsletter welcome" design (template 3): the full
 * header/eyebrow/footer table layout with a preheader, rather than the
 * generic wrap() every other transactional email still uses. `unsubUrl` is
 * omitted when the caller has no UNSUBSCRIBE_SECRET to hand (shouldn't
 * happen in production — see onSubscriberCreated in index.ts — but the
 * email still renders sensibly without it, same as bridgeIssue()).
 *
 * The reference design's footer also links to a `/preferences` page —
 * dropped here, same as bridgeIssue()'s real-send footer already does,
 * since no such page exists anywhere in apps/website.
 */
export function subscriberWelcome(lang: string, unsubUrl?: string): { subject: string; html: string; text: string } {
  // Only English copy for now — the site's fr/ar catalogs live in
  // packages/content, not here; a trilingual transactional template is a
  // reasonable follow-up once the subscriber's chosen language is worth
  // routing on for more than the newsletter itself.
  void lang;
  const subject = "Welcome to The Bridge";

  const footerLine2 = unsubUrl
    ? `You're receiving this because you subscribed to The Bridge.<br><a href="${escapeHtml(unsubUrl)}" style="color:${BRONZE};text-decoration:underline;">Unsubscribe</a>`
    : `<a href="mailto:contact@storybridge.news" style="color:${BRONZE};text-decoration:underline;">contact@storybridge.news</a>`;

  const html = richDocument({
    title: subject,
    preheader: "Thanks for subscribing to The Bridge — your first issue is on its way.",
    bodyRows: [
      richHeader("Confirmation"),
      richEyebrow("Subscription confirmed"),
      richTitle("You're on the list"),
      `<tr><td class="sb-px" style="padding:20px 48px 0 48px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${INK};">Thanks for subscribing to The Bridge, StoryBridge's newsletter &mdash; a monthly note on translation, editorial craft, and what we're working on.</td></tr>`,
      `<tr><td class="sb-px" style="padding:14px 48px 28px 48px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${INK};">The first issue reaches you the next time we send one. No spam, no list-selling, no cookies involved in getting you here.</td></tr>`,
      richButton("https://storybridge.news", "Visit storybridge.news"),
      richDivider(),
      richFooter(["storybridge.news &middot; contact@storybridge.news", footerLine2]),
    ].join("\n"),
  });

  const text = `You're on the list.\n\nThanks for subscribing to The Bridge, StoryBridge's newsletter. The first issue reaches you the next time we send one.${unsubUrl ? `\n\nUnsubscribe: ${unsubUrl}` : ""}`;
  return { subject, html, text };
}

/**
 * The Bridge issue email — a dedicated, richer layout (header/eyebrow/hero/
 * feature/"also from the desk"/pull quote/footer) rather than wrap()'s plain
 * wrapper, ported from the "StoryBridge Newsletter Email.html" design. See
 * apps/cms/src/lib/bridge-email-template.ts for the browser-side mirror used
 * by the CMS composer's live preview — functions/ is a standalone npm
 * project outside the pnpm workspace (see package.json), so that file can't
 * simply import this one; keep the two in sync by hand.
 */

/** One included piece — already resolved to a real title/excerpt/url/image for the issue's audience locale. picks[0] is the feature; the rest run under "Also from the desk". */
export type BridgeArticlePick = {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type BridgeIssueSections = {
  /** The 1200×628 band under the dek — the feature's own image, or a textured placeholder when it has none. */
  showHero: boolean;
  showQuote: boolean;
  quoteText: string;
  quoteAttribution: string;
};

export const DEFAULT_BRIDGE_SECTIONS: BridgeIssueSections = {
  showHero: true,
  showQuote: false,
  quoteText: "",
  quoteAttribution: "",
};

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-01" → "Sep 2026", for the header's issue-period label. */
function issuePeriodLabel(date: string | null): string {
  if (!date) return "Draft issue";
  const [y, m] = date.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return "Draft issue";
  return `${MONTHS_SHORT[m - 1]} ${y}`;
}

function heroRow(feature: BridgeArticlePick | null, show: boolean): string {
  if (!show) return "";
  if (feature?.imageUrl) {
    return `<tr><td class="sb-px" style="padding:0 48px 32px 48px;">
<img src="${escapeHtml(feature.imageUrl)}" width="504" alt="${escapeHtml(feature.imageAlt || feature.title)}" style="display:block;width:100%;max-width:504px;height:auto;border:1px solid ${SWATCH_BORDER};">
</td></tr>`;
  }
  return `<tr><td class="sb-px" style="padding:0 48px 32px 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background-color:${SWATCH_BG};background-image:url('${SWATCH_TEXTURE_LG}');background-repeat:repeat;height:220px;text-align:center;vertical-align:middle;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:0.08em;color:${FAINT};border:1px solid ${SWATCH_BORDER};">No image set for this issue</td>
</tr></table>
</td></tr>`;
}

function featureBlock(feature: BridgeArticlePick | null): string {
  if (!feature) {
    return `<tr><td class="sb-px" style="padding:0 48px 40px 48px;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;color:${FAINT};">No pieces are included in this issue yet.</td></tr>`;
  }
  return `<tr><td class="sb-px" style="padding:0 48px 8px 48px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:${BRONZE_DARK};">Feature</td></tr>
<tr><td class="sb-px" style="padding:0 48px 10px 48px;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:24px;line-height:1.3;color:${NAVY};">${escapeHtml(feature.title)}</td></tr>
${feature.excerpt ? `<tr><td class="sb-px" style="padding:0 48px 20px 48px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${INK};">${escapeHtml(feature.excerpt)}</td></tr>` : ""}
<tr><td class="sb-px" style="padding:0 48px 40px 48px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${NAVY}" style="border-radius:4px;">
<a href="${escapeHtml(feature.url)}" target="_blank" style="display:block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${CREAM};text-decoration:none;border-radius:4px;">Read the full story &rarr;</a>
</td>
</tr></table>
</td></tr>`;
}

function secondaryRow(p: BridgeArticlePick, isLast: boolean): string {
  const pad = isLast ? "8" : "22";
  const thumb = p.imageUrl
    ? `<img src="${escapeHtml(p.imageUrl)}" width="64" height="64" alt="${escapeHtml(p.imageAlt || p.title)}" style="display:block;width:64px;height:64px;object-fit:cover;border:1px solid ${SWATCH_BORDER};">`
    : `<div style="width:64px;height:64px;background-color:${SWATCH_BG};background-image:url('${SWATCH_TEXTURE_SM}');background-repeat:repeat;border:1px solid ${SWATCH_BORDER};"></div>`;
  return `<tr>
<td width="76" valign="top" style="padding-bottom:${pad}px;">${thumb}</td>
<td valign="top" style="padding-bottom:${pad}px;padding-left:16px;font-family:Arial,Helvetica,sans-serif;">
<a href="${escapeHtml(p.url)}" style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:17px;line-height:1.35;color:${NAVY};text-decoration:none;">${escapeHtml(p.title)}</a>
${p.excerpt ? `<div style="padding-top:4px;font-size:14px;line-height:1.55;color:${MUTED};">${escapeHtml(p.excerpt)}</div>` : ""}
</td>
</tr>`;
}

function buildBridgeText(input: {
  subject: string;
  preheader: string;
  issueNo: string;
  period: string;
  feature: BridgeArticlePick | null;
  secondary: BridgeArticlePick[];
  sections: BridgeIssueSections;
  test: boolean;
  unsubscribeUrl?: string;
}): string {
  const lines: string[] = [];
  lines.push(`Issue No. ${input.issueNo} · ${input.period}`);
  lines.push(input.subject);
  if (input.preheader) lines.push(input.preheader);
  if (input.test) lines.push("", "TEST COPY — sent only to you, not to subscribers.");
  lines.push("");
  if (input.feature) {
    lines.push(`FEATURE: ${input.feature.title}`);
    if (input.feature.excerpt) lines.push(input.feature.excerpt);
    lines.push(input.feature.url);
  } else {
    lines.push("No pieces are included in this issue yet.");
  }
  if (input.secondary.length > 0) {
    lines.push("", "ALSO FROM THE DESK");
    for (const p of input.secondary) lines.push(`- ${p.title} — ${p.url}`);
  }
  if (input.sections.showQuote && input.sections.quoteText.trim()) {
    lines.push("", `"${input.sections.quoteText.trim()}"`);
    if (input.sections.quoteAttribution.trim()) lines.push(`— ${input.sections.quoteAttribution.trim()}`);
  }
  lines.push("", "StoryBridge Content & Media · Tunis, Tunisia · storybridge.news");
  if (input.unsubscribeUrl) lines.push(`Unsubscribe: ${input.unsubscribeUrl}`);
  lines.push("Questions? contact@storybridge.news");
  return lines.join("\n");
}

export function bridgeIssue(input: {
  subject: string;
  preheader: string;
  issueNo: string;
  /** "2026-09-01" — the send date, formatted into the header's period label. Null on an unscheduled draft's test send. */
  issueDate: string | null;
  /** Real, already-resolved picks in composer order — picks[0] is the feature; the rest run under "Also from the desk". */
  picks: BridgeArticlePick[];
  sections: BridgeIssueSections;
  test: boolean;
  /** Set only on a real send — a per-recipient unsubscribe link. Omitted on a test send: there's no subscriber to unsubscribe. */
  unsubscribeUrl?: string;
  /** Set only on a test send — the requesting staff member's address, shown in the top test banner. */
  requesterEmail?: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = input.test ? `[TEST] ${input.subject}` : input.subject;
  const feature = input.picks[0] ?? null;
  const secondary = input.picks.slice(1);
  const period = issuePeriodLabel(input.issueDate);

  const divider =
    feature && secondary.length > 0
      ? `<tr><td class="sb-px" style="padding:0 48px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${DIVIDER};font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td></tr>`
      : "";

  const secondaryBlock =
    secondary.length > 0
      ? `<tr><td class="sb-px" style="padding:32px 48px 6px 48px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:${BRONZE_DARK};">Also from the desk</td></tr>
<tr><td class="sb-px" style="padding:14px 48px 0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${secondary.map((p, i) => secondaryRow(p, i === secondary.length - 1)).join("\n")}
</table>
</td></tr>`
      : "";

  const quoteBlock =
    input.sections.showQuote && input.sections.quoteText.trim()
      ? `<tr><td class="sb-px" style="padding:24px 48px 40px 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="border-left:3px solid ${BRONZE};padding:20px 24px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;line-height:1.5;color:${NAVY};background-color:${QUOTE_BG};background-image:url('${QUOTE_TEXTURE}');background-repeat:repeat;">
&ldquo;${escapeHtml(input.sections.quoteText.trim())}&rdquo;
${input.sections.quoteAttribution.trim() ? `<div style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-style:normal;font-size:13px;color:${BRONZE_DARK};">&mdash; ${escapeHtml(input.sections.quoteAttribution.trim())}</div>` : ""}
</td>
</tr></table>
</td></tr>`
      : "";

  // Ported from the "Newsletter issue (test send)" design (template 5): a
  // full-width bronze bar at the very top of the card, before the header —
  // not the small inline notice box under the header this used to be. That
  // mismatch (a subtler, easy-to-miss notice vs. a hard-to-miss top banner)
  // was the actual design bug the last real test send hit.
  const testBanner = input.test
    ? `<tr>
<td bgcolor="${BRONZE_DARK}" style="padding:10px 48px;background-color:${BRONZE_DARK};font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${CREAM};">
&#9888; Test send &mdash; visible only to you, sent to ${escapeHtml(input.requesterEmail || "you")}
</td>
</tr>`
    : "";

  const footerLine3 = input.unsubscribeUrl
    ? `You're receiving this because you subscribed to The Bridge.<br>
<a href="${escapeHtml(input.unsubscribeUrl)}" style="color:${BRONZE};text-decoration:underline;">Unsubscribe</a>
&nbsp;&middot;&nbsp;
<a href="mailto:contact@storybridge.news" style="color:${BRONZE};text-decoration:underline;">Questions? Email us</a>`
    : `<a href="mailto:contact@storybridge.news" style="color:${BRONZE};text-decoration:underline;">contact@storybridge.news</a>`;

  // Test sends get a single, shorter footer note (template 5) instead of
  // the real send's two-line "Tunis, Tunisia · storybridge.news" +
  // unsubscribe/contact footer — there's no subscriber relationship to
  // reference on a copy that only ever reaches the requesting staffer.
  const footerRows = input.test
    ? `<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:${FOOTER_FAINT};">
Test sends are only delivered to the requesting owner or chief editor.
</td>
</tr>`
    : `<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${FOOTER_MUTED};padding-bottom:14px;">
Tunis, Tunisia &middot; storybridge.news
</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:${FOOTER_FAINT};">
${footerLine3}
</td>
</tr>`;

  const html = `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img{ -ms-interpolation-mode:bicubic; border:0; line-height:100%; outline:none; text-decoration:none; }
  body{ margin:0; padding:0; width:100% !important; height:100% !important; }
  a[x-apple-data-detectors]{ color:inherit !important; text-decoration:none !important; }
  @media screen and (max-width:600px){
    .sb-wrap{ width:100% !important; }
    .sb-px{ padding-left:20px !important; padding-right:20px !important; }
    .sb-stack{ display:block !important; width:100% !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${GUTTER};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${GUTTER};opacity:0;">
${escapeHtml(input.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${GUTTER};">
<tr>
<td align="center" style="padding:32px 16px;">

<table role="presentation" class="sb-wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${CREAM};">

${testBanner}

<!-- Header -->
<tr>
<td class="sb-px" style="padding:36px 48px 24px 48px;border-bottom:2px solid ${NAVY};background-color:${CREAM};background-image:url('${HEADER_TEXTURE}');background-repeat:repeat;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left" valign="middle">
<img src="${MARK_URL}" width="34" height="34" alt="StoryBridge" style="display:inline-block;vertical-align:middle;width:34px;height:34px;">
<span style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:22px;color:${NAVY};letter-spacing:-0.01em;vertical-align:middle;padding-left:10px;">StoryBridge</span>
</td>
<td align="right" valign="middle" style="font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:0.12em;color:${BRONZE_DARK};text-transform:uppercase;">
The Bridge &middot; ${escapeHtml(period)}
</td>
</tr>
</table>
</td>
</tr>

<!-- Eyebrow / hero title -->
<tr>
<td class="sb-px" style="padding:40px 48px 0 48px;">
<span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:${BRONZE_DARK};">Issue No. ${escapeHtml(input.issueNo)}</span>
</td>
</tr>
<tr>
<td class="sb-px" style="padding:12px 48px 0 48px;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:32px;line-height:1.2;color:${NAVY};">
${escapeHtml(input.subject)}
</td>
</tr>
<tr>
<td class="sb-px" style="padding:14px 48px 28px 48px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${MUTED};">
${escapeHtml(input.preheader)}
</td>
</tr>

${heroRow(feature, input.sections.showHero)}

${featureBlock(feature)}

${divider}

${secondaryBlock}

${quoteBlock}

<!-- Footer -->
<tr>
<td bgcolor="${NAVY}" style="padding:32px 48px;background-color:${NAVY};background-image:url('${FOOTER_TEXTURE}');background-repeat:repeat;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:16px;color:${CREAM};padding-bottom:6px;">
StoryBridge Content &amp; Media
</td>
</tr>
${footerRows}
</table>
</td>
</tr>

</table>
</td>
</tr>
</table>

</body>
</html>`;

  const text = buildBridgeText({
    subject: input.subject,
    preheader: input.preheader,
    issueNo: input.issueNo,
    period,
    feature,
    secondary,
    sections: input.sections,
    test: input.test,
    unsubscribeUrl: input.unsubscribeUrl,
  });

  return { subject, html, text };
}
