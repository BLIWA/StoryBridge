/**
 * Seed content for the CMS, taken from "StoryBridge CMS.dc.html".
 *
 * IMPORTANT: this is the design board's sample data, held in React state. It is
 * NOT persisted — every view reads and writes this in memory, so edits vanish on
 * reload. Firestore collections replace it in roadmap Phase 05–06; the shapes
 * below are deliberately the shapes those collections should have.
 */

export type ArticleStatus = "Draft" | "In review" | "Scheduled" | "Published";

export type Article = {
  id: string;
  title: string;
  slug: string;
  lang: string;
  cat: string;
  author: string;
  status: ArticleStatus;
  date: string;
  words: number;
  excerpt: string;
  body: string;
};

export const ARTICLES: Article[] = [
  {
    id: "a1",
    title: "What a newsroom taught us about client work",
    slug: "newsroom-client-work",
    lang: "EN",
    cat: "Editorial",
    author: "Assia Touati",
    status: "Published",
    date: "12 Aug 2026",
    words: 1240,
    excerpt:
      "Deadlines, sources, second readers — the habits that survive the move from the newsroom to a brief.",
    body: "The first thing a newsroom teaches you is that a deadline is not a suggestion.\n\nThe second is that nothing goes out unread. Every piece we publish for a client passes a second editor, the same way copy passed the desk.\n\nWhat changed when we started StoryBridge was not the standard. It was the brief.",
  },
  {
    id: "a2",
    title: "Translating a brand voice into Arabic without flattening it",
    slug: "arabic-brand-voice",
    lang: "AR · EN",
    cat: "Translation",
    author: "Imen Bliwa",
    status: "Published",
    date: "28 Jul 2026",
    words: 1610,
    excerpt:
      "Most Arabic brand copy reads translated because it was. Here is the difference between transferring words and carrying a voice.",
    body: "A brand voice is a set of decisions: how formal, how warm, how much distance from the reader.\n\nRun those decisions through a dictionary and you get sentences that are correct and dead.",
  },
  {
    id: "a3",
    title: "Le brief, ce document qu'on saute trop souvent",
    slug: "le-brief",
    lang: "FR",
    cat: "Editorial",
    author: "Imen Bliwa",
    status: "In review",
    date: "20 Aug 2026",
    words: 980,
    excerpt: "Un bon brief coûte une heure. Son absence coûte trois versions.",
    body: "Personne n'aime écrire un brief. Tout le monde aime en avoir un.\n\nUn brief utile tient sur une page : à qui on parle, ce qu'on veut que cette personne fasse, et ce qu'on ne dira pas.\n\nLe reste — le ton, la longueur, les exemples — se décide en dix minutes une fois ces trois lignes posées.",
  },
  {
    id: "a4",
    title: "الصحافة الميدانية في تونس: ما يبقى بعد الخبر",
    slug: "field-reporting-tunis",
    lang: "AR",
    cat: "Media",
    author: "Assia Touati",
    status: "Draft",
    date: "22 Aug 2026",
    words: 640,
    excerpt: "ما الذي يبقى من التغطية بعد أن ينتهي الخبر ويغادر الجميع؟",
    body: "كل تغطية ميدانية تترك شيئًا لا يدخل في الخبر.",
  },
  {
    id: "a5",
    title: "Why we still write to a brief, not a word count",
    slug: "brief-not-word-count",
    lang: "EN",
    cat: "Editorial",
    author: "Assia Touati",
    status: "Scheduled",
    date: "30 Aug 2026",
    words: 1120,
    excerpt: "A word count tells a writer when to stop. A brief tells them why to start.",
    body: "Word counts are a procurement habit, not an editorial one.",
  },
  {
    id: "a6",
    title: "Six questions we ask before writing a single line",
    slug: "six-questions",
    lang: "EN",
    cat: "How we work",
    author: "Imen Bliwa",
    status: "Draft",
    date: "18 Aug 2026",
    words: 410,
    excerpt: "The intake call, written down.",
    body: "Who is this for? What should change in their head? Who signs off?",
  },
];

export type Section = {
  id: string;
  name: string;
  type: string;
  edited: string;
  on: boolean;
  heading: string;
  body: string;
  cta: string;
  href: string;
};

export type Page = { key: string; name: string; path: string; edited: string; sections: Section[] };

