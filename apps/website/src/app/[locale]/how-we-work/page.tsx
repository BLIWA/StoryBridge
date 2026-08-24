import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/chrome/page-hero";
import { ArcWeaveDark } from "@/components/fx/backdrops";
import { PROCESS_STEPS } from "@/content/site";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const asideQuote = {
  fontFamily: "'Source Serif 4',serif",
  fontStyle: "italic",
  fontSize: "22px",
  lineHeight: "1.55",
  color: "#002D62",
  borderInlineStart: "2px solid #DEC5A9",
  paddingInlineStart: "28px",
} as const;

export default async function HowWeWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HowWeWork");
  const step = await getTranslations("HowWeWork.steps");

  return (
    <>
      <PageHero
        backdropId="wpg2"
        variant="arcs"
        glyph="“"
        eyebrow={t("eyebrow")}
        title={t("title")}
        standfirstSerif
        standfirst={t("standfirst")}
      />

      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "64px var(--sb-gutter) 40px" }}>
        {PROCESS_STEPS.map((s, i) => (
          <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr_1fr]"
            key={s.id}
            style={{
              display: "grid",
              gap: "clamp(28px,5vw,48px)",
              borderTop: "1px solid #D8D1C7",
              borderBottom: i === PROCESS_STEPS.length - 1 ? "1px solid #D8D1C7" : undefined,
              padding: "40px 0",
              alignItems: "start",
            }}
          >
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "clamp(28px,5.3vw,56px)",
                lineHeight: "0.9",
                color: "#B57D49",
                fontWeight: 600,
              }}
            >
              {s.n}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h2
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "clamp(24px,3.0vw,32px)",
                  fontWeight: 600,
                  color: "#002D62",
                  lineHeight: "1.15",
                  margin: 0,
                }}
              >
                {step(`${s.id}.title`)}
              </h2>
              <div style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650" }}>{step(`${s.id}.body`)}</div>
              {s.body2 && (
                <div style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650" }}>
                  {step(`${s.id}.body2`)}
                </div>
              )}
            </div>

            {/* Right column varies by step: a pull quote, a list, a photo, or the language card */}
            {s.listCount ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  borderInlineStart: "2px solid #DEC5A9",
                  paddingInlineStart: "28px",
                }}
              >
                {Array.from({ length: s.listCount }, (_, k) => (
                  <div key={k} style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#3E4650" }}>
                    {step(`${s.id}.list.${k}`)}
                  </div>
                ))}
                <div style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#002D62", fontWeight: 500 }}>
                  {step(`${s.id}.listLast`)}
                </div>
              </div>
            ) : s.photo ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div
                  style={{
                    aspectRatio: "3/2",
                    borderRadius: "8px",
                    border: "1px solid #D8D1C7",
                    backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 11px,#EFE1D2 11px 22px)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "14px",
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
                    {step(`${s.id}.photo`)}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontStyle: "italic",
                    fontSize: "22px",
                    lineHeight: "1.5",
                    color: "#002D62",
                  }}
                >
                  {step(`${s.id}.aside`)}
                </div>
              </div>
            ) : s.languageCard ? (
              <div
                style={{
                  border: "1px solid #E6E0D8",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  dir="rtl"
                  style={{
                    fontFamily: "'Noto Naskh Arabic',serif",
                    fontSize: "24px",
                    lineHeight: "1.7",
                    color: "#002D62",
                  }}
                >
                  العربية
                </div>
                <div style={{ height: "1px", background: "#E6E0D8" }} />
                <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", color: "#002D62" }}>
                  Français
                </div>
                <div style={{ height: "1px", background: "#E6E0D8" }} />
                <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", color: "#002D62" }}>
                  English
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.65",
                    color: "#5A6472",
                    borderTop: "1px solid #E6E0D8",
                    paddingTop: "14px",
                  }}
                >
                  {t("languageCardNote")}
                </div>
              </div>
            ) : (
              <div style={asideQuote}>{step(`${s.id}.aside`)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Closing tagline band */}
      <div style={{ background: "#001838", position: "relative", overflow: "hidden" }}>
        <div
          data-parallax="-42"
          style={{ position: "absolute", inset: "-22% 0", opacity: 0.35, pointerEvents: "none", willChange: "transform" }}
        >
          <ArcWeaveDark id="weaveHow" />
        </div>
        <div
          style={{
            position: "relative",
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "88px var(--sb-gutter)",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "11.5px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#B57D49",
            }}
          >
            {t("closingEyebrow")}
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "clamp(24px,4.2vw,44px)",
              lineHeight: "1.35",
              color: "#FDF8F1",
              letterSpacing: "-0.015em",
              textWrap: "balance",
            }}
          >
            {t("tagline")}
          </div>
          <div
            style={{ fontFamily: "'Source Serif 4',serif", fontStyle: "italic", fontSize: "24px", color: "#B57D49" }}
          >
            {t("closingNote")}
          </div>
          <Link
            href="/contact"
            data-hover="background:#C99D74"
            style={{
              background: "#B57D49",
              color: "#001838",
              borderRadius: "4px",
              padding: "15px 30px",
              fontWeight: 600,
              fontSize: "15px",
              marginTop: "8px",
              transition: "all .16s ease",
            }}
          >
            {t("closingCta")}
          </Link>
        </div>
      </div>
    </>
  );
}
