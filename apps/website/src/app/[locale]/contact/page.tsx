import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/chrome/page-hero";
import { ContactForm } from "@/components/contact-form";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <>
      <PageHero
        backdropId="wpgContact"
        variant="arcs"
        glyph="“"
        eyebrow={t("eyebrow")}
        title={t("title")}
        standfirst={t("standfirst")}
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
            <div style={label}>{t("directLabel")}</div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", color: "#002D62" }}>
              hello@storybridge.tn
            </div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#5A6472" }}>
              {t("location")}
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
              {t("detailsPending")}
            </div>
          </div>

          <div style={card}>
            <div style={label}>{t("contactTitle")}</div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              {t("contactBody")}
            </div>
          </div>

          <div style={card}>
            <div style={label}>{t("languagesTitle")}</div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              {t("languagesBody")}
            </div>
          </div>

          <div style={card}>
            <div style={label}>{t("notReadyTitle")}</div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              {t("notReadyBody")}
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
                {t("journalLink")}
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
                {t("bridgeLink")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
