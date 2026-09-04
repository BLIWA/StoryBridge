import enDefaults from "@storybridge/content/messages/en.json";

/**
 * The chip bar's source of truth: one entry per real page on the site (plus
 * two "site-wide" entries for the header/footer chrome), each naming the
 * catalog namespace(s) it draws from. `live` names which high-fidelity
 * preview to mount — see live-preview.tsx. Journal and Newsletter both pull
 * in real Firestore data (published articles, sent Bridge issues) alongside
 * their catalog copy — live-preview.tsx fetches its own live equivalent of
 * that data (see its watchPublishedArticles/watchSentIssues) so their chips
 * get the same high-fidelity preview as every other page.
 */

export type LiveKind =
  | "home"
  | "who-we-are"
  | "founders"
  | "how-we-work"
  | "services"
  | "packages"
  | "work"
  | "journal"
  | "newsletter"
  | "contact"
  | "privacy"
  | "terms"
  | "cookies"
  | "header"
  | "footer";

export type PageEntry = {
  id: string;
  label: string;
  group: "page" | "site-wide";
  /** Catalog namespaces this page's fallback field list shows. */
  namespaces: string[];
  live?: LiveKind;
};

export const PAGES: PageEntry[] = [
  { id: "home", label: "Home", group: "page", namespaces: ["Home", "Pillars", "JournalPosts", "NewsletterSignup"], live: "home" },
  { id: "who-we-are", label: "Who We Are", group: "page", namespaces: ["WhoWeAre", "Pillars"], live: "who-we-are" },
  { id: "founders", label: "Founders", group: "page", namespaces: ["Founders"], live: "founders" },
  { id: "how-we-work", label: "How We Work", group: "page", namespaces: ["HowWeWork", "Desks"], live: "how-we-work" },
  { id: "services", label: "Services", group: "page", namespaces: ["Services", "Desks"], live: "services" },
  { id: "packages", label: "Packages", group: "page", namespaces: ["Packages", "Desks"], live: "packages" },
  { id: "work", label: "Work", group: "page", namespaces: ["Work"], live: "work" },
  { id: "journal", label: "Journal", group: "page", namespaces: ["Journal", "Article"], live: "journal" },
  { id: "newsletter", label: "Newsletter", group: "page", namespaces: ["Newsletter", "NewsletterSignup"], live: "newsletter" },
  { id: "contact", label: "Contact", group: "page", namespaces: ["Contact", "ContactForm"], live: "contact" },
  { id: "privacy", label: "Privacy", group: "page", namespaces: ["PrivacyPage"], live: "privacy" },
  { id: "terms", label: "Terms", group: "page", namespaces: ["TermsPage"], live: "terms" },
  { id: "cookies", label: "Cookies", group: "page", namespaces: ["CookiePage"], live: "cookies" },
  { id: "header", label: "Header", group: "site-wide", namespaces: ["Nav"], live: "header" },
  { id: "footer", label: "Footer", group: "site-wide", namespaces: ["Footer"], live: "footer" },
];

// Superseded by real Firestore articles — see apps/website/src/content/journal.ts.
// Editing its old placeholder strings would touch nothing live, so — same as
// the previous flat editor — it stays unreachable rather than just confusing.
const DEAD_NAMESPACES = new Set(["FeaturedPost"]);

/** Every catalog namespace, in file order. */
export const ALL_NAMESPACES = Object.keys(enDefaults);

const COVERED = new Set(PAGES.flatMap((p) => p.namespaces));

/** Real catalog namespaces no page chip above claims — reachable via the "More" chip's plain field list. */
export const OTHER_NAMESPACES = ALL_NAMESPACES.filter((n) => !COVERED.has(n) && !DEAD_NAMESPACES.has(n));
