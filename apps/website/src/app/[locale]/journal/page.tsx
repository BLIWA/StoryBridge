import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeroBackdrop } from "@/components/fx/backdrops";
import { listPublishedArticles } from "@/lib/articles";
import { routing } from "@/i18n/routing";
import { metadataFor } from "@/i18n/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = metadataFor("journal");

const kicker = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8F6135",
} as const;

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Journal");
  const articles = await listPublishedArticles(locale);
  const [lead, ...rest] = articles;

  return (
    <>
      {/* Masthead */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#FDF8F1",
          borderBottom: "1px solid #E6E0D8",
        }}
      >
        <PageHeroBackdrop id="wpgJournal" variant="quotes" glyph="“" />
        <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "66px var(--sb-gutter) 40px" }}>
          <div
            data-a
            style={{
              height: "6px",
              width: "180px",
              background: "#B57D49",
              transformOrigin: "left",
              animation: "sb-wipe .8s cubic-bezier(.2,.7,.2,1) .1s both",
              marginBottom: "26px",
            }}
          />
          <div
            data-a
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "20px",
              flexWrap: "wrap",
              animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) .24s both",
            }}
          >
            <h1
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 600,
                fontSize: "clamp(32px,6.1vw,64px)",
                lineHeight: "1.05",
                letterSpacing: "-0.022em",
                color: "#002D62",
                margin: 0,
              }}
            >
              {t("masthead")}
            </h1>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontStyle: "italic",
                fontSize: "22px",
                color: "#8F6135",
              }}
            >
              {t("title")}
            </div>
          </div>
          <div
            data-a
            style={{
              fontSize: "18px",
              lineHeight: "1.7",
              color: "#5A6472",
              maxWidth: "760px",
              marginTop: "20px",
              animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) .36s both",
            }}
          >
            {t("standfirst")}
          </div>

          {/* The categories actually in use, not a fixed taxonomy — there's nothing to show one against yet. */}
          {articles.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "22px",
                flexWrap: "wrap",
                marginTop: "32px",
                borderTop: "1px solid #D8D1C7",
                paddingTop: "18px",
              }}
            >
              {[...new Set(articles.map((a) => a.cat))].map((cat, i) => (
                <div
                  key={cat}
                  style={{
                    fontSize: "14.5px",
                    fontWeight: i === 0 ? 600 : 500,
                    color: i === 0 ? "#002D62" : "#5A6472",
                    borderBottom: i === 0 ? "2px solid #B57D49" : "2px solid transparent",
                    paddingBottom: "6px",
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "56px var(--sb-gutter) 96px" }}>
        {articles.length === 0 ? (
          <div
            style={{
              border: "1px dashed #DEC5A9",
              borderRadius: "8px",
              background: "#F8F1E8",
              padding: "48px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "620px",
            }}
          >
            <div style={kicker}>{t("emptyTitle")}</div>
            <div style={{ fontSize: "16px", lineHeight: "1.7", color: "#3E4650" }}>{t("emptyBody")}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]" style={{ gap: "clamp(28px,5vw,56px)", alignItems: "start" }}>
            {/* Lead story */}
            <Link href={`/journal/${lead.slug}`} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {lead.leadImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage URL; avoids a remotePatterns change for CMS-uploaded media
                <img
                  src={lead.leadImage.url}
                  alt={lead.leadImage.alt}
                  style={{ aspectRatio: "16/9", objectFit: "cover", borderRadius: "8px", border: "1px solid #D8D1C7", width: "100%" }}
                />
              ) : (
                <div
                  style={{
                    aspectRatio: "16/9",
                    borderRadius: "8px",
                    border: "1px solid #D8D1C7",
                    backgroundImage: "repeating-linear-gradient(135deg,#E4DED6 0 11px,#EFE1D2 11px 22px)",
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
                    {t("leadImage")}
                  </div>
                </div>
              )}
              <div style={kicker}>
                {lead.cat} · {lead.date}
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "clamp(24px,3.8vw,40px)",
                  fontWeight: 600,
                  lineHeight: "1.15",
                  color: "#002D62",
                  letterSpacing: "-0.015em",
                  textWrap: "balance",
                }}
              >
                {lead.title}
              </div>
              <div style={{ fontSize: "17px", lineHeight: "1.7", color: "#3E4650", textWrap: "pretty" }}>{lead.excerpt}</div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  borderTop: "1px solid #D8D1C7",
                  paddingTop: "16px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "999px",
                    backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 6px,#EFE1D2 6px 12px)",
                    border: "1px solid #D8D1C7",
                    flex: "none",
                  }}
                />
                <div style={{ fontSize: "14.5px", color: "#5A6472" }}>
                  {t.rich("byline", {
                    name: () => (
                      <span style={{ color: "#002D62", fontWeight: 600 }}>
                        {[lead.author, ...lead.coAuthors].filter(Boolean).join(", ")}
                      </span>
                    ),
                  })}
                </div>
              </div>
            </Link>

            {/* Secondary list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {rest.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/journal/${a.slug}`}
                  data-hover="background:#FDF8F1"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                    padding: "22px 0",
                    borderTop: i === 0 ? undefined : "1px solid #D8D1C7",
                    transition: "background .16s ease",
                  }}
                >
                  <div style={kicker}>{a.cat}</div>
                  <div
                    style={{
                      fontFamily: "'Source Serif 4',serif",
                      fontSize: "23px",
                      fontWeight: 600,
                      lineHeight: "1.25",
                      color: "#002D62",
                    }}
                  >
                    {a.title}
                  </div>
                  <div style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#3E4650" }}>{a.excerpt}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