export const PAGES: Page[] = [
  {
    key: "home",
    name: "Home",
    path: "/",
    edited: "today, 09:12",
    sections: [
      { id: "h1", name: "Hero — Journalistic standards", type: "Hero", edited: "today", on: true, heading: "Journalistic standards, applied to your content.", body: "StoryBridge Content & Media is a communications and multilingual content company founded by two journalists and editors who met in the newsroom and never stopped building ideas together.", cta: "Request a quote", href: "/contact" },
      { id: "h2", name: "Proof strip — four service lines", type: "Grid", edited: "12 Aug", on: true, heading: "Four lines of work, one desk", body: "Content and editorial, translation and localisation, editing and rewriting, media and journalism.", cta: "", href: "" },
      { id: "h3", name: "How we work — seven steps", type: "Editorial", edited: "09 Aug", on: true, heading: "We work the way a newsroom works", body: "Brief, angle, research, draft, second reader, delivery, and we stay involved after publication.", cta: "See how we work", href: "/how-we-work" },
      { id: "h4", name: "Founders note", type: "Editorial", edited: "02 Aug", on: true, heading: "Founded by Assia Touati and Imen Bliwa", body: "An editor-in-chief and a journalist-translator, ten years and one newsroom apart.", cta: "Meet the founders", href: "/founders" },
      { id: "h5", name: "From the Journal — three teasers", type: "Feed", edited: "today", on: true, heading: "From the Journal", body: "Our own writing, published in the open — the shortest way to judge whether we can write yours.", cta: "All pieces", href: "/journal" },
      { id: "h6", name: "The Bridge signup", type: "Form", edited: "28 Jul", on: true, heading: "One letter a month, worth the open.", body: "Language, media and the Maghreb — what we are reading and what we are arguing about.", cta: "Subscribe", href: "/newsletter" },
      { id: "h7", name: "Client logos", type: "Grid", edited: "15 Jul", on: false, heading: "Trusted by", body: "Hidden until three clients have agreed to be named.", cta: "", href: "" },
    ],
  },
  {
    key: "who",
    name: "Who We Are",
    path: "/who-we-are",
    edited: "19 Aug",
    sections: [
      { id: "w1", name: "Page header", type: "Hero", edited: "19 Aug", on: true, heading: "Two journalists, one desk.", body: "StoryBridge was founded in Tunis by two women who spent a decade in newsrooms before building this.", cta: "", href: "" },
      { id: "w2", name: "The company in three paragraphs", type: "Editorial", edited: "19 Aug", on: true, heading: "What we are", body: "A boutique editorial house: small on purpose, senior on every file.", cta: "", href: "" },
      { id: "w3", name: "Values — four cards", type: "Grid", edited: "11 Aug", on: true, heading: "What we hold to", body: "Accuracy, context, tone, and the reader's time.", cta: "", href: "" },
      { id: "w4", name: "Languages we work in", type: "Grid", edited: "11 Aug", on: true, heading: "Arabic, French, English", body: "Written natively in all three, not translated into two.", cta: "", href: "" },
    ],
  },
  {
    key: "founders",
    name: "Founders",
    path: "/founders",
    edited: "14 Aug",
    sections: [
      { id: "f1", name: "Page header", type: "Hero", edited: "14 Aug", on: true, heading: "The two of us", body: "An editor-in-chief and a journalist-translator.", cta: "", href: "" },
      { id: "f2", name: "Assia Touati", type: "Profile", edited: "14 Aug", on: true, heading: "Assia Touati", body: "Editor-in-chief. Ten years of desk work across Tunisian and regional titles.", cta: "", href: "" },
      { id: "f3", name: "Imen Bliwa", type: "Profile", edited: "14 Aug", on: true, heading: "Imen Bliwa", body: "Journalist and translator. Field reporting, international media, Arabic–English–French.", cta: "", href: "" },
      { id: "f4", name: "How we met", type: "Editorial", edited: "02 Aug", on: true, heading: "One newsroom, two chairs apart", body: "The story of the desk this company came from.", cta: "", href: "" },
    ],
  },
  {
    key: "how",
    name: "How We Work",
    path: "/how-we-work",
    edited: "09 Aug",
    sections: [
      { id: "x1", name: "Page header", type: "Hero", edited: "09 Aug", on: true, heading: "We work the way a newsroom works.", body: "Seven steps, from brief to after publication.", cta: "", href: "" },
      { id: "x2", name: "Steps 01–07", type: "Editorial", edited: "09 Aug", on: true, heading: "The seven steps", body: "Brief, angle, research, draft, second reader, delivery, follow-through.", cta: "", href: "" },
      { id: "x3", name: "Turnaround table", type: "Table", edited: "22 Jul", on: true, heading: "What things take", body: "Typical turnaround by format and language pair.", cta: "", href: "" },
      { id: "x4", name: "CTA — start a brief", type: "CTA", edited: "22 Jul", on: true, heading: "Start with a brief, not a word count.", body: "Tell us who it is for and what should change.", cta: "Request a quote", href: "/contact" },
    ],
  },
  {
    key: "services",
    name: "Services",
    path: "/services",
    edited: "16 Aug",
    sections: [
      { id: "s1", name: "Page header", type: "Hero", edited: "16 Aug", on: true, heading: "Four lines of work", body: "Content and editorial, translation, editing, media.", cta: "", href: "" },
      { id: "s2", name: "Content & Editorial", type: "Service", edited: "16 Aug", on: true, heading: "Content & Editorial", body: "Articles, website copy, interviews, newsletters, social and branded content, reports.", cta: "", href: "" },
      { id: "s3", name: "Translation & Localisation", type: "Service", edited: "16 Aug", on: true, heading: "Translation & Localisation", body: "Arabic, French and English — meaning, context, tone and audience.", cta: "", href: "" },
      { id: "s4", name: "Editing & Rewriting", type: "Service", edited: "16 Aug", on: true, heading: "Editing & Rewriting", body: "Review, proofreading and rewriting that keeps the purpose and the voice.", cta: "", href: "" },
      { id: "s5", name: "Media & Journalism", type: "Service", edited: "16 Aug", on: true, heading: "Media & Journalism", body: "Reporting, media content, communications material and field support.", cta: "", href: "" },
    ],
  },
  {
    key: "pricing",
    name: "Packages",
    path: "/packages",
    edited: "07 Aug",
    sections: [
      { id: "p1", name: "Page header", type: "Hero", edited: "07 Aug", on: true, heading: "Priced by the work, not the word.", body: "Three packages and a retainer.", cta: "", href: "" },
      { id: "p2", name: "Article Pack", type: "Package", edited: "07 Aug", on: true, heading: "Article Pack", body: "Four, eight or twelve researched articles on a publishing schedule.", cta: "Request a quote", href: "/contact" },
      { id: "p3", name: "Localisation Pack", type: "Package", edited: "07 Aug", on: true, heading: "Localisation Pack", body: "A site or campaign carried into a second and third language.", cta: "Request a quote", href: "/contact" },
      { id: "p4", name: "Editorial retainer", type: "Package", edited: "07 Aug", on: true, heading: "Editorial retainer", body: "A monthly desk: planning, writing, editing, publishing.", cta: "Request a quote", href: "/contact" },
      { id: "p5", name: "Price bands", type: "Table", edited: "07 Aug", on: false, heading: "Indicative bands", body: "Hidden until the autumn rate card is agreed.", cta: "", href: "" },
    ],
  },
];

