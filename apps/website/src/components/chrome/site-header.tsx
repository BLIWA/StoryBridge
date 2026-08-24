"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

/**
 * Sticky masthead from "StoryBridge Website v2.dc.html".
 * The board drives nav via component state; here each item is a real route,
 * and the active underline comes from the current pathname.
 */

const NAV = [
  { href: "/", key: "home" },
  { href: "/who-we-are", key: "whoWeAre" },
  { href: "/founders", key: "founders" },
  { href: "/how-we-work", key: "howWeWork" },
  { href: "/services", key: "services" },
  { href: "/packages", key: "packages" },
  { href: "/work", key: "work" },
  { href: "/journal", key: "journal" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteHeader({ locale }: { locale: AppLocale }) {
  // From @/i18n/navigation, not next/navigation: this one is locale-aware and
  // returns "/services" rather than "/en/services", which is what the hrefs
  // below are written against.
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const isAr = locale === "ar";

  // "Journal" stays lit on the post and newsletter routes, as on the board.
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/journal") {
      return pathname.startsWith("/journal") || pathname.startsWith("/newsletter");
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#FDF8F1",
        borderBottom: "1px solid #D8D1C7",
      }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "14px var(--sb-gutter)",
          minHeight: "84px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px 28px",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", flex: "none" }}>
          <Image
            src="/assets/storybridge-mark.png"
            alt="StoryBridge"
            width={110}
            height={120}
            priority
            style={{ height: "42px", width: "auto", flex: "none" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 600,
                fontSize: "25px",
                lineHeight: 1,
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              StoryBridge
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 400,
                fontSize: "9.5px",
                lineHeight: 1,
                color: "#B57D49",
                letterSpacing: "0.15em",
              }}
            >
              {t("wordmark")}
            </div>
          </div>
        </Link>

        <nav
          aria-label={t("primary")}
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: isAr ? "12px 24px" : "12px 19px",
            marginInlineStart: "auto",
            flex: "1 1 auto",
            justifyContent: "flex-end",
            minWidth: 0,
            ...(isAr ? { fontFamily: "'IBM Plex Sans Arabic',sans-serif" } : null),
          }}
        >
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-hover="color:#8F6135"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  fontSize: isAr ? "15px" : "14.5px",
                  fontWeight: 500,
                  color: active ? "#002D62" : "#5A6472",
                  whiteSpace: "nowrap",
                }}
              >
                {t(item.key)}
                {active && <div style={{ height: "2px", background: "#B57D49" }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: "none" }}>
          <div
            aria-label={t("language")}
            role="group"
            style={{
              display: "flex",
              border: "1px solid #D8D1C7",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {routing.locales.map((code, i) => (
              <Link
                key={code}
                // Stay on the page you are reading. The switcher used to send
                // every locale change back to the home page.
                href={pathname}
                locale={code}
                hrefLang={code}
                aria-current={locale === code ? "true" : undefined}
                data-hover="color:#002D62"
                style={{
                  padding: "7px 11px",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "11.5px",
                  letterSpacing: "0.06em",
                  color: locale === code ? "#002D62" : "#5A6472",
                  fontWeight: locale === code ? 600 : 400,
                  ...(i > 0 ? { borderInlineStart: "1px solid #D8D1C7" } : null),
                }}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link
            href="/contact"
            data-hover="background:#001838;box-shadow:0 2px 8px rgba(0,24,56,0.18)"
            style={{
              background: "#002D62",
              color: "#FDF8F1",
              borderRadius: "4px",
              padding: "13px 22px",
              fontWeight: 600,
              fontSize: "14.5px",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              transition: "all .16s ease",
            }}
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
