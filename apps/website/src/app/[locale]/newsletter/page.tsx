import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeroBackdrop } from "@/components/fx/backdrops";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { listSentIssues, issueHeadline } from "@/lib/bridge-issues";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";

const LOCALE_TO_LANG: Record<string, string> = { en: "en-US", fr: "fr-FR", ar: "ar-TN" };

function issueMonth(sendAt: number | null, locale: string): string {
  if (!sendAt) return "";
  return new Intl.DateTimeFormat(LOCALE_TO_LANG[locale] ?? "en-US", { month: "long", year: "numeric" }).format(
    new Date(sendAt),
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("newsletter");

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
  const t = await getTranslations("Newsletter");
  const issues = await listSentIssues(locale);
  const [latestIssue, ...pastIssues] = issues;

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
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]"
          style={{
            position: "relative",
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "66px var(--sb-gutter) 80px",
            display: "grid",
            gap: "clamp(28px,5vw,64px)",
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
            <div style={mono}>{t("eyebrow")}</div>
            <h1
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 600,
                fontSize: "clamp(30px,5.7vw,60px)",
                lineHeight: "1.05",
                letterSpacing: "-0.022em",
                color: "#002D62",
                margin: 0,
                textWrap: "balance",
              }}
            >
              {t("title")}
            </h1>
            <div style={{ fontSize: "18px", lineHeight: "1.7", color: "#3E4650", maxWidth: "560px" }}>
              {t("standfirst")}
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
              <NewsletterSignup source="Newsletter page" />
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
              {latestIssue && (
                <div style={{ ...mono, fontSize: "11px", letterSpacing: "0.16em" }}>
                  {t("issueLabel", { no: latestIssue.no })} · {t("latestBadge")}
                </div>
              )}
            </div>
            {latestIssue ? (
              <>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "28px",
                    fontWeight: 600,
                    lineHeight: "1.25",
                    color: "#002D62",
                  }}
                >
                  {issueHeadline(latestIssue.subject)}
                </div>
                <div style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#3E4650" }}>
                  {latestIssue.preheader}
                </div>
                {latestIssue.picks.length > 0 && (
                  <>
                    <div style={{ height: "1px", background: "#E6E0D8" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ ...mono, fontSize: "11px", letterSpacing: "0.16em" }}>{t("alsoInIssue")}</div>
                      {latestIssue.picks.map((p) => (
                        <div key={p.slug} style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#3E4650" }}>
                          — {p.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "28px",
                    fontWeight: 600,
                    lineHeight: "1.25",
                    color: "#002D62",
                  }}
                >
                  {t("noIssuesYetTitle")}
                </div>
                <div style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#3E4650" }}>
                  {t("noIssuesYetBody")}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Past issues */}
      <div id="past-issues" style={{ maxWidth: "1320px", margin: "0 auto", padding: "80px var(--sb-gutter)", scrollMarginTop: "24px" }}>
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
              fontSize: "clamp(24px,3.6vw,38px)",
              lineHeight: 1,
              color: "#002D62",
              letterSpacing: "-0.015em",
            }}
          >
            {t("pastIssues")}
          </div>
          <div style={{ fontSize: "15px", color: "#5A6472", lineHeight: 1.6 }}>
            {t("pastIssuesNote")}
          </div>
        </div>
        {pastIssues.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "0 40px" }}>
            {pastIssues.map((iss) => (
              <div
                key={iss.id}
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
                <div style={{ ...mono, fontSize: "11px", letterSpacing: "0.14em" }}>
                  {t("issueLabel", { no: iss.no })}
                  {issueMonth(iss.sendAt, locale) ? ` · ${issueMonth(iss.sendAt, locale)}` : ""}
                </div>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    lineHeight: "1.25",
                    color: "#002D62",
                  }}
                >
                  {issueHeadline(iss.subject)}
                </div>
                {iss.preheader && (
                  <div style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#5A6472" }}>{iss.preheader}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#5A6472" }}>{t("noPastIssues")}</div>
        )}
      </div>

      {/* Newsletters as a service */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 var(--sb-gutter) 96px" }}>
        <div className="grid grid-cols-1 md:grid-cols-2"
          style={{
            background: "#E8E3DD",
            border: "1px solid #D8D1C7",
            borderRadius: "8px",
            padding: "48px",
            display: "grid",
            gap: "clamp(28px,5vw,48px)",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={mono}>{t("serviceEyebrow")}</div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "clamp(24px,3.4vw,36px)",
                fontWeight: 600,
                lineHeight: "1.15",
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              {t("serviceTitle")}
            </div>
            <div style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650" }}>
              {t("serviceBody")}
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
              {t("serviceCta")}
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
