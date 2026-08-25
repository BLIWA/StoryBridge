/**
 * The article body is still a plain-text field (see components/ui.tsx's
 * NotWiredNote in the editor — a real rich-text field is roadmap Phase 05's
 * media-library work). This file gives that plain text a small, documented
 * markdown-ish convention instead of leaving the toolbar buttons inert:
 * **bold**, _italic_, `## ` headings, `> ` pull-quotes (rendered in the
 * StoryBridge mark's shape, see ui.tsx's QuoteMark), and
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
