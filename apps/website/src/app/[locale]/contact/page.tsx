import { setRequestLocale } from "next-intl/server";
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

  return (
    <>
      <PageHero
        backdropId="wpgContact"
        variant="arcs"
        glyph="“"
        eyebrow="Contact"
        title="Tell us what the story is."
        standfirst="A rough idea is enough to start. We reply within two working days with questions, scope and a fixed quote — and one project manager who stays with you from there."
      />

      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "64px 40px 96px",
          display: "grid",
          gridTemplateColumns: "1.25fr 0.75fr",
          gap: "72px",
          alignItems: "start",
        }}
      >
        <ContactForm />

        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={card}>
            <div style={label}>Direct</div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", color: "#002D62" }}>
              hello@storybridge.tn
            </div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#5A6472" }}>
              Tunis, Tunisia · working with clients locally and internationally.
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
              placeholder — add real address, phone, LinkedIn
            </div>
          </div>

          <div style={card}>
            <div style={label}>One point of contact</div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              Whoever answers this form stays on your assignment. A single project manager owns the brief from
              the first call to the final file — no relay, no repeating yourself.
            </div>
          </div>

          <div style={card}>
            <div style={label}>Working languages</div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              Write to us in Arabic, French or English. We answer in the language you used.
            </div>
          </div>

          <div style={card}>
            <div style={label}>Not ready for a brief?</div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
              Read the Journal, or take the monthly letter. Both are a fair sample of how we write.
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
                The Journal
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
                The Bridge
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
