import { setRequestLocale } from "next-intl/server";
import { FoundersBody } from "@storybridge/site-ui/founders/body";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";
import { getSiteImage, type SiteImage } from "@/lib/site-images";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("founders");

const FOUNDER_IDS = ["assia", "imen"] as const;

export default async function FoundersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const portraits: Record<string, SiteImage | null> = Object.fromEntries(
    await Promise.all(FOUNDER_IDS.map(async (id) => [id, await getSiteImage(`founders.${id}.portrait`)] as const)),
  );

  return <FoundersBody portraits={portraits} />;
}
