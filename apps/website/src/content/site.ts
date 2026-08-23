/**
 * Copy from the design board and the source documents (Who_We_Are.md, How.md).
 *
 * This is the interim home for content that the CMS will own once the Journal /
 * Pages modules exist (roadmap Phase 05–07). Keeping it in one module means the
 * migration is a swap of this file's exports, not a hunt through JSX.
 */

export const PILLARS = [
  {
    mark: "¶",
    title: "Content & Editorial",
    short: "Articles, website copy, social and branded content — written to a brief, not to a word count.",
    long: "Articles, website content, social-media content, branded content and editorial material.",
  },
  {
    mark: "« »",
    title: "Translation & Localization",
    short: "Arabic, English and French — context, culture and tone carried across, not just words.",
    long: "Arabic, English and French translation, with attention to meaning, context, tone and audience.",
  },
  {
    mark: "§",
    title: "Editing & Writing",
    short: "Editing, proofreading and rewriting that preserves the purpose and the voice already there.",
    long: "Editing, proofreading, rewriting and improving existing content while preserving its purpose and voice.",
  },
  {
    mark: "†",
    title: "Media & Press",
    longTitle: "Media & Press Services",
    short: "Press coverage, journalistic content, field reporting and fixing — we go where the story is.",
    long: "Press coverage, journalistic content, media-related support and communication materials.",
  },
] as const;

export const TRUST_SIGNALS = [
  {
    label: "Newsroom-trained",
    body: "A decade-plus in journalism, translation and international media.",
  },
  {
    label: "Maghrebi Arabic",
    body: "North African nuance — not Gulf-centric MSA dropped on a Tunisian audience.",
  },
  {
    label: "Visible desk process",
    body: "Brief → native writer → editor → QA. You see every stage.",
  },
  {
    label: "One contact",
    body: "A single project manager per assignment, start to delivery.",
  },
] as const;

export const DESK_STAGES = [
  { n: "01", title: "Brief", body: "We ask before we write." },
  { n: "02", title: "Native writer", body: "First language, every time." },
  { n: "03", title: "Editor", body: "Structure, accuracy, tone." },
  { n: "04", title: "QA", body: "Facts, names, numbers, links." },
] as const;

export const JOURNAL_POSTS = [
  {
    slug: "arabic-copy-sounds-foreign-in-tunis",
    kicker: "Translation · 6 min",
    title: "Why your Arabic copy sounds foreign in Tunis",
    standfirst:
      "Gulf-standard Arabic is not a neutral default. What Maghrebi audiences actually hear.",
  },
  {
    slug: "the-brief-is-the-deliverable",
    kicker: "Craft · 8 min",
    title: "The brief is the deliverable",
    standfirst:
      "Most content fails before a word is written. A newsroom fix for a marketing problem.",
  },
  {
    slug: "what-a-fixer-actually-does",
    kicker: "Field · 5 min",
    title: "What a fixer actually does",
    standfirst:
      "Access, contacts, permissions, timing — the invisible work behind a shoot that runs.",
  },
] as const;

/**
 * The seven steps from How.md. The board gives each step a different right-hand
 * column — a pull quote, a list, a photo, or the three-language card — so the
 * optional fields below are what the page switches on.
 */
export type ProcessStep = {
  n: string;
  title: string;
  body: string;
  body2?: string;
  aside?: string;
  list?: readonly string[];
  listLast?: string;
  photo?: string;
  languageCard?: boolean;
};

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    n: "01",
    title: "We listen first",
    body: "Every assignment starts with a conversation. We want to understand what you need, who you are speaking to, what you want to achieve and what the story is really about.",
    aside:
      "We ask questions before we start producing. The better we understand the brief, the better we can tell the story.",
  },
  {
    n: "02",
    title: "We build the right approach",
    body: "Not every story needs the same treatment. We bring together the right people, skills, languages and tools for each assignment.",
    list: [
      "Some require research and interviews.",
      "Some require a journalist on the ground.",
      "Some need a strong editor.",
      "Some need translation that understands context, not just words.",
    ],
    listLast: "Others need all of it at once.",
  },
  {
    n: "03",
    title: "We go beyond the desk",
    body: "Some stories cannot be told from behind a screen. When the assignment requires it, we are there — reporting, interviews, events, press coverage, research, fixing and multimedia content.",
    body2:
      "Our experience in field journalism means we understand the realities of working on location: finding contacts, navigating the environment, arranging access and getting the material needed to tell the story properly.",
    photo: "photo — on assignment, field",
    aside: "We don't just tell you what is happening. We go and find out.",
  },
  {
    n: "04",
    title: "We create with purpose",
    body: "Whether we are writing an article, creating digital content, editing a text or producing communication material, we focus on clarity, accuracy, tone and audience.",
    aside: "We don't believe in filling space. Every piece of content needs a reason to exist.",
  },
  {
    n: "05",
    title: "We connect languages and cultures",
    body: "Translation, for us, is not simply replacing one word with another. We consider context, culture, tone, audience and purpose so the message feels natural in its new language while keeping the meaning and intention of the original.",
    languageCard: true,
  },
  {
    n: "06",
    title: "We deliver",
    body: "Content is often needed on time, not eventually. Once the work is agreed, we set the scope, timeline and deliverables clearly and keep communication open throughout the assignment.",
    body2:
      "For urgent or field-based work, our experience allows us to respond quickly and work under pressure without losing sight of quality.",
    aside: "We show up. We do the work. We deliver.",
  },
  {
    n: "07",
    title: "And we stay involved",
    body: "For clients who need more than a one-off assignment, we can become an ongoing content and media partner — regular articles and translations, social content, editorial support, media coverage and field assignments on a recurring basis.",
    aside:
      "Because the best work often comes from knowing the client, understanding their voice and building trust over time.",
  },
] as const;
