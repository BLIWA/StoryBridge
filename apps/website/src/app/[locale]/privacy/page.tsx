import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("privacy");

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PrivacyPage");

  return (
    <LegalPage
      backdropId="wpgPrivacy"
      eyebrow={t("eyebrow")}
      title={t("title")}
      standfirst={t("standfirst")}
      updated={t("updated")}
      sections={t.raw("sections")}
    />
  );
}
