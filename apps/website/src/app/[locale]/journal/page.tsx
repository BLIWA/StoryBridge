import { setRequestLocale } from "next-intl/server";
import { JournalBody } from "@storybridge/site-ui/journal/body";
import { listPublishedArticles } from "@/lib/articles";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("journal");

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const articles = await listPublishedArticles(locale);
  return <JournalBody articles={articles} />;
}
