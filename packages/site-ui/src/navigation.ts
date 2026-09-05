export { routing, isRtl, rtlLocales, type AppLocale, redirect, usePathname, useRouter, getPathname } from "./navigation-core";
export { Link } from "./nav-link";

/**
 * Canonical home for the site's locale routing + locale-aware `Link`.
 *
 * Moved out of apps/website/src/i18n/{routing,navigation}.ts so that the
 * page bodies in ./home, ./who-we-are, ./contact and the shared chrome in
 * ./chrome — all reused unmodified by apps/cms's live preview — resolve
 * `Link` the same way in both apps rather than needing a CMS-side shim.
 * apps/website's own i18n/routing.ts and i18n/navigation.ts now just
 * re-export from here, so nothing else in that app had to change its
 * import path.
 *
 * The routing/redirect/usePathname/useRouter/getPathname primitives live in
 * ./navigation-core.ts; `Link` is wrapped in ./nav-link.tsx to disable
 * prefetch inside the CMS's live preview (see that file's doc comment) —
 * split into three files so the wrapper and this barrel don't import each
 * other.
 */
