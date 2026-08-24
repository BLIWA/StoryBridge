import { setRequestLocale } from "next-intl/server";
import { HomeHero } from "@/components/home/hero";
import {
  TrustStrip,
  WhatWeDo,
  DeskProcess,
  WhyStoryBridge,
  FromTheJournal,
  NewsletterCta,
} from "@/components/home/sections";
import { ArabicHome } from "@/components/home/arabic-home";
import { metadataFor } from "@/i18n/metadata";

export const generateMetadata = metadataFor("home");

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // The board designs a dedicated Arabic home (RTL, Naskh display face);
  // it is not the English page mirrored.
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
}
