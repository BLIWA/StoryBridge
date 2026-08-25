import Script from "next/script";

/**
 * Plausible — privacy-first, cookie-free analytics. No consent gate needed
 * on this alone (see CookiePage/CookieBanner for why), and no personal data
 * ever reaches this site's own code: the script talks straight to Plausible.
 *
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN has to match a site actually registered at
 * plausible.io — creating that account and adding the site is a
 * console-only step, not done yet (same shape as the Blaze upgrade and the
 * reCAPTCHA key pair). Until then this renders nothing rather than loading
 * a script that would just silently drop every event.
 */
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "";

export function Analytics() {
  if (!PLAUSIBLE_DOMAIN) return null;
  return (
    <Script
      strategy="afterInteractive"
      defer
      data-domain={PLAUSIBLE_DOMAIN}
      src="https://plausible.io/js/script.js"
    />
  );
}
