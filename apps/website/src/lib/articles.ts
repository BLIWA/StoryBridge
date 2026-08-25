/**
 * Read-only access to published articles, for the Journal pages. Build-time
 * only — this app still ships as a static export (see the root README), so
 * every call here runs during `next build`, never in the visitor's browser.
 * Content only changes when someone rebuilds and redeploys after publishing
 * in the CMS; there's no live revalidation yet.
 *
 * firestore.rules makes a Published article public and everything else
 * staff-only — see apps/cms/src/lib/articles.ts, the CMS-side counterpart
 * that writes what this reads. The language-resolution logic below
 * (primaryLangOf/contentFor) is a deliberate read-only duplicate of
 * apps/cms/src/lib/languages.ts, same call as lib/body-format.ts.
 */

import { collection, getDocs, query, where, type Timestamp } from "firebase/firestore";
import { getDb } from "./firebase";

type LangCode = "EN" | "FR" | "AR";
const ALL_LANGS: readonly LangCode[] = ["EN", "FR", "AR"];
const LOCALE_TO_LANG: Record<string, LangCode> = { en: "EN", fr: "FR", ar: "AR" };

type LangContent = { title: string; slug: string; excerpt: string; body: string };

type RawArticle = {
  id: string;
  title: string;
  slug: string;
  lang: string;
  cat: string;
  author: string;
  status: string;
  date: string;
  excerpt: string;
  body: string;
  translations?: Partial<Record<LangCode, LangContent>>;
  coAuthors?: string[];
  leadImage?: { url: string; alt: string; credit: string };
  createdAt?: Timestamp;
};

function primaryLangOf(lang: string): LangCode {
  const first = lang.split("·")[0]?.trim().toUpperCase();
  return (ALL_LANGS as readonly string[]).includes(first ?? "") ? (first as LangCode) : "EN";
}

/** The requested locale's content, or null if that language was never started. */
function contentFor(article: RawArticle, code: LangCode): LangContent | null {
  if (code === primaryLangOf(article.lang)) {
    return { title: article.title, slug: article.slug, excerpt: article.excerpt, body: article.body };
  }
  const t = article.translations?.[code];
  return t && (t.title.trim() || t.body.trim()) ? t : null;
}

export type PublishedArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cat: string;
  author: string;
  coAuthors: string[];
  date: string;
  leadImage?: { url: string; alt: string; credit: string };
};

async function fetchPublished(): Promise<RawArticle[]> {
  // The `where` here is load-bearing, not an optimization — firestore.rules'
  // read clause for /articles only accepts a list request Firestore can
  // prove is status-filtered; an unfiltered query would be denied outright.
  const snap = await getDocs(query(collection(getDb(), "articles"), where("status", "==", "Published")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RawArticle, "id">) }));
}

/** Every published article with content in `locale`, newest first. */
export async function listPublishedArticles(locale: string): Promise<PublishedArticle[]> {
  const lang = LOCALE_TO_LANG[locale] ?? "EN";
  const raw = await fetchPublished();
  raw.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
  return raw.flatMap((a) => {
    const content = contentFor(a, lang);
    if (!content) return [];
    return [
      {
        id: a.id,
        slug: content.slug || a.slug,
        title: content.title,
        excerpt: content.excerpt,
        body: content.body,
        cat: a.cat,
        author: a.author,
        coAuthors: a.coAuthors ?? [],
        date: a.date,
        leadImage: a.leadImage,
      },
    ];
  });
}

export async function getPublishedArticle(locale: string, slug: string): Promise<PublishedArticle | null> {
  const list = await listPublishedArticles(locale);
  return list.find((a) => a.slug === slug) ?? null;
}
