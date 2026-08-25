/**
 * Seed content for the CMS, taken from "StoryBridge CMS.dc.html".
 *
 * IMPORTANT: `ARTICLES` below is the design board's sample data. It is no
 * longer what Studio reads — articles are real Firestore documents now (see
 * lib/articles.ts), and this array is unused dead data, kept only as a
 * reference for what the board's sample content looked like. Pages, issues,
 * subscribers and contact submissions are still in-memory only; their
 * collections land with the rest of Phase 05–06.
 */

export type ArticleStatus = "Draft" | "In review" | "Scheduled" | "Published";

/** The three language versions a piece can carry — see lib/languages.ts. */
export type LangCode = "EN" | "FR" | "AR";

export type LangContent = { title: string; slug: string; excerpt: string; body: string };

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
  /**
   * The other two language versions, keyed by code — the top-level
   * title/slug/excerpt/body above are always the *primary* language's content
   * (whichever code `lang` starts with), so a piece never has three sources
   * of truth for the same field. Absent or empty-string content means that
   * language hasn't been started. See components/views/article-editor.tsx.
   */
  translations?: Partial<Record<LangCode, LangContent>>;
  /** Names, in credit order after the primary `author`. */
  coAuthors?: string[];
  leadImage?: { url: string; path: string; alt: string; credit: string };
  /**
   * Normalized email of whoever created the piece. Absent on the seed data
   * above (it never went through lib/articles.ts's createArticle()); present
   * and immutable on every real article, because firestore.rules needs it to
   * tell "your own draft" from anyone else's — `author` is a display name,
   * not an identity.
   */
  authorEmail?: string;
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

/** Newsletter audiences. Counts are the segment size the composer estimates against. */
export const AUDIENCES = [
  { id: "all", label: "All subscribers", count: 1904 },
  { id: "en", label: "English", count: 1048 },
  { id: "fr", label: "Français", count: 512 },
  { id: "ar", label: "العربية", count: 344 },
  { id: "clients", label: "Clients only", count: 87 },
] as const;

export type AudienceId = (typeof AUDIENCES)[number]["id"];

export function audience(id: string): (typeof AUDIENCES)[number] {
  return AUDIENCES.find((a) => a.id === id) ?? AUDIENCES[0];
}

export type IssueStatus = "Draft" | "Scheduled" | "Sent" | "Canceled";

export type Issue = {
  no: string;
  subject: string;
  preheader: string;
  /**
   * The send slot, as an editor picks it: a wall-clock date and time read in
   * `zone`. Null on a draft that has not been given a window yet. See
   * lib/schedule.ts for why this is three fields and not one timestamp.
   */
  date: string | null;
  time: string | null;
  zone: string;
  audienceId: AudienceId;
  /** Ids from BRIDGE_PICKS that go in this letter. */
  picks: string[];
  status: IssueStatus;
  /** What was actually delivered to, on a sent issue — not the segment size today. */
  recipients: number | null;
  stats: string;
};

export const ISSUES: Issue[] = [
  {
    no: "08",
    subject: "The Bridge · No. 08 — What a brief is for",
    preheader: "Plus: three Arabic headlines we argued about for an hour.",
    date: "2026-09-01",
    time: "09:00",
    zone: "tunis",
    audienceId: "all",
    picks: ["p1", "p2", "p4"],
    status: "Draft",
    recipients: null,
    stats: "— · —",
  },
  {
    no: "07",
    subject: "The word that cost a campaign its audience",
    preheader: "One adjective, one wrong register, one campaign nobody finished reading.",
    date: "2026-08-01",
    time: "09:00",
    zone: "tunis",
    audienceId: "all",
    picks: ["p1", "p3"],
    status: "Sent",
    recipients: 1842,
    stats: "48.2% open · 9.1% click",
  },
  {
    no: "06",
    subject: "When the client is also the source",
    preheader: "Where the newsroom rule bends, and where it does not.",
    date: "2026-07-01",
    time: "09:00",
    zone: "tunis",
    audienceId: "all",
    picks: ["p2"],
    status: "Sent",
    recipients: 1780,
    stats: "51.0% open · 7.4% click",
  },
  {
    no: "05",
    subject: "A style guide is a business document",
    preheader: "Why the people who sign it off never read it.",
    date: "2026-06-01",
    time: "09:00",
    zone: "tunis",
    audienceId: "all",
    picks: ["p4"],
    status: "Sent",
    recipients: 1701,
    stats: "46.8% open · 6.2% click",
  },
];

