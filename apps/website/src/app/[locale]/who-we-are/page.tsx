import { setRequestLocale } from "next-intl/server";
import { WhoWeAreBody } from "@storybridge/site-ui/who-we-are/body";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";
import { getSiteImage } from "@/lib/site-images";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("who-we-are");

export default async function WhoWeArePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const photo = await getSiteImage("who-we-are.photo");

  return <WhoWeAreBody photo={photo} />;
}
