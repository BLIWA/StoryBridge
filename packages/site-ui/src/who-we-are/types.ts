/** Matches apps/website's and apps/cms's own SiteImage shapes (see either app's lib/site-images.ts) — kept local rather than imported from either, since a shared package can't reach into an app's src/. */
export type SiteImage = { url: string; alt: string };
