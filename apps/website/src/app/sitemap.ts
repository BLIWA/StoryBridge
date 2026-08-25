import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listPublishedArticles, type PublishedArticle } from "@/lib/articles";
import { SITE_URL, pathFor } from "@/i18n/metadata";

/**
 * One entry per page per locale, each declaring its own translations.
 *
 * The `languages` map matters more here than the entries themselves: it is what
 * tells a crawler that /en/services, /fr/services and /ar/services are one page
 * in three languages rather than three pages competing for the same queries.
 */

const PAGES = [
  { key: "home", priority: 1.0 },
  { key: "who-we-are", priority: 0.9 },
  { key: "services", priority: 0.9 },
  { key: "packages", priority: 0.9 },
  { key: "how-we-work", priority: 0.8 },
  { key: "founders", priority: 0.7 },
  { key: "contact", priority: 0.8 },
  { key: "journal", priority: 0.7 },
  { key: "newsletter", priority: 0.6 },
  { key: "work", priority: 0.5 },
  { key: "privacy", priority: 0.2 },
  { key: "terms", priority: 0.2 },
  { key: "cookies", priority: 0.2 },
];

// output:"export" builds this to a static file at build time; Next requires the
// intent to be declared rather than inferred.
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pageEntries: MetadataRoute.Sitemap = PAGES.flatMap(({ key, priority }) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${pathFor(key, locale)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}${pathFor(key, l)}`])),
      },
    })),
  );

  return [...pageEntries, ...(await journalEntries())];
}

/**
 * One entry per (article, locale it's actually written in) — unlike the
 * fixed `PAGES` above, an article's slug differs per language and it may not
 * exist in all three yet, so `alternates.languages` only lists the locales
 * this particular article really has, not every site locale uniformly.
 */
async function journalEntries(): Promise<MetadataRoute.Sitemap> {
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => [locale, await listPublishedArticles(locale)] as const),
  );

  const byId = new Map<string, Record<string, PublishedArticle>>();
  for (const [locale, list] of perLocale) {
    for (const article of list) {
      const byLocale = byId.get(article.id) ?? {};
      byLocale[locale] = article;
      byId.set(article.id, byLocale);
    }
  }

  return [...byId.values()].flatMap((byLocale) => {
    const locales = Object.keys(byLocale);
    const urlFor = (locale: string) => `${SITE_URL}/${locale}/journal/${byLocale[locale].slug}`;
    return locales.map((locale) => ({
      url: urlFor(locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, urlFor(l)])) },
    }));
  });
}
