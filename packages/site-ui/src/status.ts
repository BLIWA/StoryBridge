import type { AppLocale } from "./navigation";

/**
 * Which locales have been through a native review, and which are still drafts.
 *
 * Moved from apps/website/src/i18n/status.ts alongside translation-notice.tsx,
 * the one consumer that needs it — apps/website/src/i18n/status.ts now just
 * re-exports from here.
 *
 * StoryBridge sells translation quality. Shipping machine-drafted French and
 * Arabic on its own site without saying so is the one failure mode the brand
 * cannot afford, so the status is declared here, rendered to the reader as a
 * notice, and exposed to crawlers — rather than left as a comment in a JSON
 * file that nobody outside the repo can see.
 *
 * Clearing a locale is a two-line change: flip it to "reviewed" here and name
 * the reviewer. Nothing else in the app reads translation state.
 */

export type TranslationStatus =
  | { state: "source" }
  | { state: "reviewed"; reviewedBy: string }
  | { state: "draft" };

export const TRANSLATION_STATUS: Record<AppLocale, TranslationStatus> = {
  en: { state: "source" },
  // Drafted in-repo while wiring the trilingual layout. Not yet reviewed by
  // Imen — StoryBridge's own translator — so both stay flagged.
  fr: { state: "draft" },
  ar: { state: "draft" },
};

export function isDraftLocale(locale: string): boolean {
  const status = TRANSLATION_STATUS[locale as AppLocale];
  return status?.state === "draft";
}
