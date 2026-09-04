import { setRequestLocale } from "next-intl/server";
import { NewsletterBody } from "@storybridge/site-ui/newsletter/body";
import type { AppLocale } from "@storybridge/site-ui/navigation";
import { listSentIssues } from "@/lib/bridge-issues";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("newsletter");

export default async function NewsletterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const issues = await listSentIssues(locale);
  return <NewsletterBody issues={issues} locale={locale as AppLocale} />;
}
