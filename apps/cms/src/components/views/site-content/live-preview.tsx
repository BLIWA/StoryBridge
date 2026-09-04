"use client";

import { useRef } from "react";
import {
  Source_Serif_4,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  IBM_Plex_Mono,
  Noto_Naskh_Arabic,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { PREVIEW_CSS } from "@storybridge/site-ui/preview-css";
import { PreviewProvider, type PreviewContextValue } from "@storybridge/site-ui/preview";
import { SiteHeader } from "@storybridge/site-ui/chrome/site-header";
import { SiteFooter } from "@storybridge/site-ui/chrome/site-footer";
import { DesignFx } from "@storybridge/site-ui/fx/design-fx";
import { HomeHero } from "@storybridge/site-ui/home/hero";
import { TrustStrip, WhatWeDo, DeskProcess, WhyStoryBridge, FromTheJournal, NewsletterCta } from "@storybridge/site-ui/home/sections";
import { ArabicHome } from "@storybridge/site-ui/home/arabic-home";
import { WhoWeAreBody } from "@storybridge/site-ui/who-we-are/body";
import { FoundersBody } from "@storybridge/site-ui/founders/body";
import { HowWeWorkBody } from "@storybridge/site-ui/how-we-work/body";
import { ServicesBody } from "@storybridge/site-ui/services/body";
import { PackagesBody } from "@storybridge/site-ui/packages-page/body";
import { WorkBody } from "@storybridge/site-ui/work/body";
import { ContactBody } from "@storybridge/site-ui/contact/body";
import { LegalPageBody } from "@storybridge/site-ui/legal/body";
import type { Locale } from "@/lib/site-content";
import type { SiteImage, SiteImageSlot } from "@/lib/site-images";
import { SiteImageCard } from "@/components/views/site-image-card";
import { NotWiredNote } from "@/components/ui";
import type { LiveKind } from "./page-registry";
import type { JSONObject } from "@storybridge/content/merge";

// Own font instances rather than reusing the CMS shell's globals (which
// don't load italic or the Arabic faces) — see this file's own render for
// why: the moved page bodies reference these families by their literal CSS
// name, and a next/font/google instance's @font-face registers globally on
// the page the moment it's mounted anywhere, regardless of which element
// wears its `.variable` class. Matches apps/website/src/app/[locale]/layout.tsx.
const sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--font-preview-serif", display: "swap" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-preview-plex-sans", display: "swap" });
const plexSansArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], variable: "--font-preview-plex-sans-arabic", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-preview-plex-mono", display: "swap" });
const notoNaskh = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-preview-naskh", display: "swap" });

const FONT_CLASSES = `${sourceSerif.variable} ${plexSans.variable} ${plexSansArabic.variable} ${plexMono.variable} ${notoNaskh.variable}`;

const RTL_LOCALES: readonly Locale[] = ["ar"];

const SITE_WIDE_NOTE: Record<"header" | "footer", string> = {
  header: "The header above appears on every page — this chip is just a shortcut to it. Toggle edit mode and click into it directly.",
  footer: "The footer below appears on every page — this chip is just a shortcut to it. Toggle edit mode and click into it directly.",
};

function LiveBody({ kind, locale, images }: { kind: LiveKind; locale: Locale; images: Record<string, SiteImage> }) {
  switch (kind) {
    case "home":
      if (locale === "ar") return <ArabicHome />;
      return (
        <>
          <HomeHero />
          <TrustStrip />
          <WhatWeDo />
          <DeskProcess />
          <WhyStoryBridge />
          <FromTheJournal />
          <NewsletterCta />
        </>
      );
    case "who-we-are":
      return <WhoWeAreBody photo={images["who-we-are.photo"] ?? null} />;
    case "founders":
      return (
        <FoundersBody
          portraits={{
            assia: images["founders.assia.portrait"] ?? null,
            imen: images["founders.imen.portrait"] ?? null,
          }}
        />
      );
    case "how-we-work":
      return <HowWeWorkBody fieldPhoto={images["how-we-work.field-photo"] ?? null} />;
    case "services":
      return <ServicesBody />;
    case "packages":
      return <PackagesBody />;
    case "work":
      return <WorkBody />;
    case "contact":
      return <ContactBody />;
    case "privacy":
      return <LegalPageBody namespace="PrivacyPage" backdropId="wpgPrivacy" />;
    case "terms":
      return <LegalPageBody namespace="TermsPage" backdropId="wpgTerms" />;
    case "cookies":
      return <LegalPageBody namespace="CookiePage" backdropId="wpgCookies" />;
    case "header":
    case "footer":
      return (
        <div style={{ padding: "56px 24px", textAlign: "center", color: "#8A8378", fontSize: "13.5px", maxWidth: "480px", margin: "0 auto" }}>
          {SITE_WIDE_NOTE[kind]}
        </div>
      );
  }
}

/**
 * High-fidelity page preview: the real website components (from
 * @storybridge/site-ui), rendered client-side and fed by whatever's
 * currently true — saved overrides plus any not-yet-saved edits — via
 * `messages`. Typing in an Editable field calls `onChange`, which the
 * orchestrator folds into its edits map and re-renders with; because that
 * flows back in as `messages`, the preview updates the same way the real
 * site would once published, not through any preview-only code path.
 */
export function LivePreview({
  kind,
  locale,
  messages,
  editing,
  onChange,
  imageSlots,
  images,
}: {
  kind: LiveKind;
  locale: Locale;
  messages: JSONObject;
  editing: boolean;
  onChange: (path: string, value: string) => void;
  imageSlots: SiteImageSlot[];
  images: Record<string, SiteImage>;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const rtl = RTL_LOCALES.includes(locale);

  const previewCtx: PreviewContextValue = {
    editing,
    onChange,
    renderImageEditor: (slotId) => {
      const slot = imageSlots.find((s) => s.id === slotId);
      if (!slot) return null;
      return <SiteImageCard slot={slot} image={images[slotId]} />;
    },
  };

  return (
    <div
      ref={frameRef}
      className={FONT_CLASSES}
      dir={rtl ? "rtl" : "ltr"}
      // Links in the real components navigate for real (they're next-intl's
      // Link) — inside this shell that would try to route the CMS itself to
      // "/who-we-are" and break it, so capture-phase intercepts every click
      // that lands on an <a> before it reaches the router. Editable's own
      // click targets are spans/buttons, never anchors, so this never blocks
      // an edit.
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("a")) e.preventDefault();
      }}
      style={{
        border: "1px solid #D8D1C7",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#FDF8F1",
        color: "#111111",
        fontFamily: rtl ? "'IBM Plex Sans Arabic',sans-serif" : "'IBM Plex Sans',sans-serif",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: PREVIEW_CSS }} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <PreviewProvider value={previewCtx}>
          <DesignFx />
          <SiteHeader locale={locale} />
          <main>
            <LiveBody kind={kind} locale={locale} images={images} />
          </main>
          <SiteFooter />
        </PreviewProvider>
      </NextIntlClientProvider>
      <div style={{ padding: "14px 18px", borderTop: "1px solid #E6E0D8", background: "#F8F4EE" }}>
        <NotWiredNote>
          This is the real page, rendered live — not a mockup. Header nav highlighting won&apos;t match (Studio has
          its own routes), and links are disabled here so clicking one doesn&apos;t navigate Studio away. Image
          changes save immediately when you pick or upload one; text changes wait for &ldquo;Save&rdquo; above.
        </NotWiredNote>
      </div>
    </div>
  );
}