export type Message = {
  id: string;
  name: string;
  org: string;
  email: string;
  subject: string;
  need: string;
  langs: string;
  deadline: string;
  when: string;
  status: "New" | "Replied" | "Archived";
  body: string;
};

export const MESSAGES: Message[] = [
  {
    id: "m1",
    name: "Sonia Ben Amor",
    org: "MedTech Tunisie",
    email: "s.benamor@medtech.tn",
    subject: "Three-language relaunch",
    need: "Translation & localization",
    langs: "FR → AR, EN",
    deadline: "15 Sep 2026",
    when: "2 days ago",
    status: "New",
    body: "We are relaunching our site in September and need the whole thing carried from French into Arabic and English. Roughly 14 pages plus a press release. Can you quote against a deadline of 15 September?",
  },
  {
    id: "m2",
    name: "Karim Haddad",
    org: "Institut du Maghreb",
    email: "k.haddad@institut-maghreb.org",
    subject: "Monthly editorial partnership",
    need: "Content & editorial",
    langs: "AR, FR",
    deadline: "Ongoing",
    when: "4 days ago",
    status: "New",
    body: "We publish a research bulletin and would like help commissioning and editing it each month. Could we talk about a retainer?",
  },
  {
    id: "m3",
    name: "Leïla Mansour",
    org: "Freelance",
    email: "leila.mansour@gmail.com",
    subject: "Editing an English report",
    need: "Editing & writing",
    langs: "EN",
    deadline: "01 Sep 2026",
    when: "1 week ago",
    status: "Replied",
    body: "I have a 9,000-word report written in English by non-native speakers. It needs a structural edit before it goes to a funder.",
  },
];

