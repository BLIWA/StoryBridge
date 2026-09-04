"use client";

import { useTranslations } from "next-intl";
import { PageHero } from "../chrome/page-hero";
import { Editable, EditableImage } from "../preview/context";
import type { SiteImage } from "../who-we-are/types";

const label = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8F6135",
} as const;

const placeholderChip = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "10.5px",
  color: "#B57D49",
  border: "1px dashed #DEC5A9",
  borderRadius: "2px",
  padding: "5px 8px",
  alignSelf: "flex-start",
} as const;

/** Who, and how many paragraphs their bio runs to. The words are in messages/. */
const FOUNDERS = [
  { id: "assia", paraCount: 2 },
  { id: "imen", paraCount: 2 },
] as const;

/**
 * The Founders page's body — everything below the server-only
 * `setRequestLocale`/`getSiteImage` calls in
 * apps/website/src/app/[locale]/founders/page.tsx, which now just resolves
 * both portraits and renders this. `portraits` is a prop (not fetched in
 * here) so the CMS's live preview can hand it live, unsaved-edit-aware
 * values instead of whatever's actually published.
 */
export function FoundersBody({ portraits }: { portraits: Record<string, SiteImage | null> }) {
  const t = useTranslations("Founders");

  return (
    <>
      <PageHero
        backdropId="wpg1"
        variant="arcs"
        glyph="”"
        eyebrow={<Editable path="Founders.eyebrow">{t("eyebrow")}</Editable>}
        title={<Editable path="Founders.title">{t("title")}</Editable>}
        standfirst={<Editable path="Founders.standfirst" multiline>{t("standfirst")}</Editable>}
      />

      {FOUNDERS.map((f, i) => (
        <div key={f.id}>
          {i > 0 && (
            <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "72px var(--sb-gutter) 0" }}>
              <div style={{ height: "1px", background: "#D8D1C7" }} />
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr]"
            style={{
              maxWidth: "1320px",
              margin: "0 auto",
              padding: i === 0 ? "64px 40px 0" : "64px 40px 88px",
              display: "grid",
              gap: "clamp(28px,5vw,72px)",
              alignItems: "start",
            }}
          >
            <aside style={{ display: "flex", flexDirection: "column", gap: "14px", position: "sticky", top: "110px" }}>
              <EditableImage slotId={`founders.${f.id}.portrait`}>
                {portraits[f.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage URL; avoids a remotePatterns change for CMS-uploaded media
                  <img
                    src={portraits[f.id]!.url}
                    alt={portraits[f.id]!.alt}
                    style={{ aspectRatio: "4/5", objectFit: "cover", borderRadius: "8px", border: "1px solid #D8D1C7", width: "100%", display: "block" }}
                  />
                ) : (
                  <div
                    style={{
                      aspectRatio: "4/5",
                      borderRadius: "8px",
                      border: "1px solid #D8D1C7",
                      backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 11px,#EFE1D2 11px 22px)",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        background: "#FDF8F1",
                        border: "1px solid #D8D1C7",
                        borderRadius: "2px",
                        padding: "6px 10px",
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontSize: "10.5px",
                        color: "#5A6472",
                      }}
                    >
                      {t(`people.${f.id}.portrait`)}
                    </div>
                  </div>
                )}
              </EditableImage>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderTop: "1px solid #D8D1C7",
                  paddingTop: "14px",
                }}
              >
                <div style={label}><Editable path="Founders.languagesLabel">{t("languagesLabel")}</Editable></div>
                <div style={{ fontSize: "14.5px", color: "#3E4650" }}>
                  <Editable path={`Founders.people.${f.id}.languages`}>{t(`people.${f.id}.languages`)}</Editable>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderTop: "1px solid #D8D1C7",
                  paddingTop: "14px",
                }}
              >
                <div style={label}><Editable path="Founders.contactLabel">{t("contactLabel")}</Editable></div>
                <div style={{ fontSize: "14.5px", color: "#3E4650" }}>
                  <Editable path={`Founders.people.${f.id}.email`}>{t(`people.${f.id}.email`)}</Editable>
                </div>
                <div style={{ ...placeholderChip, marginTop: "4px" }}>
                  <Editable path="Founders.placeholder">{t("placeholder")}</Editable>
                </div>
              </div>
            </aside>

            <div style={{ maxWidth: "680px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div
                style={{
                  borderBottom: "2px solid #002D62",
                  paddingBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontWeight: 600,
                    fontSize: "clamp(26px,5.0vw,52px)",
                    lineHeight: 1,
                    color: "#002D62",
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  <Editable path={`Founders.people.${f.id}.name`}>{t(`people.${f.id}.name`)}</Editable>
                </h2>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontStyle: "italic",
                    fontSize: "22px",
                    color: "#8F6135",
                  }}
                >
                  <Editable path={`Founders.people.${f.id}.role`}>{t(`people.${f.id}.role`)}</Editable>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "21px",
                  lineHeight: "1.65",
                  color: "#002D62",
                  fontWeight: 600,
                  textWrap: "pretty",
                }}
              >
                <Editable path={`Founders.people.${f.id}.lede`} multiline>{t(`people.${f.id}.lede`)}</Editable>
              </div>
              {Array.from({ length: f.paraCount }, (_, k) => (
                <div
                  key={k}
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "19px",
                    lineHeight: "1.78",
                    color: "#111111",
                    textWrap: "pretty",
                  }}
                >
                  <Editable path={`Founders.people.${f.id}.paras.${k}`} multiline>{t(`people.${f.id}.paras.${k}`)}</Editable>
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-2"
                style={{
                  display: "grid",
                  gap: "24px",
                  borderTop: "1px solid #D8D1C7",
                  paddingTop: "24px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={label}><Editable path="Founders.deskLabel">{t("deskLabel")}</Editable></div>
                  <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#3E4650" }}>
                    <Editable path={`Founders.people.${f.id}.desk`} multiline>{t(`people.${f.id}.desk`)}</Editable>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={label}><Editable path="Founders.creditsLabel">{t("creditsLabel")}</Editable></div>
                  <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#3E4650" }}>
                    <Editable path={`Founders.people.${f.id}.credits`} multiline>{t(`people.${f.id}.credits`)}</Editable>
                  </div>
                  <div style={placeholderChip}>
                    <Editable path="Founders.creditsPending">{t("creditsPending")}</Editable>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
