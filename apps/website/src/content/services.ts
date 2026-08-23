/** Services & Packages copy, from "StoryBridge Website v2.dc.html". */

export const SERVICE_DESKS = [
  {
    mark: "¶",
    markSize: "30px",
    title: "Content & Editorial",
    body: "Articles, website content, social-media content, branded content and editorial material — written to a brief, researched properly, and edited before you ever see it.",
    items: [
      "Feature and news articles",
      "Website and landing copy",
      "Interviews and profiles",
      "Newsletters, written and managed",
      "Social and branded content",
      "Reports and editorial material",
    ],
  },
  {
    mark: "« »",
    markSize: "27px",
    title: "Translation & Localization",
    body: "Arabic, English and French — with attention to meaning, context, tone and audience. Maghrebi Arabic where the audience is Maghrebi.",
    items: [
      "AR ⇄ EN ⇄ FR translation",
      "Website and app localization",
      "Transcreation for campaigns",
      "Subtitles and transcripts",
      "Bilingual style guides",
      "Review of existing translations",
    ],
  },
  {
    mark: "§",
    markSize: "30px",
    title: "Editing & Writing",
    body: "Editing, proofreading, rewriting and improving existing content while preserving its purpose and voice. The desk work behind a publishable piece.",
    items: [
      "Structural and line editing",
      "Proofreading and fact-checking",
      "Rewrites and restructuring",
      "Non-native English polish",
      "House style development",
      "Editorial review of drafts",
    ],
  },
  {
    mark: "†",
    markSize: "30px",
    title: "Media & Press Services",
    body: "Press coverage, journalistic content, media support and communication materials — including work on the ground when the assignment requires it.",
    items: [
      "Press releases and media kits",
      "Distribution to regional media",
      "Event and conference coverage",
      "Fixing and field production",
      "Research and background briefs",
      "Interviews and multimedia",
    ],
  },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "STAGE 01",
    title: "Brief",
    body: "A conversation, then a written brief you sign off on: audience, purpose, scope, tone, deadline.",
  },
  {
    stage: "STAGE 02",
    title: "Native writer",
    body: "Written or translated by someone working into their first language. Never the other way round.",
  },
  {
    stage: "STAGE 03",
    title: "Editor",
    body: "A second pair of eyes on structure, accuracy, tone and audience fit — a real edit, not a spellcheck.",
  },
  {
    stage: "STAGE 04",
    title: "QA & delivery",
    body: "Names, figures, links, terminology and formatting checked against the brief before it reaches you.",
  },
] as const;

/**
 * `band` is the board's optional indicative price line, behind its
 * `showPricingBands` prop. The brief calls pricing transparency a
 * differentiator, so it ships on — flip SHOW_PRICE_BANDS to hide.
 */
export const SHOW_PRICE_BANDS = true;

export const PACKAGES = [
  {
    desk: "Content & Editorial",
    name: "Article Pack",
    body: "A run of researched articles — four, eight or twelve — commissioned, written, edited and delivered on a publishing schedule.",
    items: [
      "Brief and angle development",
      "Research and interviews as needed",
      "Full edit and QA on each piece",
      "One language, or all three",
    ],
    band: "indicative · $80–250 per article",
  },
  {
    desk: "Content & Editorial",
    name: "Website Content",
    body: "Every page of a site written from scratch or rewritten — structure, voice and hierarchy included, not just words in boxes.",
    items: [
      "Page-by-page content plan",
      "Home, about, services, contact",
      "Tone-of-voice note for future pages",
      "Trilingual versions available",
    ],
  },
  {
    desk: "Media & Press",
    name: "Press Release + Distribution",
    body: "Written the way a newsroom wants to receive it, then sent to the regional media that would actually run it.",
    items: [
      "Release drafted in AR / FR / EN",
      "Media list built for the story",
      "Distribution and follow-up",
      "Coverage report",
    ],
    band: "indicative · retainers $1,000–3,000 / month",
  },
  {
    desk: "Translation",
    name: "Localization",
    body: "Your existing material carried into Arabic, French or English so it reads as though it was written there.",
    items: [
      "Translation by a native writer",
      "Editor review against the source",
      "Terminology and glossary kept",
      "Maghrebi register on request",
    ],
    band: "indicative · $0.06–0.12 per word",
  },
  {
    desk: "Editing",
    name: "Editorial Polish",
    body: "You wrote it. We make it publishable — structure, accuracy and tone, with your voice left intact.",
    items: [
      "Structural and line edit",
      "Fact and consistency check",
      "Tracked changes and a short note",
      "Per project or per batch",
    ],
    band: "indicative · $0.02–0.05 per word",
  },
] as const;

export const LAUNCH_PACKAGE = {
  eyebrow: "All four desks · bundled",
  name: "Launch Package",
  body: "For a product, campaign or organisation going public: content, translation, press release and distribution, run as one assignment by one manager.",
  items: [
    "Core content set, written",
    "Trilingual versions",
    "Press release + media distribution",
    "Coverage report and follow-through",
  ],
} as const;

export const QUOTE_STEPS = [
  { n: "01", body: "You send a brief, a link, or a rough idea." },
  { n: "02", body: "We ask the questions that change the price — length, research, languages, deadline." },
  { n: "03", body: "You get a written scope and a fixed quote within two working days." },
  { n: "04", body: "One project manager runs it from there." },
] as const;
