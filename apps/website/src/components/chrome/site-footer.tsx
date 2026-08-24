import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Footer from "StoryBridge Website v2.dc.html" — dark navy, bronze weave behind. */

const COLUMNS = [
  {
    key: "company",
    links: [
      { href: "/who-we-are", key: "whoWeAre" },
      { href: "/founders", key: "founders" },
      { href: "/how-we-work", key: "howWeWork" },
      { href: "/work", key: "selectedWork" },
    ],
  },
  {
    key: "workWithUs",
    links: [
      { href: "/services", key: "services" },
      { href: "/packages", key: "packages" },
      { href: "/newsletter", key: "newsletter" },
      { href: "/journal", key: "journal" },
    ],
  },
] as const;

const labelStyle = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#B57D49",
} as const;

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <div style={{ background: "#001838", color: "#FDF8F1", position: "relative", overflow: "hidden" }}>
      <div
        data-parallax="-34"
        style={{
          position: "absolute",
          inset: "-20% 0",
          opacity: 0.3,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        <svg width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <pattern id="weaveFooter" width="96" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 0,48 A 24,24 0 0 1 48,48 A 24,24 0 0 1 96,48"
                style={{ fill: "none", stroke: "#B57D49", strokeWidth: "1.1px" }}
              />
              <path
                d="M -24,24 A 24,24 0 0 1 24,24 A 24,24 0 0 1 72,24 A 24,24 0 0 1 120,24"
                style={{ fill: "none", stroke: "#B57D49", strokeWidth: "1.1px", opacity: 0.6 }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#weaveFooter)" />
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1fr]"
        style={{
          position: "relative",
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "72px var(--sb-gutter) 36px",
          display: "grid",
          gap: "clamp(28px,5vw,48px)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <Image
              src="/assets/mark-fdf8f1.png"
              alt="StoryBridge"
              width={110}
              height={120}
              style={{ height: "40px", width: "auto", flex: "none" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontWeight: 600,
                  fontSize: "25px",
                  lineHeight: 1,
                  color: "#FDF8F1",
                  letterSpacing: "-0.015em",
                }}
              >
                StoryBridge
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "9.5px",
                  lineHeight: 1,
                  color: "#B57D49",
                  letterSpacing: "0.15em",
                }}
              >
                {t("wordmark")}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "14.5px",
              lineHeight: "1.7",
              color: "rgba(253,248,241,0.72)",
              maxWidth: "340px",
            }}
          >
            {t("blurb")}
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "11.5px",
              lineHeight: "1.9",
              color: "rgba(253,248,241,0.5)",
            }}
          >
            {t("languages")}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={labelStyle}>{t(`columns.${col.key}.title`)}</div>
            {col.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-hover="color:#FDF8F1"
                style={{ fontSize: "14.5px", color: "rgba(253,248,241,0.8)" }}
              >
                {t(`columns.${col.key}.${l.key}`)}
              </Link>
            ))}
          </div>
        ))}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={labelStyle}>{t("contact")}</div>
          <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "rgba(253,248,241,0.8)" }}>
            hello@storybridge.tn
          </div>
          <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "rgba(253,248,241,0.8)" }}>
            {t("city")}
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "10.5px",
              letterSpacing: "0.06em",
              color: "#B57D49",
              border: "1px dashed rgba(181,125,73,0.5)",
              borderRadius: "2px",
              padding: "6px 9px",
              alignSelf: "flex-start",
            }}
          >
            {t("detailsPending")}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "0 var(--sb-gutter)" }}>
        <div
          style={{
            borderTop: "1px solid rgba(253,248,241,0.14)",
            padding: "22px 0 40px",
            display: "flex",
            justifyContent: "space-between",
            gap: "24px",
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11.5px",
            color: "rgba(253,248,241,0.5)",
          }}
        >
          <div>{t("copyright", { year: 2026 })}</div>
          <div>{t("disciplines")}</div>
        </div>
      </div>
    </div>
  );
}
