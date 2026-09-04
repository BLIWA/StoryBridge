/**
 * A byte-for-byte mirror of functions/src/templates.ts's bridgeIssue() —
 * the actual send pipeline's email builder — used only to render the
 * composer's live preview (components/views/issues.tsx) and to build the
 * payload "Send test" hands to the sendBridgeTest callable.
 *
 * functions/ is a standalone npm project outside the pnpm workspace (see
 * its package.json — Cloud Functions' build servers expect their own
 * lockfile), so this file can't import that one. Any change to the email's
 * markup belongs in both places — keep them in sync by hand.
 */

import type { IssueSections, BridgeArticlePick } from "./bridge-issues";

const NAVY = "#002D62";
const BRONZE = "#B57D49";
const BRONZE_DARK = "#8F6135";
const CREAM = "#FDF8F1";
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

// Hosted, not inline data: URIs — Gmail (web + apps) strips data: URIs from
// CSS background-image, so the watermarks silently vanished there. See
// functions/src/templates.ts's matching comment; source files live at
// apps/website/public/assets/email-*.svg.
const HEADER_TEXTURE = "https://storybridge.news/assets/email-header-texture.svg";
const QUOTE_TEXTURE = "https://storybridge.news/assets/email-quote-texture.svg";
const FOOTER_TEXTURE = "https://storybridge.news/assets/email-footer-texture.svg";
const SWATCH_TEXTURE_LG = "https://storybridge.news/assets/email-swatch-lg.svg";
const SWATCH_TEXTURE_SM = "https://storybridge.news/assets/email-swatch-sm.svg";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

/**
 * Renders exactly what a subscriber (or a test recipient) would receive.
 * `unsubscribeUrl` is omitted for the preview and for test sends — there is
 * no real subscriber to unsubscribe in either case, same as
 * functions/src/templates.ts's bridgeIssue().
 */
export function buildBridgeEmail(input: {
  subject: string;
  preheader: string;
  issueNo: string;
  issueDate: string | null;
  picks: BridgeArticlePick[];
  sections: IssueSections;
  test: boolean;
  unsubscribeUrl?: string;
  /** Set only on a test send — the requesting staff member's address, shown in the top test banner. Unused by the composer's own preview (always test:false — see issues.tsx), kept for parity with bridgeIssue(). */
  requesterEmail?: string;
}): { subject: string; html: string } {
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

  // Kept byte-identical to bridgeIssue() (functions/src/templates.ts) — a
  // full-width bronze bar at the top of the card, before the header.
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

  return { subject, html };
}
