import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/chrome/page-hero";
import { QuoteTile } from "@/components/fx/backdrops";
import { PILLARS } from "@/content/site";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const body = {
  fontFamily: "'Source Serif 4',serif",
  fontSize: "19px",
  lineHeight: "1.78",
  color: "#111111",
  textWrap: "pretty",
} as const;

export default async function WhoWeArePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("WhoWeAre");
  const pillar = await getTranslations("Pillars");

  return (
    <>
      <PageHero
        backdropId="wpg0"
        variant="quotes"
        glyph="“"
        eyebrow={t("eyebrow")}
        title={t("title")}
        titleMaxWidth="1000px"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]"
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "56px var(--sb-gutter) 88px",
          display: "grid",
          gap: "clamp(28px,5vw,72px)",
          alignItems: "start",
        }}
      >
        <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "24px",
              lineHeight: "1.55",
              color: "#002D62",
              fontWeight: 600,
            }}
          >
            {t("intro")}
          </div>
          <div style={body}>
            {t("imen")}
          </div>
          <div style={body}>
            {t("assia")}
          </div>
          <div style={{ borderInlineStart: "2px solid #B57D49", paddingInlineStart: "32px", margin: "12px 0" }}>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontStyle: "italic",
                fontSize: "26px",
                lineHeight: "1.5",
                color: "#002D62",
                textWrap: "pretty",
              }}
            >
              {t("magazine")}
            </div>
          </div>
          <div style={body}>
            {t("learned")}
          </div>
          <div style={body}>Then our professional paths took us in different directions.</div>
          <div style={body}>But our friendship didn&apos;t.</div>
          <div style={body}>
            {t("meetings")}
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "clamp(24px,3.2vw,34px)",
              lineHeight: "1.3",
              color: "#002D62",
              letterSpacing: "-0.015em",
            }}
          >
            {t("theIdea")}
          </div>
          <div style={{ ...body, textWrap: undefined }}>That idea became StoryBridge Content &amp; Media.</div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "110px" }}>
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
              {t("photoCaption")}
            </div>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "11px",
              lineHeight: "1.65",
              color: "#8A8378",
            }}
          >
            {t("photoNote")}
          </div>
          <div
            style={{
              border: "1px solid #E6E0D8",
              borderRadius: "8px",
              padding: "22px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#FDF8F1",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "11px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#8F6135",
              }}
            >
              {t("foundedLabel")}
            </div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "20px", color: "#002D62" }}>
              {t("foundedCity")}
            </div>
            <div style={{ fontSize: "14px", lineHeight: "1.65", color: "#5A6472" }}>
              {t("foundedNote")}
            </div>
          </div>
        </aside>
      </div>

      {/* What we do — two-column pillar cards */}
      <div style={{ background: "#E8E3DD", borderBlock: "1px solid #D8D1C7", position: "relative", overflow: "hidden" }}>
        <div
          data-parallax="24"
          style={{ position: "absolute", inset: "-22% 0", opacity: 0.45, pointerEvents: "none", willChange: "transform" }}
        >
          <QuoteTile id="qWho" glyph={40} opacity={0.24} />
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
                fontSize: "clamp(24px,3.8vw,40px)",
                lineHeight: 1,
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              {t("whatWeDo")}
            </div>
            <div style={{ fontSize: "15px", color: "#5A6472", maxWidth: "520px", lineHeight: 1.6 }}>
              {t("whatWeDoNote")}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "32px" }}>
            {PILLARS.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#FDF8F1",
                  borderRadius: "8px",
                  padding: "34px",
                  display: "flex",
                  gap: "24px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    border: "1.5px solid #002D62",
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  <span
                    style={{ fontFamily: "'Source Serif 4',serif", fontSize: "27px", lineHeight: 1, color: "#002D62" }}
                  >
                    {p.mark}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div
                    style={{
                      fontFamily: "'Source Serif 4',serif",
                      fontSize: "25px",
                      fontWeight: 600,
                      color: "#002D62",
                    }}
                  >
                    {pillar.has(`${p.id}.longTitle`) ? pillar(`${p.id}.longTitle`) : pillar(`${p.id}.title`)}
                  </div>
                  <div style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#3E4650" }}>{pillar(`${p.id}.long`)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why StoryBridge */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]"
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "88px var(--sb-gutter)",
          display: "grid",
          gap: "clamp(28px,5vw,72px)",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "11.5px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8F6135",
            }}
          >
            {t("whyEyebrow")}
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "clamp(24px,4.0vw,42px)",
              lineHeight: "1.12",
              color: "#002D62",
              letterSpacing: "-0.018em",
            }}
          >
            {t("whyTitle")}
          </div>
          <Link
            href="/contact"
            data-hover="background:#001838"
            style={{
              background: "#002D62",
              color: "#FDF8F1",
              borderRadius: "4px",
              padding: "15px 28px",
              fontWeight: 600,
              fontSize: "15px",
              alignSelf: "flex-start",
              marginTop: "8px",
              transition: "all .16s ease",
            }}
          >
            {t("whyCta")}
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            borderInlineStart: "2px solid #B57D49",
            paddingInlineStart: "40px",
          }}
        >
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "22px",
              lineHeight: "1.65",
              color: "#111111",
              textWrap: "pretty",
            }}
          >
            {t("whyQuote")}
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "28px",
              lineHeight: "1.45",
              color: "#002D62",
              textWrap: "pretty",
            }}
          >
            {t("whyQuoteEmphasis")}
          </div>
        </div>
      </div>
    </>
  );
}
