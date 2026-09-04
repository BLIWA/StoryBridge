/**
 * Public read of Sent Bridge issues, for the newsletter page's latest-issue
 * card and archive. Build-time only — same static-export shape as
 * lib/articles.ts (this app still ships as a static export; see the root
 * README). firestore.rules makes a Sent issue public, same "Published is
 * public" shape as /articles; every other status (Draft, Scheduled,
 * Canceled) stays staff-only — see apps/cms/src/lib/bridge-issues.ts, the
 * CMS-side counterpart that writes what this reads.
 */

import { collection, getDocs, query, where, type Timestamp } from "firebase/firestore";
import { getDb } from "./firebase";
import { listPublishedArticles } from "./articles";

type RawIssue = {
  no: string;
  subject: string;
  preheader: string;
  sendAt: number | null;
  pickArticleIds: unknown;
  createdAt?: Timestamp;
};

/** One included piece, resolved to a real title/excerpt/slug for the requested locale — or dropped if that language was never started (see lib/articles.ts's contentFor()). */
export type IssuePick = { title: string; excerpt: string; slug: string };

export type SentIssue = {
  id: string;
  no: string;
  /** e.g. "The Bridge — Issue 07: What a brief actually asks for" */
  subject: string;
  preheader: string;
  sendAt: number | null;
  picks: IssuePick[];
};

async function fetchSent(): Promise<RawIssue[]> {
  // The `where` here is load-bearing, not an optimization — firestore.rules'
  // read clause for /bridgeIssues only accepts a list request Firestore can
  // prove is status-filtered; an unfiltered query would be denied outright.
  // Same shape as lib/articles.ts's fetchPublished().
  const snap = await getDocs(query(collection(getDb(), "bridgeIssues"), where("status", "==", "Sent")));
  return snap.docs.map((d) => d.data() as RawIssue);
}

/** Every Sent issue, newest first, with its picks resolved to `locale`. */
export async function listSentIssues(locale: string): Promise<SentIssue[]> {
  const [raw, articles] = await Promise.all([fetchSent(), listPublishedArticles(locale)]);
  const byId = new Map(articles.map((a) => [a.id, a]));

  const issues: SentIssue[] = raw.map((r) => ({
    id: String(r.createdAt?.toMillis() ?? r.no),
    no: typeof r.no === "string" ? r.no : "—",
    subject: typeof r.subject === "string" ? r.subject : "",
    preheader: typeof r.preheader === "string" ? r.preheader : "",
    sendAt: typeof r.sendAt === "number" ? r.sendAt : null,
    picks: (Array.isArray(r.pickArticleIds) ? r.pickArticleIds : []).flatMap((pid) => {
      const a = typeof pid === "string" ? byId.get(pid) : undefined;
      return a ? [{ title: a.title, excerpt: a.excerpt, slug: a.slug }] : [];
    }),
  }));

  issues.sort((a, b) => Number(b.no) - Number(a.no));
  return issues;
}

/** The subject line's part after "Issue NN: ", which is what actually varies issue to issue — falls back to the whole subject if it isn't in that shape. */
export function issueHeadline(subject: string): string {
  const i = subject.indexOf(": ");
  return i === -1 ? subject : subject.slice(i + 2);
}
