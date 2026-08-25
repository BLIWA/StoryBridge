/**
 * The article body is still a plain-text field (see components/ui.tsx's
 * NotWiredNote in the editor — a real rich-text field is roadmap Phase 05's
 * media-library work). This file gives that plain text a small, documented
 * markdown-ish convention instead of leaving the toolbar buttons inert:
 * **bold**, _italic_, `## ` headings, `> ` pull-quotes (rendered in the
 * StoryBridge mark's shape, see ui.tsx's QuoteMark), `[text](url)` links, and
 * `![alt](url "credit")` images. Preview interprets the same convention, so
 * what an editor sees there is what these tokens actually mean.
 */

export type Selection = { start: number; end: number };
export type Edit = { text: string; sel: Selection };

function wrapSelection(text: string, sel: Selection, mark: string): Edit {
  const before = text.slice(0, sel.start);
  const inner = text.slice(sel.start, sel.end) || "text";
  const after = text.slice(sel.end);
  return {
    text: `${before}${mark}${inner}${mark}${after}`,
    sel: { start: before.length + mark.length, end: before.length + mark.length + inner.length },
  };
}

function prefixLine(text: string, sel: Selection, prefix: string): Edit {
  const lineStart = text.lastIndexOf("\n", Math.max(sel.start - 1, 0)) + 1;
  const already = text.slice(lineStart, lineStart + prefix.length) === prefix;
  const next = already
    ? text.slice(0, lineStart) + text.slice(lineStart + prefix.length)
    : text.slice(0, lineStart) + prefix + text.slice(lineStart);
  const delta = already ? -prefix.length : prefix.length;
  return { text: next, sel: { start: sel.start + delta, end: sel.end + delta } };
}

function insertAt(text: string, sel: Selection, insertion: string): Edit {
  const next = text.slice(0, sel.start) + insertion + text.slice(sel.end);
  const pos = sel.start + insertion.length;
  return { text: next, sel: { start: pos, end: pos } };
}

export const bodyOps = {
  bold: (text: string, sel: Selection): Edit => wrapSelection(text, sel, "**"),
  italic: (text: string, sel: Selection): Edit => wrapSelection(text, sel, "_"),
  h2: (text: string, sel: Selection): Edit => prefixLine(text, sel, "## "),
  pullquote: (text: string, sel: Selection): Edit => prefixLine(text, sel, "> "),
  link: (text: string, sel: Selection, url: string): Edit => {
    const before = text.slice(0, sel.start);
    const inner = text.slice(sel.start, sel.end) || "link text";
    const after = text.slice(sel.end);
    return {
      text: `${before}[${inner}](${url})${after}`,
      sel: { start: before.length + 1, end: before.length + 1 + inner.length },
    };
  },
  image: (text: string, sel: Selection, url: string, alt: string, credit: string): Edit =>
    insertAt(text, sel, `![${alt || "image"}](${url}${credit ? ` "${credit}"` : ""})\n`),
};

export type BodyBlock =
  | { type: "h2"; text: string }
  | { type: "pullquote"; text: string }
  | { type: "image"; url: string; alt: string; credit: string }
  | { type: "para"; text: string };

const IMAGE_RE = /^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)$/;

/**
 * Block prefixes (`## `, `> `) are applied one line at a time by the toolbar
 * (see prefixLine above), not one blank-line-separated paragraph at a time —
 * so blocks are detected per line here too. Consecutive plain lines are
 * still joined into a single paragraph (on a single space, as wrapped text),
 * and a blank line always starts a new paragraph.
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
