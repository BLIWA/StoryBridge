export type View =
  | "dash"
  | "articles"
  | "article"
  | "pages"
  | "issues"
  | "inbox"
  | "settings";

/** Topbar crumb + title per view, from the board's `crumbs` / `titles` maps. */
export const VIEW_META: Record<Exclude<View, "article">, { crumb: string; title: string }> = {
  dash: { crumb: "Content desk · overview", title: "Overview" },
  articles: { crumb: "Content desk · Journal", title: "The Journal" },
  pages: { crumb: "Content desk · site structure", title: "Pages & sections" },
  issues: { crumb: "Content desk · newsletter", title: "The Bridge" },
  inbox: { crumb: "Content desk · enquiries", title: "Contact" },
  settings: { crumb: "Content desk · administration", title: "Settings & access" },
};
