/**
 * Journal index + the one fully-written post from the board.
 *
 * This is placeholder editorial that the CMS's Journal module will own
 * (roadmap Phase 05). Shape mirrors the fields the CMS article editor shows:
 * kicker/section, title, standfirst, author, date, language versions, body.
 */

export type JournalPost = {
  slug: string;
  section: string;
  readTime: string;
  date?: string;
  title: string;
  standfirst: string;
  author?: string;
  authorRole?: string;
  languages?: readonly string[];
  lead?: boolean;
};

export const JOURNAL_INDEX: readonly JournalPost[] = [
  {
    slug: "arabic-copy-sounds-foreign-in-tunis",
    section: "Translation",
    readTime: "6 min read",
    date: "March 2026",
    title: "Why your Arabic copy sounds foreign in Tunis",
    standfirst:
      "Most Arabic content aimed at North Africa is written for a Gulf ear and translated by people who have never had to sell anything in Tunis, Algiers or Casablanca. Here is what that costs you.",
    author: "Imen Bliwa",
    lead: true,
  },
  {
    slug: "the-brief-is-the-deliverable",
    section: "Editorial craft",
    readTime: "8 min",
    title: "The brief is the deliverable",
    standfirst: "Most content fails before a word is written. A newsroom fix for a marketing problem.",
  },
  {
    slug: "what-a-fixer-actually-does",
    section: "Field & media",
    readTime: "5 min",
    title: "What a fixer actually does",
    standfirst: "Access, contacts, permissions, timing — the invisible work behind a shoot that runs.",
  },
  {
    slug: "three-languages-one-press-release",
    section: "The Maghreb",
    readTime: "7 min",
    title: "Three languages, one press release",
    standfirst: "How a Tunisian announcement should read differently in Arabic, French and English.",
  },
  {
    slug: "every-piece-needs-a-reason-to-exist",
    section: "Editorial craft",
    readTime: "4 min",
    title: "Every piece needs a reason to exist",
    standfirst: "On refusing to fill space, and what to publish instead.",
  },
];

export const JOURNAL_SECTIONS = [
  "All",
  "Translation",
  "Editorial craft",
  "Field & media",
  "The Maghreb",
] as const;

/** The one post the board writes out in full. Others render a "not yet" note. */
export const FEATURED_POST = {
  slug: "arabic-copy-sounds-foreign-in-tunis",
  section: "Translation",
  readTime: "6 min read",
  title: "Why your Arabic copy sounds foreign in Tunis",
  standfirst:
    "Most Arabic content aimed at North Africa is written for a Gulf ear. Your readers notice — even when they can't tell you why.",
  author: "Imen Bliwa",
  authorRole: "Co-founder · 14 March 2026",
  languages: ["AR", "FR"],
  caption: "Caption line — where the photograph was taken and who took it.",
  dropCap: "T",
  body: [
    {
      type: "para-drop" as const,
      text: "here is a version of Arabic that lives on brochures, in press releases and across half the region's websites. It is grammatically correct. It is also unmistakably borrowed — the register of a Gulf agency, applied to an audience in Tunis, Algiers or Casablanca that speaks and reads differently.",
    },
    {
      type: "para" as const,
      text: "Modern Standard Arabic is a real, shared language, and there are contexts where it is exactly right. The problem is not MSA itself. The problem is treating it as a neutral default, and assuming that a translator who has never worked with a North African audience will land the same way as one who has.",
    },
    { type: "h2" as const, text: "What readers actually notice" },
    {
      type: "para" as const,
      text: "Rarely the grammar. Almost always the vocabulary choices, the sentence rhythm, and the assumptions underneath: what needs explaining, what can be taken for granted, which institutions get named, which examples ring true. A Tunisian reader will finish the paragraph and come away with the impression that it was not written for them — without necessarily being able to point to the word that gave it away.",
    },
    {
      type: "pullquote" as const,
      text: "Translation is not replacing one word with another. It is carrying context, culture, tone, audience and purpose across, so the message feels native in its new language.",
    },
    {
      type: "para" as const,
      text: "This is the part that no glossary and no machine solves for you. It is a judgement call made by someone who knows the audience, checked by an editor who also knows the audience — which is why we run every translation through both, in that order.",
    },
    { type: "h2" as const, text: "Three questions before you commission anything in Arabic" },
    {
      type: "numbered" as const,
      items: [
        "Where does the reader live, and what do they read on an ordinary day?",
        "Is this a formal document, or is it meant to persuade someone?",
        "Who is going to read the Arabic back before it publishes — and are they from the audience?",
      ],
    },
    {
      type: "para" as const,
      text: "If the answer to the third one is nobody, that is the gap. It is also the cheapest one to close.",
    },
  ],
  bio: "is a journalist, translator and researcher working across Arabic, English and French, and a co-founder of StoryBridge Content & Media.",
};

export const NEWSLETTER_ISSUES = [
  { issue: "ISSUE 06 · FEBRUARY", title: "When the client is also the source" },
  { issue: "ISSUE 05 · JANUARY", title: "A style guide is a business document" },
  { issue: "ISSUE 04 · DECEMBER", title: "The year in Maghrebi media" },
  { issue: "ISSUE 03 · NOVEMBER", title: "Interviews people actually finish" },
  { issue: "ISSUE 02 · OCTOBER", title: "Against the content calendar" },
  { issue: "ISSUE 01 · SEPTEMBER", title: "Why we started StoryBridge" },
] as const;
