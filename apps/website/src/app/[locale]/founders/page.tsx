import { setRequestLocale } from "next-intl/server";
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

const FOUNDERS = [
  {
    name: "Assia Touati",
    role: "Co-founder · Editor-in-chief",
    portrait: "portrait — Assia Touati",
    languages: "Arabic · French · English",
    email: "assia@storybridge.tn · LinkedIn",
    lede: "An open-minded editor-in-chief with a strong editorial instinct and a talent for turning ideas into clear, engaging and meaningful content.",
    paras: [
      "Assia's experience in editorial work brings the perspective a piece of content usually lacks: understanding the audience, shaping the message, and making the work function as part of a larger product rather than as an isolated deliverable. She decides what a story is before anyone starts writing it, and she is the last reader before it goes out.",
      "She and Imen met at a magazine, where they built a media product from the inside — learning how an idea becomes a story, and how stories become something people actually connect with. That experience is the operating model StoryBridge runs on today.",
    ],
    desk: "Editorial direction · commissioning · structural editing · audience and message strategy · content as product",
    credits: "Magazine and outlet names, titles held, notable products launched.",
  },
  {
    name: "Imen Bliwa",
    role: "Co-founder · Journalist, translator, researcher",
    portrait: "portrait — Imen Bliwa",
    languages: "Arabic · English · French",
    email: "imen@storybridge.tn · LinkedIn",
    lede: "A journalist, translator and researcher working across Arabic, English and French, with more than a decade in journalism, translation and international media.",
    paras: [
      "Imen's work has moved across subjects, audiences and formats — reporting and research, translation, content development, and the field work that sits behind all of it. She knows what it takes to get access, find the right contacts and come back with the material a story actually needs.",
      "That range is why StoryBridge can take an assignment from a first conversation to a finished piece in three languages without handing it to strangers halfway through.",
    ],
    desk: "Reporting · interviews · AR/EN/FR translation · research · fixing and field production",
    credits: "Outlets published in, international media worked with, notable assignments.",
  },
] as const;

export default async function FoundersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        backdropId="wpg1"
        variant="arcs"
        glyph="”"
        eyebrow="The founders"
        title="Two bylines behind every brief."
        standfirst="StoryBridge is not a marketplace with a logo on top. The people who scope your work are the people who edit it."
      />

      {FOUNDERS.map((f, i) => (
        <div key={f.name}>
          {i > 0 && (
            <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "72px 40px 0" }}>
              <div style={{ height: "1px", background: "#D8D1C7" }} />
            </div>
          )}
          <div
            style={{
              maxWidth: "1320px",
              margin: "0 auto",
              padding: i === 0 ? "64px 40px 0" : "64px 40px 88px",
              display: "grid",
              gridTemplateColumns: "400px 1fr",
              gap: "72px",
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
                  {f.portrait}
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
                <div style={label}>Languages</div>
                <div style={{ fontSize: "14.5px", color: "#3E4650" }}>{f.languages}</div>
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
                <div style={label}>Contact</div>
                <div style={{ fontSize: "14.5px", color: "#3E4650" }}>{f.email}</div>
                <div style={{ ...placeholderChip, marginTop: "4px" }}>placeholder</div>
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
                    fontSize: "52px",
                    lineHeight: 1,
                    color: "#002D62",
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  {f.name}
                </h2>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontStyle: "italic",
                    fontSize: "22px",
                    color: "#8F6135",
                  }}
                >
                  {f.role}
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
                {f.lede}
              </div>
              {f.paras.map((p) => (
                <div
                  key={p.slice(0, 32)}
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "19px",
                    lineHeight: "1.78",
                    color: "#111111",
                    textWrap: "pretty",
                  }}
                >
                  {p}
                </div>
              ))}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  borderTop: "1px solid #D8D1C7",
                  paddingTop: "24px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={label}>On the desk</div>
                  <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#3E4650" }}>{f.desk}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={label}>Selected credits</div>
                  <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#3E4650" }}>{f.credits}</div>
                  <div style={placeholderChip}>placeholder — real credits to come</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
