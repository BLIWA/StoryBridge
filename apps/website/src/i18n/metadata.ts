import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, isRtl, type AppLocale } from "./routing";
import { isDraftLocale } from "./status";

/**
 * Per-page, per-locale metadata.
 *
 * The site previously exported one `metadata` object from the locale layout,
 * so all 33 pages shared a single title and description and declared no
 * relationship to their own translations. For a trilingual site that is the
 * expensive kind of missing: without `alternates.languages`, a search engine
 * treats /en, /fr and /ar as three unrelated pages competing with each other
 * rather than as one page in three languages.
 *
 * Every route calls `pageMetadata(locale, key)`. Titles and descriptions live
 * in the `Meta` namespace beside the rest of the copy, so a translator writes
 * them in the same pass as the page itself.
 */

export const SITE_URL = "https://sotrybridge.web.app";
export const SITE_NAME = "StoryBridge Content & Media";

/** Route for a page key in a given locale. `home` is the bare locale root. */
export function pathFor(key: string, locale: string): string {
  return key === "home" ? `/${locale}` : `/${locale}/${key}`;
}

function languageAlternates(key: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of routing.locales) {
    out[locale] = `${SITE_URL}${pathFor(key, locale)}`;
  }
  // Search engines use x-default for "no better match"; English is the source.
  out["x-default"] = `${SITE_URL}${pathFor(key, routing.defaultLocale)}`;
  return out;
}

export async function pageMetadata(
  locale: string,
  key: string,
  overrides: { title?: string; description?: string } = {},
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Meta" });
  const title = overrides.title ?? t(`${key}.title`);
  const description = overrides.description ?? t(`${key}.description`);
  const url = `${SITE_URL}${pathFor(key, locale)}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(key) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale,
      alternateLocale: routing.locales.filter((l) => l !== locale),
      url,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    other: {
      // Machine-readable counterpart to the on-page draft notice, so the state
      // of a translation is not something only a human reader can discover.
      // See i18n/status.ts.
      "translation-status": isDraftLocale(locale) ? "draft" : "reviewed",
      "content-direction": isRtl(locale) ? "rtl" : "ltr",
    },
  };
}

/** Convenience for the standard `generateMetadata` signature every page uses. */
export function metadataFor(key: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    return pageMetadata(locale as AppLocale, key);
  };
}
