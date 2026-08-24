import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/chrome/page-hero";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

export default async function FoundersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Founders");

  return (
    <>
      <PageHero
        backdropId="wpg1"
        variant="arcs"
        glyph="”"
        eyebrow={t("eyebrow")}
        title={t("title")}
        standfirst={t("standfirst")}
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderTop: "1px solid #D8D1C7",
                  paddingTop: "14px",
                }}
              >
                <div style={label}>{t("languagesLabel")}</div>
                <div style={{ fontSize: "14.5px", color: "#3E4650" }}>{t(`people.${f.id}.languages`)}</div>
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
                <div style={label}>{t("contactLabel")}</div>
                <div style={{ fontSize: "14.5px", color: "#3E4650" }}>{t(`people.${f.id}.email`)}</div>
                <div style={{ ...placeholderChip, marginTop: "4px" }}>{t("placeholder")}</div>
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
                  {t(`people.${f.id}.name`)}
                </h2>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontStyle: "italic",
                    fontSize: "22px",
                    color: "#8F6135",
                  }}
                >
                  {t(`people.${f.id}.role`)}
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
                {t(`people.${f.id}.lede`)}
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
                  {t(`people.${f.id}.paras.${k}`)}
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
                  <div style={label}>{t("deskLabel")}</div>
                  <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#3E4650" }}>{t(`people.${f.id}.desk`)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={label}>{t("creditsLabel")}</div>
                  <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#3E4650" }}>{t(`people.${f.id}.credits`)}</div>
                  <div style={placeholderChip}>{t("creditsPending")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
