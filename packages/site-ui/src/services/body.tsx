"use client";

import { useTranslations } from "next-intl";
import { Link } from "../navigation";
import { PageHero } from "../chrome/page-hero";
import { QuoteTile } from "../fx/backdrops";
import { SERVICE_DESKS, WORKFLOW_STAGES } from "../services-content";
import { Editable } from "../preview/context";

const mono = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11.5px",
  letterSpacing: "0.16em",
  color: "#8F6135",
} as const;

/** The Services page's body — see apps/website/src/app/[locale]/services/page.tsx, now a thin wrapper around this. */
export function ServicesBody() {
  const t = useTranslations("Services");
  const d = useTranslations("Desks");

  return (
    <>
      <PageHero
        backdropId="wpg3"
        variant="quotes"
        glyph="”"
        eyebrow={<Editable path="Services.eyebrow">{t("eyebrow")}</Editable>}
        title={<Editable path="Services.title">{t("title")}</Editable>}
        titleMaxWidth="960px"
        standfirst={<Editable path="Services.standfirst" multiline>{t("standfirst")}</Editable>}
      />

      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "60px var(--sb-gutter) 0", display: "flex", flexDirection: "column" }}>
        {SERVICE_DESKS.map((desk, i) => (
          <div className="grid grid-cols-1 lg:grid-cols-[88px_1fr_1.15fr]"
            key={desk.id}
            style={{
              display: "grid",
              gap: "clamp(28px,5vw,48px)",
              borderTop: "1px solid #D8D1C7",
              borderBottom: i === SERVICE_DESKS.length - 1 ? "1px solid #D8D1C7" : undefined,
              padding: "44px 0",
              alignItems: "start",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                border: "1.5px solid #002D62",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: desk.markSize,
                  lineHeight: 1,
                  color: "#002D62",
                }}
              >
                {desk.mark}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h2
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "clamp(24px,3.2vw,34px)",
                  fontWeight: 600,
                  color: "#002D62",
                  lineHeight: "1.1",
                  margin: 0,
                }}
              >
                <Editable path={`Desks.${desk.id}.title`}>{d(`${desk.id}.title`)}</Editable>
              </h2>
              <div style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650" }}>
                <Editable path={`Desks.${desk.id}.body`} multiline>{d(`${desk.id}.body`)}</Editable>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "12px 28px" }}>
              {Array.from({ length: desk.itemCount }, (_, k) => (
                <div
                  key={k}
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.7",
                    color: "#3E4650",
                    borderInlineStart: "2px solid #DEC5A9",
                    paddingInlineStart: "16px",
                  }}
                >
                  <Editable path={`Desks.${desk.id}.items.${k}`} multiline>{d(`${desk.id}.items.${k}`)}</Editable>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* The workflow, in the open */}
      <div
        style={{
          background: "#E8E3DD",
          borderBottom: "1px solid #D8D1C7",
          marginTop: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          data-parallax="24"
          style={{ position: "absolute", inset: "-22% 0", opacity: 0.45, pointerEvents: "none", willChange: "transform" }}
        >
          <QuoteTile id="qSvc" size={60} glyph={42} opacity={0.24} />
        </div>
        <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "80px var(--sb-gutter)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "24px",
              borderBottom: "2px solid #002D62",
              paddingBottom: "14px",
              marginBottom: "40px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 600,
                fontSize: "clamp(24px,3.6vw,38px)",
                lineHeight: 1,
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              <Editable path="Services.workflowTitle">{t("workflowTitle")}</Editable>
            </div>
            <div style={{ fontSize: "15px", color: "#5A6472", maxWidth: "560px", lineHeight: 1.6 }}>
              <Editable path="Services.workflowNote" multiline>{t("workflowNote")}</Editable>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4"
            style={{
              display: "grid",
              background: "#FDF8F1",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(0,24,56,0.06),0 2px 8px rgba(0,24,56,0.05)",
            }}
          >
            {WORKFLOW_STAGES.map((s, i) => (
              <div
                key={s.id}
                style={{
                  padding: "34px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  borderInlineStart: i === 0 ? undefined : "1px solid #E6E0D8",
                }}
              >
                <div style={mono}>{t("stageLabel", { n: s.n })}</div>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#002D62",
                  }}
                >
                  <Editable path={`Services.workflow.${s.id}.title`}>{t(`workflow.${s.id}.title`)}</Editable>
                </div>
                <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
                  <Editable path={`Services.workflow.${s.id}.body`} multiline>{t(`workflow.${s.id}.body`)}</Editable>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "32px", marginTop: "32px" }}>
            <div
              style={{
                background: "#002D62",
                borderRadius: "8px",
                padding: "34px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ ...mono, textTransform: "uppercase", color: "#B57D49" }}>
                <Editable path="Services.contactTitle">{t("contactTitle")}</Editable>
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "26px",
                  fontWeight: 600,
                  color: "#FDF8F1",
                  lineHeight: "1.25",
                }}
              >
                <Editable path="Services.contactLead" multiline>{t("contactLead")}</Editable>
              </div>
              <div style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(253,248,241,0.78)" }}>
                <Editable path="Services.contactBody" multiline>{t("contactBody")}</Editable>
              </div>
            </div>
            <div
              style={{
                border: "1px solid #D8D1C7",
                borderRadius: "8px",
                padding: "34px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "#FDF8F1",
              }}
            >
              <div style={{ ...mono, textTransform: "uppercase" }}>
                <Editable path="Services.languagesTitle">{t("languagesTitle")}</Editable>
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "26px",
                  fontWeight: 600,
                  color: "#002D62",
                  lineHeight: "1.25",
                }}
              >
                <Editable path="Services.languagesLead" multiline>{t("languagesLead")}</Editable>
              </div>
              <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#3E4650" }}>
                <Editable path="Services.languagesBody" multiline>{t("languagesBody")}</Editable>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "44px" }}>
            <Link
              href="/packages"
              data-hover="background:#001838"
              style={{
                background: "#002D62",
                color: "#FDF8F1",
                borderRadius: "4px",
                padding: "15px 30px",
                fontWeight: 600,
                fontSize: "15px",
                transition: "all .16s ease",
              }}
            >
              <Editable path="Services.packagesLink">{t("packagesLink")}</Editable>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
