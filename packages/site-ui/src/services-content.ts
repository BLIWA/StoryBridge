/**
 * The shape of the Services and Packages pages. Words live in
 * messages/{en,fr,ar}.json under the `Services`, `Packages` and `Desks`
 * namespaces — see content/site.ts for why the split runs where it does.
 *
 * `itemCount` is what lets a page render a translated bullet list without the
 * list itself living here: the page asks for exactly that many keys, so a
 * translation that drops one fails the build rather than silently rendering a
 * short list.
 */

export const SERVICE_DESKS = [
  { id: "editorial", mark: "¶", markSize: "30px", itemCount: 6 },
  { id: "translation", mark: "« »", markSize: "27px", itemCount: 6 },
  { id: "editing", mark: "§", markSize: "30px", itemCount: 6 },
  { id: "media", mark: "†", markSize: "30px", itemCount: 6 },
] as const;

export const WORKFLOW_STAGES = [
  { id: "brief", n: "01" },
  { id: "writer", n: "02" },
  { id: "editor", n: "03" },
  { id: "qa", n: "04" },
] as const;

/**
 * `band` marks the packages carrying the board's optional indicative price
 * line, behind its `showPricingBands` prop. The brief calls pricing
 * transparency a differentiator, so it ships on — flip SHOW_PRICE_BANDS to hide.
 */
export const SHOW_PRICE_BANDS = true;

export const PACKAGES = [
  { id: "articlePack", desk: "editorial", itemCount: 4, band: true },
  { id: "websiteContent", desk: "editorial", itemCount: 4, band: false },
  { id: "pressRelease", desk: "media", itemCount: 4, band: true },
  { id: "localization", desk: "translation", itemCount: 4, band: true },
  { id: "editorialPolish", desk: "editing", itemCount: 4, band: true },
] as const;

export const LAUNCH_PACKAGE = { itemCount: 4 } as const;

export const QUOTE_STEPS = [
  { id: "send", n: "01" },
  { id: "questions", n: "02" },
  { id: "quote", n: "03" },
  { id: "manager", n: "04" },
] as const;
