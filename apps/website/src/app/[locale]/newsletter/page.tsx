import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeroBackdrop } from "@/components/fx/backdrops";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { NEWSLETTER_ISSUES } from "@/content/journal";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const mono = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11.5px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#8F6135",
} as const;

export default async function NewsletterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#FDF8F1",
          borderBottom: "1px solid #E6E0D8",
        }}
      >
        <PageHeroBackdrop id="wpgNews" variant="quotes" glyph="”" />
        <div
          style={{
            position: "relative",
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "66px 40px 80px",
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "64px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              data-a
              style={{
                height: "6px",
                width: "180px",
                background: "#B57D49",
                transformOrigin: "left",
                animation: "sb-wipe .8s cubic-bezier(.2,.7,.2,1) .1s both",
              }}
            />
            <div style={mono}>The Bridge · monthly newsletter</div>
            <h1
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 600,
                fontSize: "60px",
                lineHeight: "1.05",
                letterSpacing: "-0.022em",
                color: "#002D62",
                margin: 0,
                textWrap: "balance",
              }}
            >
              One letter a month, worth the open.
            </h1>
            <div style={{ fontSize: "18px", lineHeight: "1.7", color: "#3E4650", maxWidth: "560px" }}>
              Language, media and the Maghreb — what we are reading, what we are arguing about on the desk, and
              one piece of craft you can use. Written by us, in the voice we write for clients.
            </div>
            <div
              style={{
                background: "#002D62",
                borderRadius: "8px",
                padding: "28px",
                marginTop: "8px",
                maxWidth: "560px",
              }}
            >
              <NewsletterSignup />
            </div>
          </div>

          {/* Issue preview card */}
          <div
            style={{
              border: "1px solid #E6E0D8",
              borderRadius: "8px",
              background: "#FFFFFF",
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxShadow: "0 1px 2px rgba(0,24,56,0.06),0 12px 36px rgba(0,24,56,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                borderBottom: "2px solid #002D62",
                paddingBottom: "12px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "26px",
                  fontWeight: 600,
                  color: "#002D62",
                }}
              >
                The Bridge
              </div>
              <div style={{ ...mono, fontSize: "11px", letterSpacing: "0.16em" }}>ISSUE 07</div>
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "28px",
                fontWeight: 600,
                lineHeight: "1.25",
                color: "#002D62",
              }}
            >
              The word that cost a campaign its audience
            </div>
            <div style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#3E4650" }}>
              Three paragraphs on one translation decision, why it went wrong, and the twenty-second check
              that would have caught it.
            </div>
            <div style={{ height: "1px", background: "#E6E0D8" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ ...mono, fontSize: "11px", letterSpacing: "0.16em" }}>Also in this issue</div>
              {[
                "— Reading list: four pieces on Maghrebi media",
                "— From the desk: how we scope a trilingual brief",
                "— One question from a reader, answered",
              ].map((l) => (
                <div key={l} style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Past issues */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "80px 40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "24px",
            borderBottom: "2px solid #002D62",
            paddingBottom: "14px",
            marginBottom: "36px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "38px",
              lineHeight: 1,
              color: "#002D62",
              letterSpacing: "-0.015em",
            }}
          >
            Past issues
          </div>
          <div style={{ fontSize: "15px", color: "#5A6472", lineHeight: 1.6 }}>
            Read a few before you subscribe. That is rather the point.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "0 40px" }}>
          {NEWSLETTER_ISSUES.map((iss) => (
            <div
              key={iss.issue}
              data-hover="background:#FDF8F1"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "22px 0",
                borderTop: "1px solid #D8D1C7",
                transition: "background .16s ease",
              }}
            >
              <div style={{ ...mono, fontSize: "11px", letterSpacing: "0.14em" }}>{iss.issue}</div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  lineHeight: "1.25",
                  color: "#002D62",
                }}
              >
                {iss.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletters as a service */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 40px 96px" }}>
        <div
          style={{
            background: "#E8E3DD",
            border: "1px solid #D8D1C7",
            borderRadius: "8px",
            padding: "48px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={mono}>Newsletters as a service</div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "36px",
                fontWeight: 600,
                lineHeight: "1.15",
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              We can run yours too.
            </div>
            <div style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650" }}>
              The Bridge is the demonstration. Newsletter writing and management is part of our Content &amp;
              Editorial line — for companies who want a letter their subscribers actually read.
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
              Talk to us about it
            </Link>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              borderInlineStart: "2px solid #B57D49",
              paddingInlineStart: "32px",
            }}
          >
            {[
              "Strategy, cadence and a format that suits your list",
              "Written and edited to the same desk process as everything else",
              "Arabic, French or English — or all three",
              "Managed end to end, or drafted for your team to send",
            ].map((l) => (
              <div key={l} style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#3E4650" }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
