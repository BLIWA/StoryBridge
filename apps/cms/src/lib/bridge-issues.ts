/**
 * The Bridge's issues — real Firestore documents now, replacing the
 * in-memory ISSUES/SCHEDULE_LOG seed arrays content/seed.ts still exports
 * for reference. See firestore.rules' `bridgeIssues`/`bridgeLog` match
 * blocks and functions/src/index.ts's sendScheduledBridgeIssues, which is
 * what actually reaches a subscriber's inbox — everything here is
 * composing and bookkeeping.
 */

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";
import { primaryLangOf, langContentOf, langStarted } from "@/lib/languages";
import type { Article, LangCode } from "@/content/seed";

const COLLECTION = "bridgeIssues";

export type IssueStatus = "Draft" | "Scheduled" | "Sent" | "Canceled";

/** Real, data-backed segments — a lang value on file for an actual subscriber, or all of them. */
export type AudienceId = "all" | "en" | "fr" | "ar";

export const AUDIENCE_LABEL: Record<AudienceId, string> = {
  all: "All subscribers",
  en: "English",
  fr: "Français",
  ar: "العربية",
};

/**
 * Which optional blocks the rendered email shows, plus the pull quote's own
 * copy. `pickArticleIds`' order already decides feature vs. "Also from the
 * desk" (index 0 is the feature — see setFeature() in components/views/
 * issues.tsx), so no separate field is needed for that.
 */
export type IssueSections = {
  /** The hero image band under the dek — the feature piece's own lead image, or a textured placeholder when it has none. */
  showHero: boolean;
  showQuote: boolean;
  quoteText: string;
  quoteAttribution: string;
};

export const DEFAULT_ISSUE_SECTIONS: IssueSections = {
  showHero: true,
  showQuote: false,
  quoteText: "",
  quoteAttribution: "",
};

/**
 * functions/ is a standalone npm project outside the pnpm workspace (see
 * its package.json), so this can't import IssueSections' twin,
 * BridgeIssueSections in functions/src/templates.ts, and parses its own
 * copy of an issue's `sections` field (functions/src/index.ts's
 * parseBridgeSections()). Keep the two in sync by hand.
 */
function toSections(data: unknown): IssueSections {
  const d = (data ?? {}) as Partial<IssueSections>;
  return {
    showHero: typeof d.showHero === "boolean" ? d.showHero : DEFAULT_ISSUE_SECTIONS.showHero,
    showQuote: typeof d.showQuote === "boolean" ? d.showQuote : DEFAULT_ISSUE_SECTIONS.showQuote,
    quoteText: typeof d.quoteText === "string" ? d.quoteText : DEFAULT_ISSUE_SECTIONS.quoteText,
    quoteAttribution: typeof d.quoteAttribution === "string" ? d.quoteAttribution : DEFAULT_ISSUE_SECTIONS.quoteAttribution,
  };
}

export type Issue = {
  id: string;
  no: string;
  subject: string;
  preheader: string;
  date: string | null;
  time: string | null;
  zone: string;
  audienceId: AudienceId;
  /** Real article ids from the `articles` collection, in the order they run in the letter — index 0 is the feature. See components/views/issues.tsx. */
  pickArticleIds: string[];
  /** Which optional blocks (hero image, pull quote) the composed email shows. */
  sections: IssueSections;
  status: IssueStatus;
  /** Epoch ms the scheduled-send function watches for — set alongside date/time/zone, kept in step by toInstant(). */
  sendAt: number | null;
  /** What was actually delivered to, once sent — null until then. */
  recipients: number | null;
  stats: string;
};

function toIssue(id: string, data: Record<string, unknown>): Issue {
  return {
    id,
    no: typeof data.no === "string" ? data.no : "—",
    subject: typeof data.subject === "string" ? data.subject : "",
    preheader: typeof data.preheader === "string" ? data.preheader : "",
    date: typeof data.date === "string" ? data.date : null,
    time: typeof data.time === "string" ? data.time : null,
    zone: typeof data.zone === "string" ? data.zone : "tunis",
    audienceId: (["all", "en", "fr", "ar"] as const).includes(data.audienceId as AudienceId)
      ? (data.audienceId as AudienceId)
      : "all",
    pickArticleIds: Array.isArray(data.pickArticleIds) ? data.pickArticleIds.filter((p) => typeof p === "string") : [],
    sections: toSections(data.sections),
    status: (["Draft", "Scheduled", "Sent", "Canceled"] as const).includes(data.status as IssueStatus)
      ? (data.status as IssueStatus)
      : "Draft",
    sendAt: typeof data.sendAt === "number" ? data.sendAt : null,
    recipients: typeof data.recipients === "number" ? data.recipients : null,
    stats: typeof data.stats === "string" ? data.stats : "— · —",
  };
}

export function watchIssues(db: Firestore, onChange: (issues: Issue[]) => void, onError: (error: unknown) => void) {
  return onSnapshot(
    query(collection(db, COLLECTION), orderBy("no", "desc")),
    (snap) => onChange(snap.docs.map((d) => toIssue(d.id, d.data()))),
    onError,
  );
}

