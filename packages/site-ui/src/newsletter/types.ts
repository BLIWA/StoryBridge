/**
 * Matches apps/website's and apps/cms's own resolved-issue shapes (see
 * either app's lib/bridge-issues.ts) — kept local rather than imported from
 * either, since a shared package can't reach into an app's src/. Same
 * pattern as ../who-we-are/types.ts's SiteImage.
 */
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

/** The subject line's part after "Issue NN: ", which is what actually varies issue to issue — falls back to the whole subject if it isn't in that shape. Moved from apps/website/src/lib/bridge-issues.ts, the one call site. */
export function issueHeadline(subject: string): string {
  const i = subject.indexOf(": ");
  return i === -1 ? subject : subject.slice(i + 2);
}
