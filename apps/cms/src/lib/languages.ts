/**
 * Per-language content helpers for the article editor.
 *
 * An Article's top-level title/slug/excerpt/body are always the *primary*
 * language's content — whichever code its `lang` field starts with (e.g. "AR"
 * out of "AR · EN"). The other two languages, if started, live in
 * `translations`. Centralizing the read/write here means the editor's tabs
 * never have to know which language happens to be "the real one" — they all
 * go through langContentOf()/langPatch().
 */

import type { Article, LangCode, LangContent } from "@/content/seed";

export const ALL_LANGS: readonly LangCode[] = ["EN", "FR", "AR"];

export const LANG_NAME: Record<LangCode, string> = {
  EN: "English",
  FR: "Français",
  AR: "العربية",
};

const EMPTY: LangContent = { title: "", slug: "", excerpt: "", body: "" };

/** `lang` is a display string like "EN" or "AR · EN" — the first code is primary. */
export function primaryLangOf(lang: string): LangCode {
  const first = lang.split("·")[0]?.trim().toUpperCase();
  return (ALL_LANGS as readonly string[]).includes(first ?? "") ? (first as LangCode) : "EN";
}

export function langContentOf(article: Article, code: LangCode): LangContent {
  if (code === primaryLangOf(article.lang)) {
    return { title: article.title, slug: article.slug, excerpt: article.excerpt, body: article.body };
  }
  return article.translations?.[code] ?? EMPTY;
}

export function langStarted(article: Article, code: LangCode): boolean {
  const c = langContentOf(article, code);
  return Boolean(c.title.trim() || c.body.trim() || c.excerpt.trim());
}

/** Builds the `setDraft()` patch for editing one field of one language's content. */
export function langPatch(article: Article, code: LangCode, patch: Partial<LangContent>): Partial<Article> {
  if (code === primaryLangOf(article.lang)) {
    return patch;
  }
  return { translations: { ...article.translations, [code]: { ...langContentOf(article, code), ...patch } } };
}