/**
 * Every scheduling action taken on an issue, newest last. The composer appends
 * to this, and the Schedule tab is a read of it — so "who moved the September
 * letter, and when" has one answer instead of living in someone's memory.
 */
export type ScheduleAction = "Scheduled" | "Rescheduled" | "Canceled" | "Sent" | "Test sent" | "Draft saved";

export type ScheduleEvent = {
  id: string;
  /** ISO instant the entry was written. */
  at: string;
  issueNo: string;
  subject: string;
  action: ScheduleAction;
  detail: string;
  actor: string;
};

export const SCHEDULE_LOG: ScheduleEvent[] = [
  { id: "e1", at: "2026-05-27T10:20:00Z", issueNo: "05", subject: "A style guide is a business document", action: "Scheduled", detail: "Monday 1 June 2026 at 09:00 (UTC+1) · All subscribers · 1,701 recipients", actor: "Assia Touati" },
  { id: "e2", at: "2026-06-01T08:00:00Z", issueNo: "05", subject: "A style guide is a business document", action: "Sent", detail: "1,701 delivered · 46.8% open · 6.2% click", actor: "Scheduler" },
  { id: "e3", at: "2026-06-24T15:41:00Z", issueNo: "06", subject: "When the client is also the source", action: "Scheduled", detail: "Wednesday 1 July 2026 at 09:00 (UTC+1) · All subscribers · 1,780 recipients", actor: "Imen Bliwa" },
  { id: "e4", at: "2026-07-01T08:00:00Z", issueNo: "06", subject: "When the client is also the source", action: "Sent", detail: "1,780 delivered · 51.0% open · 7.4% click", actor: "Scheduler" },
  { id: "e5", at: "2026-07-28T09:05:00Z", issueNo: "07", subject: "The word that cost a campaign its audience", action: "Scheduled", detail: "Friday 31 July 2026 at 17:00 (UTC+1) · All subscribers · 1,842 recipients", actor: "Imen Bliwa" },
  { id: "e6", at: "2026-07-29T11:12:00Z", issueNo: "07", subject: "The word that cost a campaign its audience", action: "Test sent", detail: "Test copy to the desk", actor: "Assia Touati" },
  { id: "e7", at: "2026-07-29T11:30:00Z", issueNo: "07", subject: "The word that cost a campaign its audience", action: "Rescheduled", detail: "Moved from 31 Jul 2026 · 17:00 UTC+1 to 01 Aug 2026 · 09:00 UTC+1 — Friday evening is a dead slot", actor: "Assia Touati" },
  { id: "e8", at: "2026-08-01T08:00:00Z", issueNo: "07", subject: "The word that cost a campaign its audience", action: "Sent", detail: "1,842 delivered · 48.2% open · 9.1% click", actor: "Scheduler" },
  { id: "e9", at: "2026-08-19T14:02:00Z", issueNo: "08", subject: "The Bridge · No. 08 — What a brief is for", action: "Draft saved", detail: "Subject and four candidate pieces set", actor: "Imen Bliwa" },
]; 

export const SUBSCRIBERS = [
  { email: "s.benamor@medtech.tn", name: "Sonia Ben Amor", lang: "FR", source: "Contact form", joined: "18 Aug 2026" },
  { email: "k.haddad@institut-maghreb.org", name: "Karim Haddad", lang: "AR", source: "Journal", joined: "12 Aug 2026" },
  { email: "editor@lapresse.tn", name: "—", lang: "FR", source: "Journal", joined: "09 Aug 2026" },
  { email: "n.trabelsi@ovium.io", name: "Nadia Trabelsi", lang: "EN", source: "Newsletter page", joined: "02 Aug 2026" },
  { email: "hello@studiokaf.com", name: "Studio Kaf", lang: "EN", source: "Referral", joined: "28 Jul 2026" },
  { email: "m.gharbi@unitunis.tn", name: "Mehdi Gharbi", lang: "AR", source: "Journal", joined: "21 Jul 2026" },
] as const;

// STAFF and ROLE_MATRIX used to live here. People are real now: the roster is
// the Firestore `staff` collection and the role table is CAPABILITIES in
// lib/staff.ts, which firestore.rules enforces. See components/views/settings.tsx.

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
    case "Rescheduled":
      return { bg: "#E5EBF3", fg: "#002D62" };
    case "New":
      return { bg: "#F6EADB", fg: "#8F6135" };
    case "Canceled":
      return { bg: "#F3E3E3", fg: "#8A3B3B" };
    default:
      return { bg: "#EDE9E2", fg: "#5A6472" };
  }
}
