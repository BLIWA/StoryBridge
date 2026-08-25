/**
 * Ported from apps/cms/src/lib/body-format.ts — deliberately duplicated, not
 * shared, same call as the QuoteMark SVG (see components/journal-quote-mark.tsx):
 * a few pure functions aren't worth a package boundary. Keep the two in sync
 * by hand; only the read side is needed here (parseBody/tokenizeInline) — the
 * editor-only `bodyOps` that write the convention stay in the CMS.
 *
 * The convention: **bold**, _italic_, `## ` headings, `> ` pull-quotes,
 * `[text](url)` links, `![alt](url "credit")` images. Block prefixes are
 * per-line (a blank line is not required to start a new block).
 */

export type BodyBlock =
  | { type: "h2"; text: string }
  | { type: "pullquote"; text: string }
  | { type: "image"; url: string; alt: string; credit: string }
  | { type: "para"; text: string };

const IMAGE_RE = /^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)$/;

/**
 * Block prefixes (`## `, `> `) are applied one line at a time by the CMS
 * toolbar, not one blank-line-separated paragraph at a time — so blocks are
 * detected per line here too. Consecutive plain lines are still joined into
 * a single paragraph (on a single space, as wrapped text), and a blank line
 * always starts a new paragraph.
 */
export function parseBody(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  let paraLines: string[] = [];

  function flushPara() {
    const text = paraLines.join(" ").trim();
    if (text) blocks.push({ type: "para", text });
    paraLines = [];
  }

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      flushPara();
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      blocks.push({ type: "h2", text: line.slice(3) });
      continue;
    }
    if (line.startsWith("> ")) {
      flushPara();
      blocks.push({ type: "pullquote", text: line.slice(2) });
      continue;
    }
    const img = IMAGE_RE.exec(line);
    if (img) {
      flushPara();
      blocks.push({ type: "image", alt: img[1], url: img[2], credit: img[3] ?? "" });
      continue;
    }
    paraLines.push(line);
  }
  flushPara();
  return blocks;
}

export type InlineToken = { text: string; bold?: boolean; italic?: boolean; href?: string };

/** Splits a paragraph into plain/bold/italic/link runs so a component can render each. */
export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\(\s*[^\s)]+\s*\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ text: text.slice(last, m.index) });
    const chunk = m[0];
    if (chunk.startsWith("**")) {
      tokens.push({ text: chunk.slice(2, -2), bold: true });
    } else if (chunk.startsWith("_")) {
      tokens.push({ text: chunk.slice(1, -1), italic: true });
    } else {
      // URLs are trimmed even if the author left stray whitespace inside the parens.
      const link = /^\[([^\]]+)\]\(\s*([^\s)]+)\s*\)$/.exec(chunk)!;
      tokens.push({ text: link[1], href: link[2] });
    }
    last = m.index + chunk.length;
  }
  if (last < text.length) tokens.push({ text: text.slice(last) });
  return tokens;
}
