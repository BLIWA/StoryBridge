/**
 * Resolves an `articles` Firestore doc to one locale's title/slug/excerpt,
 * for building a real Bridge-issue link and dek per audience.
 *
 * Mirrors apps/cms/src/lib/languages.ts's primaryLangOf()/langContentOf() —
 * functions/ is a standalone npm project outside the pnpm workspace (see
 * package.json), so this small pure duplicate exists rather than an import.
 * Keep the two in sync by hand.
 */

export type LangCode = "EN" | "FR" | "AR";
const ALL_LANGS: readonly LangCode[] = ["EN", "FR", "AR"];

/** `lang` is a display string like "EN" or "AR · EN" — the first code is primary. */
export function primaryLangOf(lang: string): LangCode {
  const first = lang.split("·")[0]?.trim().toUpperCase();
  return (ALL_LANGS as readonly string[]).includes(first ?? "") ? (first as LangCode) : "EN";
}

export type ArticleLangContent = {
  /**
   * Which locale this content is actually in — `locale` when that
   * translation exists, otherwise the article's own primary language. The
   * website's Journal has no cross-locale fallback (apps/website/src/lib/
   * articles.ts's contentFor() returns null for an unstarted translation, so
   * that route 404s), so a link must point at *this* locale, not the one
   * originally requested, or it 404s for the very subscriber it was built for.
   */
  locale: LangCode;
  title: string;
  slug: string;
  excerpt: string;
};

/**
 * The article's content in `locale`, falling back to the primary language's
 * content when that locale's translation hasn't been started — a subscriber
 * reading in a language the piece hasn't been translated into yet still gets
 * a real title, a real excerpt, and a real, resolving link (to the primary
 * language's own page), rather than blank fields or a 404.
 */
export function resolveArticleContent(data: Record<string, unknown>, locale: LangCode): ArticleLangContent {
  const lang = typeof data.lang === "string" ? data.lang : "EN";
  const primaryLang = primaryLangOf(lang);
  const primary = {
    title: typeof data.title === "string" ? data.title : "",
    slug: typeof data.slug === "string" ? data.slug : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
  };
  if (locale === primaryLang) return { locale, ...primary };

  const translations = data.translations as Record<string, Partial<ArticleLangContent>> | undefined;
  const t = translations?.[locale];
  if (t?.title?.trim()) {
    return { locale, title: t.title, slug: t.slug?.trim() || primary.slug, excerpt: t.excerpt ?? "" };
  }
  return { locale: primaryLang, ...primary };
}

export function articleLeadImage(data: Record<string, unknown>): { url: string; alt: string } | null {
  const leadImage = data.leadImage as { url?: string; alt?: string } | undefined;
  if (leadImage?.url) return { url: leadImage.url, alt: leadImage.alt ?? "" };
  return null;
}