export const ISSUES = [
  { no: "08", subject: "The Bridge · No. 08 — What a brief is for", date: "01 Sep 2026", audience: "1,904 recipients", status: "Draft", stats: "— · —" },
  { no: "07", subject: "The word that cost a campaign its audience", date: "01 Aug 2026", audience: "1,842 recipients", status: "Sent", stats: "48.2% open · 9.1% click" },
  { no: "06", subject: "When the client is also the source", date: "01 Jul 2026", audience: "1,780 recipients", status: "Sent", stats: "51.0% open · 7.4% click" },
  { no: "05", subject: "A style guide is a business document", date: "01 Jun 2026", audience: "1,701 recipients", status: "Sent", stats: "46.8% open · 6.2% click" },
] as const;

export const SUBSCRIBERS = [
  { email: "s.benamor@medtech.tn", name: "Sonia Ben Amor", lang: "FR", source: "Contact form", joined: "18 Aug 2026" },
  { email: "k.haddad@institut-maghreb.org", name: "Karim Haddad", lang: "AR", source: "Journal", joined: "12 Aug 2026" },
  { email: "editor@lapresse.tn", name: "—", lang: "FR", source: "Journal", joined: "09 Aug 2026" },
  { email: "n.trabelsi@ovium.io", name: "Nadia Trabelsi", lang: "EN", source: "Newsletter page", joined: "02 Aug 2026" },
  { email: "hello@studiokaf.com", name: "Studio Kaf", lang: "EN", source: "Referral", joined: "28 Jul 2026" },
  { email: "m.gharbi@unitunis.tn", name: "Mehdi Gharbi", lang: "AR", source: "Journal", joined: "21 Jul 2026" },
] as const;

export const STAFF = [
  { name: "Assia Touati", email: "assia@storybridge.tn", role: "Owner", scope: "Everything, including people and billing", mfa: "2FA on" },
  { name: "Imen Bliwa", email: "imen@storybridge.tn", role: "Chief", scope: "Publishing, pages, newsletter, inbox", mfa: "2FA on" },
  { name: "Nadia Trabelsi", email: "nadia@storybridge.tn", role: "Journalist", scope: "Writes and edits; publishing goes through review", mfa: "2FA on" },
  { name: "Youssef Karray", email: "youssef@freelance.tn", role: "Contributor", scope: "Own drafts only", mfa: "Not set" },
] as const;

export const ROLE_MATRIX = [
  { cap: "Write and edit own drafts", c1: "●", c2: "●", c3: "●", c4: "●" },
  { cap: "Edit anyone's draft", c1: "●", c2: "●", c3: "●", c4: "—" },
  { cap: "Publish to the live site", c1: "●", c2: "●", c3: "—", c4: "—" },
  { cap: "Edit pages and sections", c1: "●", c2: "●", c3: "—", c4: "—" },
  { cap: "Send The Bridge", c1: "●", c2: "●", c3: "—", c4: "—" },
  { cap: "Manage people and access", c1: "●", c2: "—", c3: "—", c4: "—" },
] as const;

export const ACTIVITY = [
  { when: "09:12", text: "Assia published “What a newsroom taught us about client work”." },
  { when: "08:50", text: "Journal index reordered — featured piece pinned." },
  { when: "Yest.", text: "Imen submitted a French piece for review." },
  { when: "Yest.", text: "Contact form: budget range field switched off." },
  { when: "21 Aug", text: "12 new Bridge subscribers from the Journal." },
] as const;

export const BRIDGE_PICKS = [
  { id: "p1", title: "What a newsroom taught us about client work", on: true },
  { id: "p2", title: "Translating a brand voice into Arabic without flattening it", on: true },
  { id: "p3", title: "Why we still write to a brief, not a word count", on: false },
  { id: "p4", title: "Six questions we ask before writing a single line", on: true },
] as const;

/** Status pill colours from the board. */
export function pill(status: string): { bg: string; fg: string } {
  switch (status) {
    case "Published":
    case "Sent":
    case "Replied":
      return { bg: "#E2EDE7", fg: "#2F6B4F" };
    case "In review":
      return { bg: "#F6EADB", fg: "#8F6135" };
    case "Scheduled":
      return { bg: "#E5EBF3", fg: "#002D62" };
    case "New":
      return { bg: "#F6EADB", fg: "#8F6135" };
    default:
      return { bg: "#EDE9E2", fg: "#5A6472" };
  }
}
