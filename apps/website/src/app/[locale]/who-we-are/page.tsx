import { setRequestLocale } from "next-intl/server";
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

  return (
    <>
      <PageHero
        backdropId="wpg0"
        variant="quotes"
        glyph="“"
        eyebrow="Who we are"
        title="Born from a friendship, a shared newsroom, and years of turning ideas into stories."
        titleMaxWidth="1000px"
      />

      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "56px 40px 88px",
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "72px",
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
            We are Assia Touati and Imen Bliwa, two best friends who first met through work. What began as a
            professional relationship quickly became a friendship built around a shared passion for
            journalism, communication, language, and good storytelling.
          </div>
          <div style={body}>
            Imen is a journalist, translator and researcher working across Arabic, English and French, with
            more than a decade of experience in journalism, translation and international media. Her work has
            taken her across different subjects, audiences and formats, from journalistic reporting and
            research to translation and content development.
          </div>
          <div style={body}>
            Assia is an open-minded editor-in-chief with a strong editorial instinct and a talent for turning
            ideas into clear, engaging and meaningful content. Her experience in editorial work brings another
            essential perspective: understanding the audience, shaping the message and making content work as
            part of a larger product.
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
              We first worked together at a magazine where we experienced something particularly valuable:
              building a successful media product from the inside.
            </div>
          </div>
          <div style={body}>
            We learned how an idea becomes a story, how stories become a product, and how strong editorial
            work, communication and teamwork can create something people actually connect with.
          </div>
          <div style={body}>Then our professional paths took us in different directions.</div>
          <div style={body}>But our friendship didn&apos;t.</div>
          <div style={body}>
            We kept meeting at one of our favorite coffee places, at our offices, or simply whenever we had
            time to sit down and talk. We talked about our work, the media industry, businesses,
            communication, languages and all the things we thought could be done differently. And eventually,
            one idea kept coming back:
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "34px",
              lineHeight: "1.3",
              color: "#002D62",
              letterSpacing: "-0.015em",
            }}
          >
            Why not build something together?
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
              photo — the coffee place
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
            Where StoryBridge was argued into existence, one afternoon at a time.
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
              Founded
            </div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "20px", color: "#002D62" }}>
              Tunis, Tunisia
            </div>
            <div style={{ fontSize: "14px", lineHeight: "1.65", color: "#5A6472" }}>
              Working across Arabic, English and French, locally and internationally.
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
        <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "80px 40px" }}>
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
                fontSize: "40px",
                lineHeight: 1,
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              What we do
            </div>
            <div style={{ fontSize: "15px", color: "#5A6472", maxWidth: "520px", lineHeight: 1.6 }}>
              A strategic communications and multilingual content company, built around four core areas.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "32px" }}>
            {PILLARS.map((p) => (
              <div
                key={p.title}
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
                    {"longTitle" in p ? p.longTitle : p.title}
                  </div>
                  <div style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#3E4650" }}>{p.long}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why StoryBridge */}
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "88px 40px",
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          gap: "72px",
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
            Why StoryBridge Content &amp; Media?
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "42px",
              lineHeight: "1.12",
              color: "#002D62",
              letterSpacing: "-0.018em",
            }}
          >
            Because language is more than translation.
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
            Start a conversation
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
            A good translation does not simply move words from one language to another. A good article does
            not simply fill a page. And good communication is not simply about saying more.
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
            It is about making the right message reach the right people in the right way. That is the bridge
            we want to build.
          </div>
        </div>
      </div>
    </>
  );
}
