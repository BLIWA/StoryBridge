import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Raw next-intl routing + navigation primitives, split out of ./navigation.ts
 * so ./nav-link.tsx can wrap the real `Link` (preview-aware prefetch — see
 * that file) without the two modules importing each other. ./navigation.ts
 * is still the file everything else imports from; nothing outside it should
 * import this one directly.
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
