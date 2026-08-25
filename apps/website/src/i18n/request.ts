import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type AppLocale } from "./routing";
import { loadMessages } from "@/lib/site-content";
import en from "@storybridge/content/messages/en.json";
import fr from "@storybridge/content/messages/fr.json";
import ar from "@storybridge/content/messages/ar.json";

// Static imports, not a dynamic `import(\`…${locale}.json\`)` — a template-
// literal import across a workspace package's `exports` map isn't
// statically analyzable, and silently fails to resolve at build time
// (found the hard way: the build compiled clean and then broke on every
// single prerendered page with MODULE_NOT_FOUND).
const CATALOG: Record<AppLocale, typeof en> = { en, fr, ar };

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // The default catalog (packages/content) with any Firestore overrides
  // layered on top — see lib/site-content.ts. Every page component still
  // just calls useTranslations()/getTranslations() as before; this is the
  // one place that decides what those calls actually resolve to.
  const messages = await loadMessages(locale, CATALOG[locale]);

  return { locale, messages };
});
