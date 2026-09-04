import { setRequestLocale } from "next-intl/server";
import { HowWeWorkBody } from "@storybridge/site-ui/how-we-work/body";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";
import { getSiteImage } from "@/lib/site-images";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("how-we-work");

export default async function HowWeWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fieldPhoto = await getSiteImage("how-we-work.field-photo");

  return <HowWeWorkBody fieldPhoto={fieldPhoto} />;
}
