"use client";

import { useTranslations } from "next-intl";
import { Link } from "../navigation";
import { PageHero } from "../chrome/page-hero";
import { ArcWeaveDark } from "../fx/backdrops";
import { PACKAGES, LAUNCH_PACKAGE, QUOTE_STEPS, SHOW_PRICE_BANDS } from "../services-content";
import { Editable } from "../preview/context";

const deskLabel = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#8F6135",
} as const;

const cardShadow = "0 1px 2px rgba(0,24,56,0.06),0 2px 8px rgba(0,24,56,0.05)";

/** The Packages page's body — see apps/website/src/app/[locale]/packages/page.tsx, now a thin wrapper around this. */
export function PackagesBody() {
  const t = useTranslations("Packages");
  const d = useTranslations("Desks");

  return (
    <>
      <PageHero
        backdropId="wpg4"
        variant="arcs"
        glyph="“"
        eyebrow={<Editable path="Packages.eyebrow">{t("eyebrow")}</Editable>}
        title={<Editable path="Packages.title">{t("title")}</Editable>}
        titleMaxWidth="960px"
        standfirst={<Editable path="Packages.standfirst" multiline>{t("standfirst")}</Editable>}
      />

      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "60px var(--sb-gutter) 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "28px" }}>
          {PACKAGES.map((p) => (
            <div
              key={p.id}
              data-hover="box-shadow:0 2px 4px rgba(0,24,56,0.06),0 8px 24px rgba(0,24,56,0.08)"
              style={{
                background: "#FDF8F1",
                borderRadius: "8px",
                padding: "32px",
                boxShadow: cardShadow,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                transition: "box-shadow .18s ease",
              }}
            >
              <div style={deskLabel}>{d(`${p.desk}.title`)}</div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#002D62",
                  lineHeight: "1.15",
                }}
              >
                <Editable path={`Packages.items.${p.id}.name`}>{t(`items.${p.id}.name`)}</Editable>
              </div>
              <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#3E4650" }}>
                <Editable path={`Packages.items.${p.id}.body`} multiline>{t(`items.${p.id}.body`)}</Editable>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "4px" }}>
                {Array.from({ length: p.itemCount }, (_, k) => (
                  <div
                    key={k}
                    style={{
                      fontSize: "14.5px",
                      lineHeight: "1.6",
                      color: "#3E4650",
                      borderInlineStart: "2px solid #DEC5A9",
                      paddingInlineStart: "14px",
                    }}
                  >
                    <Editable path={`Packages.items.${p.id}.items.${k}`} multiline>{t(`items.${p.id}.items.${k}`)}</Editable>
                  </div>
                ))}
              </div>
              {SHOW_PRICE_BANDS && p.band && (
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "12px",
                    color: "#8F6135",
                    background: "#F8F1E8",
                    borderRadius: "2px",
                    padding: "10px 12px",
                  }}
                >
                  <Editable path={`Packages.items.${p.id}.band`}>{t(`items.${p.id}.band`)}</Editable>
                </div>
              )}
              <Link
                href="/contact"
                data-hover="color:#002D62"
                style={{
                  fontSize: "14.5px",
                  fontWeight: 600,
                  color: "#8F6135",
                  marginTop: "auto",
                  paddingTop: "6px",
                }}
              >
                <Editable path="Packages.requestQuoteArrow">{t("requestQuoteArrow")}</Editable>
              </Link>
            </div>
          ))}

          {/* Launch Package — the bundled, navy, full-width-feeling card */}
          <div
            style={{
              background: "#002D62",
              borderRadius: "8px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              data-parallax="-20"
              style={{ position: "absolute", inset: "-30% 0", opacity: 0.3, pointerEvents: "none", willChange: "transform" }}
            >
              <ArcWeaveDark id="weaveLaunch" />
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "14px", height: "100%" }}>
              <div style={{ ...deskLabel, color: "#B57D49" }}>
                <Editable path="Packages.launch.eyebrow">{t("launch.eyebrow")}</Editable>
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#FDF8F1",
                  lineHeight: "1.15",
                }}
              >
                <Editable path="Packages.launch.name">{t("launch.name")}</Editable>
              </div>
              <div style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(253,248,241,0.78)" }}>
                <Editable path="Packages.launch.body" multiline>{t("launch.body")}</Editable>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "4px" }}>
                {Array.from({ length: LAUNCH_PACKAGE.itemCount }, (_, k) => (
                  <div
                    key={k}
                    style={{
                      fontSize: "14.5px",
                      lineHeight: "1.6",
                      color: "rgba(253,248,241,0.85)",
                      borderInlineStart: "2px solid #B57D49",
                      paddingInlineStart: "14px",
                    }}
                  >
                    <Editable path={`Packages.launch.items.${k}`} multiline>{t(`launch.items.${k}`)}</Editable>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                data-hover="background:#C99D74"
                style={{
                  background: "#B57D49",
                  color: "#001838",
                  borderRadius: "4px",
                  padding: "13px 24px",
                  fontWeight: 600,
                  fontSize: "15px",
                  alignSelf: "flex-start",
                  marginTop: "auto",
                  transition: "all .16s ease",
                }}
              >
                <Editable path="Packages.requestQuote">{t("requestQuote")}</Editable>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How quoting works */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "80px var(--sb-gutter) 96px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]"
          style={{
            display: "grid",
            gap: "clamp(28px,5vw,56px)",
            alignItems: "start",
            borderTop: "2px solid #002D62",
            paddingTop: "40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ ...deskLabel, fontSize: "11.5px", letterSpacing: "0.18em" }}>
              <Editable path="Packages.quoteTitle">{t("quoteTitle")}</Editable>
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "clamp(24px,3.6vw,38px)",
                fontWeight: 600,
                lineHeight: "1.15",
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              <Editable path="Packages.quoteLead" multiline>{t("quoteLead")}</Editable>
            </div>
            <div style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650" }}>
              <Editable path="Packages.quoteBody" multiline>{t("quoteBody")}</Editable>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {QUOTE_STEPS.map((s) => (
              <div key={s.id} style={{ display: "flex", gap: "20px", alignItems: "baseline" }}>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "13px",
                    color: "#B57D49",
                    flex: "none",
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: "16px", lineHeight: "1.7", color: "#3E4650" }}>
                  <Editable path={`Packages.quote.${s.id}`} multiline>{t(`quote.${s.id}`)}</Editable>
                </div>
              </div>
            ))}
            <Link
              href="/contact"
              data-hover="background:#001838"
              style={{
                background: "#002D62",
                color: "#FDF8F1",
                borderRadius: "4px",
                padding: "15px 30px",
                fontWeight: 600,
                fontSize: "15px",
                alignSelf: "flex-start",
                marginTop: "10px",
                transition: "all .16s ease",
              }}
            >
              <Editable path="Packages.quoteCta">{t("quoteCta")}</Editable>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
