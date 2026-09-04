/**
 * Derives what the public site's Journal/Newsletter pages actually show —
 * Published articles and Sent Bridge issues, locale-resolved — from the
 * same Firestore reads Studio's own Articles/Issues views already use (see
 * lib/articles.ts's watchArticles, lib/bridge-issues.ts's watchIssues).
 * This is the CMS-side read-only counterpart to
 * apps/website/src/lib/{articles,bridge-issues}.ts, which does the same
 * resolution for the real (public) reader at build time — a deliberate
 * duplicate, same call as those files make about lib/languages.ts, since a
 * shared package can't reach a server-only build-time read on one side and
 * a client-side live read on the other.
 *
 * Fed to site-content/live-preview.tsx for the Journal and Newsletter
 * chips' live preview.
 */

import type { Article, LangCode } from "@/content/seed";
import type { Issue } from "./bridge-issues";
import { primaryLangOf, langContentOf, langStarted } from "./languages";
import type { PublishedArticle } from "@storybridge/site-ui/journal/types";
import type { SentIssue, IssuePick } from "@storybridge/site-ui/newsletter/types";

const LOCALE_TO_LANG: Record<string, LangCode> = { en: "EN", fr: "FR", ar: "AR" };

/** `createdAt` rides along on every real article (see lib/articles.ts's createArticle()) but isn't on the `Article` type — same defensive read as apps/website/src/lib/articles.ts's own sort. */
function createdAtMillis(article: Article): number {
  const raw = (article as unknown as { createdAt?: { toMillis?: () => number } }).createdAt;
  return typeof raw?.toMillis === "function" ? raw.toMillis() : 0;
}

/** Every Published article with content in `locale`, newest first — mirrors apps/website/src/lib/articles.ts's listPublishedArticles(), reading from Studio's already-live `articles` state instead of a fresh Firestore query. */
export function publishedArticlesFor(articles: Article[], locale: string): PublishedArticle[] {
  const lang = LOCALE_TO_LANG[locale] ?? "EN";
  const published = articles.filter((a) => a.status === "Published");
  published.sort((a, b) => createdAtMillis(b) - createdAtMillis(a));
  return published.flatMap((a) => {
    const isPrimary = lang === primaryLangOf(a.lang);
    if (!isPrimary && !langStarted(a, lang)) return [];
    const content = isPrimary ? { title: a.title, slug: a.slug, excerpt: a.excerpt } : langContentOf(a, lang);
    return [
      {
        id: a.id,
        slug: content.slug || a.slug,
        title: content.title,
        excerpt: content.excerpt,
        cat: a.cat,
        author: a.author,
        coAuthors: a.coAuthors ?? [],
        date: a.date,
        leadImage: a.leadImage,
      },
    ];
  });
}

/** Every Sent issue, newest first, with its picks resolved to `locale` — mirrors apps/website/src/lib/bridge-issues.ts's listSentIssues(). */
export function sentIssuesFor(issues: Issue[], articles: Article[], locale: string): SentIssue[] {
  const byId = new Map(publishedArticlesFor(articles, locale).map((a) => [a.id, a]));
  const result: SentIssue[] = issues
    .filter((i) => i.status === "Sent")
    .map((iss) => ({
      id: iss.id,
      no: iss.no,
      subject: iss.subject,
      preheader: iss.preheader,
      sendAt: iss.sendAt,
      picks: iss.pickArticleIds.flatMap((pid): IssuePick[] => {
        const a = byId.get(pid);
        return a ? [{ title: a.title, excerpt: a.excerpt, slug: a.slug }] : [];
      }),
    }));
  result.sort((a, b) => Number(b.no) - Number(a.no));
  return result;
}
