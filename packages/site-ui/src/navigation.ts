import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Canonical home for the site's locale routing + locale-aware `Link`.
 *
 * Moved out of apps/website/src/i18n/{routing,navigation}.ts so that the
 * page bodies in ./home, ./who-we-are, ./contact and the shared chrome in
 * ./chrome — all reused unmodified by apps/cms's live preview — resolve
 * `Link` the same way in both apps rather than needing a CMS-side shim.
 * apps/website's own i18n/routing.ts and i18n/navigation.ts now just
 * re-export from here, so nothing else in that app had to change its
 * import path.
 */

// Arabic + French + English — the trilingual Maghreb positioning is core to
// the brand, so every route is localized (not just Journal articles).
export const routing = defineRouting({
  locales: ["en", "fr", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export const rtlLocales: readonly AppLocale[] = ["ar"];

export function isRtl(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
