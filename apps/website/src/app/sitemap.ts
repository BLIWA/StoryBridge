import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { JOURNAL_INDEX } from "@/content/journal";
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
];

// output:"export" builds this to a static file at build time; Next requires the
// intent to be declared rather than inferred.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const keys = [
    ...PAGES,
    ...JOURNAL_INDEX.map((p) => ({ key: `journal/${p.slug}`, priority: 0.6 })),
  ];

  return keys.flatMap(({ key, priority }) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${pathFor(key, locale)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}${pathFor(key, l)}`]),
        ),
      },
    })),
  );
}
