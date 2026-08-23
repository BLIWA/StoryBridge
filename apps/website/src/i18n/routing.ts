import { defineRouting } from "next-intl/routing";

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
