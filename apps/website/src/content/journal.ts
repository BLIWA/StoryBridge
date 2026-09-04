/**
 * IMPORTANT: `JOURNAL_INDEX`, `JOURNAL_SECTIONS` and `FEATURED_POST` below
 * are unused dead data now. The Journal index and post pages read real
 * published articles from Firestore instead (see src/lib/articles.ts) —
 * this placeholder editorial was the stand-in before the CMS could publish
 * anything for real. Kept only as a reference for the board's original
 * sample content, same as apps/cms/src/content/seed.ts's `ARTICLES`.
 *
 * The newsletter archive (`NEWSLETTER_ISSUES`) went through the same move
 * and lived here too until it did — it now reads real Sent bridgeIssues
 * from Firestore instead (see src/lib/bridge-issues.ts and
 * app/[locale]/newsletter/page.tsx).
 */

export type JournalEntry = {
  /** Also the route, so it never translates. */
  slug: string;
  /** Index into JOURNAL_SECTIONS, for the filter chips. */
  section: SectionId;
  lead?: boolean;
};

export const JOURNAL_SECTIONS = ["all", "translation", "craft", "field", "maghreb"] as const;
export type SectionId = (typeof JOURNAL_SECTIONS)[number];

export const JOURNAL_INDEX: readonly JournalEntry[] = [
  { slug: "arabic-copy-sounds-foreign-in-tunis", section: "translation", lead: true },
  { slug: "the-brief-is-the-deliverable", section: "craft" },
  { slug: "what-a-fixer-actually-does", section: "field" },
  { slug: "three-languages-one-press-release", section: "maghreb" },
  { slug: "every-piece-needs-a-reason-to-exist", section: "craft" },
];

/**
 * The one post the board writes out in full; the others render a "not written
 * yet" note. `body` is the running order — each entry names a block type and
 * the message key holding its text, so a translator writes prose and never
 * touches the layout.
 */
export type BodyBlock =
  | { type: "para-drop" | "para" | "h2" | "pullquote"; key: string }
  | { type: "numbered"; key: string; count: number };

export const FEATURED_POST = {
  slug: "arabic-copy-sounds-foreign-in-tunis",
  section: "translation" as SectionId,
  languages: ["AR", "FR"] as const,
  /** Set in the source language; a translation supplies its own opening letter. */
  dropCapKey: "dropCap",
  body: [
    { type: "para-drop", key: "b0" },
    { type: "para", key: "b1" },
    { type: "h2", key: "b2" },
    { type: "para", key: "b3" },
    { type: "pullquote", key: "b4" },
    { type: "para", key: "b5" },
    { type: "h2", key: "b6" },
    { type: "numbered", key: "b7", count: 3 },
    { type: "para", key: "b8" },
  ] as const satisfies readonly BodyBlock[],
};