/** Zero-padded, one higher than the highest existing issue number — "08" after "07". */
export function nextIssueNo(issues: Issue[]): string {
  const highest = issues.reduce((max, i) => Math.max(max, Number(i.no) || 0), 0);
  return String(highest + 1).padStart(2, "0");
}

/** A fresh, unused document id — generated client-side, no network round trip. Same pattern as lib/articles.ts's newArticleId(). */
export function newIssueId(db: Firestore): string {
  return doc(collection(db, COLLECTION)).id;
}

/** Creates a brand-new issue. `issue.id` must come from newIssueId(). */
export async function createIssue(db: Firestore, issue: Issue): Promise<void> {
  const { id, ...fields } = issue;
  await setDoc(doc(db, COLLECTION, id), { ...fields, createdAt: serverTimestamp() });
}

export async function saveIssue(db: Firestore, issue: Issue): Promise<void> {
  const { id, ...fields } = issue;
  await setDoc(doc(db, COLLECTION, id), { ...fields, updatedAt: serverTimestamp() }, { merge: true });
}

// ---------------------------------------------------------------------------

export type ScheduleAction = "Scheduled" | "Rescheduled" | "Canceled" | "Sent" | "Test sent" | "Draft saved";

export type ScheduleEvent = {
  id: string;
  at: string;
  issueNo: string;
  subject: string;
  action: ScheduleAction;
  detail: string;
  actor: string;
};

function toScheduleEvent(id: string, data: Record<string, unknown>): ScheduleEvent {
  const at = (data.at as Timestamp | undefined)?.toDate?.();
  return {
    id,
    at: at ? at.toISOString() : new Date(0).toISOString(),
    issueNo: typeof data.issueNo === "string" ? data.issueNo : "",
    subject: typeof data.subject === "string" ? data.subject : "",
    action: typeof data.action === "string" ? (data.action as ScheduleAction) : "Draft saved",
    detail: typeof data.detail === "string" ? data.detail : "",
    actor: typeof data.actor === "string" ? data.actor : "",
  };
}

export function watchBridgeLog(
  db: Firestore,
  onChange: (log: ScheduleEvent[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    query(collection(db, "bridgeLog"), orderBy("at", "desc")),
    (snap) => onChange(snap.docs.map((d) => toScheduleEvent(d.id, d.data()))),
    onError,
  );
}

export async function appendLogEntry(
  db: Firestore,
  entry: Omit<ScheduleEvent, "id" | "at">,
): Promise<void> {
  await addDoc(collection(db, "bridgeLog"), { ...entry, at: serverTimestamp() });
}

// ---------------------------------------------------------------------------
// The rendered letter — resolving included pieces to real content/links for
// the composer's live preview, "Send test", and functions/src/index.ts's
// sendScheduledBridgeIssues (a server-side duplicate, since functions/ is a
// standalone npm project outside the pnpm workspace — see its package.json).

export const PUBLIC_SITE_URL = "https://storybridge.news";

/** One included piece, already resolved to a real title/excerpt/url/image for the issue's audience locale. picks[0] is the feature; the rest run under "Also from the desk". */
export type BridgeArticlePick = {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  imageAlt?: string;
};

/** Issue.audienceId → the locale a pick should be resolved in. "all" reads as English — same rule functions/src/index.ts's audienceLocale() applies server-side. */
export function audienceLocale(audienceId: AudienceId): LangCode {
  return audienceId === "fr" || audienceId === "ar" ? (audienceId.toUpperCase() as LangCode) : "EN";
}

/**
 * Resolves an issue's included pieces to real titles/excerpts/URLs/images,
 * in composer order (index 0 is the feature). Falls back to an article's
 * primary language — and that language's own URL — when the audience's
 * locale hasn't been translated yet: the website's Journal has no
 * cross-locale fallback (apps/website/src/lib/articles.ts's contentFor()
 * returns null for an unstarted translation, so that route 404s), so a link
 * has to follow whichever locale the content is actually in. Mirrors
 * functions/src/locale-content.ts's resolveArticleContent() server-side.
 */
export function resolvePicks(articles: Article[], pickArticleIds: string[], audienceId: AudienceId): BridgeArticlePick[] {
  const locale = audienceLocale(audienceId);
  const byId = new Map(articles.map((a) => [a.id, a]));
  const picks: BridgeArticlePick[] = [];
  for (const id of pickArticleIds) {
    const article = byId.get(id);
    if (!article) continue;
    const primary = primaryLangOf(article.lang);
    const resolvedLocale = locale === primary || langStarted(article, locale) ? locale : primary;
    const content = langContentOf(article, resolvedLocale);
    if (!content.title.trim() || !content.slug.trim()) continue; // nothing real to link to
    picks.push({
      title: content.title,
      excerpt: content.excerpt,
      url: `${PUBLIC_SITE_URL}/${resolvedLocale.toLowerCase()}/journal/${content.slug}`,
      imageUrl: article.leadImage?.url,
      imageAlt: article.leadImage?.alt || content.title,
    });
  }
  return picks;
}
