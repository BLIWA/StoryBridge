import { setRequestLocale } from "next-intl/server";
import { LegalPageBody } from "@storybridge/site-ui/legal/body";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("privacy");

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalPageBody namespace="PrivacyPage" backdropId="wpgPrivacy" />;
}
