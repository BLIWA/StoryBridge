"use client";

import { useTranslations } from "next-intl";
import { PageHero } from "../chrome/page-hero";
import { Editable } from "../preview/context";

/**
 * Shared body for Privacy, Terms and Cookies — same hero as every other
 * inner page, then a plain-text document. `namespace` is one of
 * "PrivacyPage" | "TermsPage" | "CookiePage", each shaped like:
 *   { eyebrow, title, standfirst, updated, sections: [{ heading, body: string[] }] }
 * `t.raw("sections")` hands back that array as parsed JSON — its paragraphs
 * aren't individually Editable-wrapped (a raw JSON array, not per-key t()
 * calls), same known limitation as other rich/structural content in this
 * package — still fully editable through the same Firestore field.
 */
type Section = { heading: string; body: string[] };

export function LegalPageBody({ namespace, backdropId }: { namespace: string; backdropId: string }) {
  const t = useTranslations(namespace);
  const sections = t.raw("sections") as Section[];

  return (
    <>
      <PageHero
        backdropId={backdropId}
        variant="arcs"
        glyph="§"
        eyebrow={<Editable path={`${namespace}.eyebrow`}>{t("eyebrow")}</Editable>}
        title={<Editable path={`${namespace}.title`}>{t("title")}</Editable>}
        standfirst={<Editable path={`${namespace}.standfirst`} multiline>{t("standfirst")}</Editable>}
      />

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "48px var(--sb-gutter) 96px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "#8F6135",
            border: "1px dashed #DEC5A9",
            borderRadius: "2px",
            padding: "7px 11px",
            marginBottom: "40px",
          }}
        >
          <Editable path={`${namespace}.updated`}>{t("updated")}</Editable>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          {sections.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h2
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontWeight: 600,
                  fontSize: "22px",
                  color: "#002D62",
                  margin: 0,
                }}
              >
                {s.heading}
              </h2>
              {s.body.map((p, j) => (
                <p key={j} style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650", margin: 0 }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
