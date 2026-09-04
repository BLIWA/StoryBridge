/**
 * The *shape* of the site's recurring content. The words themselves live in
 * messages/{en,fr,ar}.json, keyed by the ids below.
 *
 * Splitting it this way is what makes the site genuinely trilingual: a
 * translator touches one JSON file per language and never opens a .tsx, and a
 * missing key fails loudly at build rather than silently rendering English.
 * Anything here that is *not* language — a typographic mark, a slug, whether a
 * step carries a photo — stays in TypeScript, because translating it would be
 * meaningless.
 *
 * This is the interim home for content the CMS will own once the Journal /
 * Pages modules exist (roadmap Phase 05–07). The migration is then a swap of
 * this file plus the matching message namespaces, not a hunt through JSX.
 */

/** The four service pillars. Marks are typographic, so they do not translate. */
export const PILLARS = [
  { id: "editorial", mark: "¶" },
  { id: "translation", mark: "« »" },
  { id: "editing", mark: "§" },
  { id: "media", mark: "†" },
] as const;

export type PillarId = (typeof PILLARS)[number]["id"];

/** Trust strip, four columns. */
export const TRUST_SIGNALS = ["newsroom", "maghrebi", "process", "contact"] as const;

/** The desk's four stages, numbered on screen. */
export const DESK_STAGES = [
  { id: "brief", n: "01" },
  { id: "writer", n: "02" },
  { id: "editor", n: "03" },
  { id: "qa", n: "04" },
] as const;

/** Featured on the home page; the slug is the route, so it never translates. */
export const JOURNAL_POSTS = [
  { slug: "arabic-copy-sounds-foreign-in-tunis" },
  { slug: "the-brief-is-the-deliverable" },
  { slug: "what-a-fixer-actually-does" },
] as const;

/**
 * The seven steps from How.md. The board gives each step a different right-hand
 * column — a pull quote, a list, a photo, or the three-language card — so the
 * flags below are what the page switches on. `listCount` exists so the page can
 * ask for exactly the list items a translation is expected to supply.
 */
export type ProcessStep = {
  id: string;
  n: string;
  body2?: boolean;
  aside?: boolean;
  listCount?: number;
  listLast?: boolean;
  photo?: boolean;
  languageCard?: boolean;
};

export const PROCESS_STEPS: readonly ProcessStep[] = [
  { id: "listen", n: "01", aside: true },
  { id: "approach", n: "02", listCount: 4, listLast: true },
  { id: "field", n: "03", body2: true, photo: true, aside: true },
  { id: "purpose", n: "04", aside: true },
  { id: "languages", n: "05", languageCard: true },
  { id: "deliver", n: "06", body2: true, aside: true },
  { id: "stay", n: "07", aside: true },
] as const;
