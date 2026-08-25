/**
 * Ported from apps/cms/src/lib/body-format.ts — deliberately duplicated, not
 * shared, same call as the QuoteMark SVG (see components/journal-quote-mark.tsx):
 * a few pure functions aren't worth a package boundary. Keep the two in sync
 * by hand; only the read side is needed here (parseBody/tokenizeInline) — the
 * editor-only `bodyOps` that write the convention stay in the CMS.
 *
 * The convention: **bold**, _italic_, `## ` headings, `> ` pull-quotes,
 * `![alt](url "credit")` images, blank-line-separated paragraphs.
 */

export type BodyBlock =
  | { type: "h2"; text: string }
  | { type: "pullquote"; text: string }
  | { type: "image"; url: string; alt: string; credit: string }
  | { type: "para"; text: string };

export function parseBody(body: string): BodyBlock[] {
  return body
    .split(/\n{2,}/)
    .map((raw): BodyBlock => {
      const line = raw.trim();
      if (line.startsWith("## ")) return { type: "h2", text: line.slice(3) };
      if (line.startsWith("> ")) return { type: "pullquote", text: line.slice(2) };
      const img = /^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)$/.exec(line);
      if (img) return { type: "image", alt: img[1], url: img[2], credit: img[3] ?? "" };
      return { type: "para", text: line };
    })
    .filter((b) => b.type !== "para" || b.text.length > 0);
}

export type InlineToken = { text: string; bold?: boolean; italic?: boolean };

/** Splits a paragraph into plain/bold/italic runs so a component can render each. */
export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ text: text.slice(last, m.index) });
    const chunk = m[0];
    tokens.push(chunk.startsWith("**") ? { text: chunk.slice(2, -2), bold: true } : { text: chunk.slice(1, -1), italic: true });
    last = m.index + chunk.length;
  }
  if (last < text.length) tokens.push({ text: text.slice(last) });
  return tokens;
}
