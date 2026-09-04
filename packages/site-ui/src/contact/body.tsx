"use client";

import { useTranslations } from "next-intl";
import { Link } from "../navigation";
import { PageHero } from "../chrome/page-hero";
import { ContactForm } from "./contact-form";
import { Editable } from "../preview/context";

const label = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#8F6135",
} as const;

const card = {
  border: "1px solid #E6E0D8",
  borderRadius: "8px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  background: "#FDF8F1",
} as const;

/**
 * The Contact page's body — everything below the server-only `setRequestLocale`
 * in apps/website/src/app/[locale]/contact/page.tsx, which now just renders
 * this. Reused unmodified, client-side, by the CMS's live preview.
 */
export function ContactBody() {
  const t = useTranslations("Contact");

  return (
    <>
      <PageHero
        backdropId="wpgContact"
        variant="arcs"
        glyph="“"
        eyebrow={<Editable path="Contact.eyebrow">{t("eyebrow")}</Editable>}
        title={<Editable path="Contact.title">{t("title")}</Editable>}
        standfirst={<Editable path="Contact.standfirst" multiline>{t("standfirst")}</Editable>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]"
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "64px var(--sb-gutter) 96px",
          display: "grid",
          gap: "clamp(28px,5vw,72px)",
          alignItems: "start",
        }}
      >
        <ContactForm />

        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={card}>
            <div style={label}><Editable path="Contact.directLabel">{t("directLabel")}</Editable></div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", color: "#002D62" }}>
              contact@storybridge.news
            </div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#5A6472" }}>
              <Editable path="Contact.location" multiline>{t("location")}</Editable>
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "10.5px",
                color: "#B57D49",
                border: "1px dashed #DEC5A9",
                borderRadius: "2px",
                padding: "5px 8px",
                alignSelf: "flex-start",
              }}
            >
              <Editable path="Contact.detailsPending">{t("detailsPending")}</Editable>
            </div>
          </div>

          <div style={card}>
            <div style={label}><Editable path="Contact.contactTitle">{t("contactTitle")}</Editable></div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              <Editable path="Contact.contactBody" multiline>{t("contactBody")}</Editable>
            </div>
          </div>

          <div style={card}>
            <div style={label}><Editable path="Contact.languagesTitle">{t("languagesTitle")}</Editable></div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              <Editable path="Contact.languagesBody" multiline>{t("languagesBody")}</Editable>
            </div>
          </div>

          <div style={card}>
            <div style={label}><Editable path="Contact.notReadyTitle">{t("notReadyTitle")}</Editable></div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              <Editable path="Contact.notReadyBody" multiline>{t("notReadyBody")}</Editable>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
              <Link
                href="/journal"
                data-hover="background:#F8F1E8"
                style={{
                  color: "#8F6135",
                  border: "1.5px solid #B57D49",
                  borderRadius: "4px",
                  padding: "10px 18px",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all .16s ease",
                }}
              >
                <Editable path="Contact.journalLink">{t("journalLink")}</Editable>
              </Link>
              <Link
                href="/newsletter"
                data-hover="background:#F8F1E8"
                style={{
                  color: "#8F6135",
                  border: "1.5px solid #B57D49",
                  borderRadius: "4px",
                  padding: "10px 18px",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all .16s ease",
                }}
              >
                <Editable path="Contact.bridgeLink">{t("bridgeLink")}</Editable>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
