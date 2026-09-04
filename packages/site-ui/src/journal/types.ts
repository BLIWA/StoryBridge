/**
 * Matches apps/website's and apps/cms's own resolved-article shapes (see
 * either app's lib/articles.ts) — kept local rather than imported from
 * either, since a shared package can't reach into an app's src/. Same
 * pattern as ../who-we-are/types.ts's SiteImage.
 */
export type PublishedArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cat: string;
  author: string;
  coAuthors: string[];
  date: string;
  leadImage?: { url: string; alt: string };
};
