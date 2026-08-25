import type { Metadata } from "next";
import {
  Source_Serif_4,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  IBM_Plex_Mono,
  Noto_Naskh_Arabic,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, isRtl, type AppLocale } from "@/i18n/routing";
import { SiteHeader } from "@/components/chrome/site-header";
import { SiteFooter } from "@/components/chrome/site-footer";
import { TranslationNotice } from "@/components/chrome/translation-notice";
import { Analytics } from "@/components/chrome/analytics";
import { CookieBanner } from "@/components/chrome/cookie-banner";
import { DesignFx } from "@/components/fx/design-fx";
import "../globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});
const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans-arabic",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-naskh-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StoryBridge Content & Media",
  description:
    "Journalistic standards, applied to your content. A boutique editorial house in Tunis — content, translation, editorial and media across Arabic, English and French.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const rtl = isRtl(locale);

  return (
    <html
      lang={locale}
      dir={rtl ? "rtl" : "ltr"}
      className={`${sourceSerif.variable} ${plexSans.variable} ${plexSansArabic.variable} ${plexMono.variable} ${notoNaskh.variable}`}
    >
      <body
        dir={rtl ? "rtl" : "ltr"}
        style={{
          background: "#FDF8F1",
          fontFamily: rtl ? "'IBM Plex Sans Arabic',sans-serif" : "'IBM Plex Sans',sans-serif",
          color: "#111111",
          minHeight: "100vh",
        }}
      >
        <Analytics />
        <NextIntlClientProvider>
          <DesignFx />
          <SiteHeader locale={locale as AppLocale} />
          <TranslationNotice locale={locale} />
          <main id="main">{children}</main>
          <SiteFooter />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
