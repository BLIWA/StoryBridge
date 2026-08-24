import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/chrome/page-hero";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * The board offers two modes for this page via its `caseStudyMode` prop:
 * "placeholders" (three fully-laid-out dummy case studies) and "coming-soon"
 * (a single honest holding card). Shipping "coming-soon", per the decision to
 * publish work only once a client agrees to be named — dummy client work on a
 * live site reads as real to a visitor.
 */
const MODE: "coming-soon" | "placeholders" = "coming-soon";

const mono = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#8F6135",
} as const;

const TESTIMONIAL_COUNT = 3;

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Work");

  return (
    <>
      <PageHero
        backdropId="wpgWork"
        variant="quotes"
        glyph="”"
        eyebrow={t("eyebrow")}
        title={t("title")}
        standfirst={t("standfirst")}
      />

      {MODE === "coming-soon" ? (
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "72px 40px 88px" }}>
          <div
            style={{
              border: "1px solid #D8D1C7",
              borderRadius: "8px",
              background: "#FDF8F1",
              padding: "64px 56px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              alignItems: "flex-start",
              maxWidth: "760px",
              margin: "0 auto",
              textAlign: "start",
            }}
          >
            <div style={mono}>{t("badge")}</div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "38px",
                fontWeight: 600,
                lineHeight: "1.15",
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              {t("comingTitle")}
            </div>
            <div style={{ fontSize: "17px", lineHeight: "1.75", color: "#3E4650" }}>
              {t("comingBody")}
            </div>
            <Link
              href="/journal"
              data-hover="background:#F8F1E8"
              style={{
                color: "#8F6135",
                border: "1.5px solid #B57D49",
                borderRadius: "4px",
                padding: "13.5px 26px",
                fontWeight: 600,
                fontSize: "15px",
                marginTop: "8px",
                transition: "all .16s ease",
              }}
            >
              {t("readJournal")}
            </Link>
          </div>
        </div>
      ) : null}

      {/* What clients say — structure only, clearly marked */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 40px 96px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "20px",
            borderBottom: "2px solid #002D62",
            paddingBottom: "14px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "38px",
              lineHeight: 1,
              color: "#002D62",
              letterSpacing: "-0.015em",
            }}
          >
            {t("testimonialsTitle")}
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "10.5px",
              letterSpacing: "0.14em",
              color: "#B57D49",
              border: "1px dashed #DEC5A9",
              borderRadius: "2px",
              padding: "5px 9px",
              marginInlineStart: "auto",
            }}
          >
            {t("placeholder")}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "28px" }}>
          {Array.from({ length: TESTIMONIAL_COUNT }, (_, k) => (
            <div
              key={k}
              style={{
                background: "#FDF8F1",
                borderRadius: "8px",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                boxShadow: "0 1px 2px rgba(0,24,56,0.06),0 2px 8px rgba(0,24,56,0.05)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "20px",
                  lineHeight: "1.55",
                  color: "#002D62",
                  textWrap: "pretty",
                }}
              >
                {t(`testimonials.${k}`)}
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "auto" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "999px",
                    backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 6px,#EFE1D2 6px 12px)",
                    border: "1px solid #D8D1C7",
                    flex: "none",
                  }}
                />
                <div>
                  <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#002D62" }}>{t("nameLabel")}</div>
                  <div style={{ fontSize: "13.5px", color: "#5A6472" }}>{t("roleLabel")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
