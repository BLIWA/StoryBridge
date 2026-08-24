import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { JOURNAL_INDEX, FEATURED_POST } from "@/content/journal";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/i18n/metadata";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    JOURNAL_INDEX.map((p) => ({ locale, slug: p.slug })),
  );
}

/** An article's own headline and standfirst, rather than the site defaults. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getTranslations({ locale, namespace: `JournalPosts.${slug}` });
  const base = await pageMetadata(locale, `journal/${slug}`, {
    title: post("title"),
    description: post("standfirst"),
  });
  return { ...base, openGraph: { ...base.openGraph, type: "article" } };
}

const para = {
  fontFamily: "'Source Serif 4',serif",
  fontSize: "20px",
  lineHeight: "1.75",
  color: "#111111",
  textWrap: "pretty",
} as const;

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const meta = JOURNAL_INDEX.find((p) => p.slug === slug);
  if (!meta) notFound();

  // The board writes out one post in full; the rest exist as index entries only.
  const isWritten = slug === FEATURED_POST.slug;
  const post = FEATURED_POST;
  const t = await getTranslations("Article");
  const entry = await getTranslations(`JournalPosts.${slug}`);
  const full = await getTranslations("FeaturedPost");

  return (
    <>
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px var(--sb-gutter) 0" }}>
        <Link
          href="/journal"
          data-hover="color:#002D62"
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11.5px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#8F6135",
          }}
        >
          {t("backToJournal")}
        </Link>
      </div>

      <article style={{ maxWidth: "820px", margin: "0 auto", padding: "32px var(--sb-gutter) 0" }}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11.5px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#8F6135",
          }}
        >
          {entry("kicker")}
        </div>
        <h1
          style={{
            fontFamily: "'Source Serif 4',serif",
            fontWeight: 600,
            fontSize: "clamp(26px,5.0vw,52px)",
            lineHeight: "1.08",
            letterSpacing: "-0.022em",
            color: "#002D62",
            margin: "18px 0 0",
            textWrap: "balance",
          }}
        >
          {entry("title")}
        </h1>
        <div
          style={{
            fontFamily: "'Source Serif 4',serif",
            fontSize: "22px",
            lineHeight: "1.6",
            color: "#3E4650",
            marginTop: "18px",
            textWrap: "pretty",
          }}
        >
          {isWritten ? full("standfirst") : entry("standfirst")}
        </div>

        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "center",
            borderBlock: "1px solid #D8D1C7",
            padding: "18px 0",
            margin: "32px 0 0",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "999px",
              backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 6px,#EFE1D2 6px 12px)",
              border: "1px solid #D8D1C7",
              flex: "none",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#002D62" }}>{full("author")}</div>
            <div style={{ fontSize: "13.5px", color: "#5A6472" }}>{full("authorRole")}</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {post.languages.map((l) => (
              <div
                key={l}
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  color: "#8F6135",
                  border: "1px solid #DEC5A9",
                  borderRadius: "2px",
                  padding: "5px 9px",
                }}
              >
                {l}
              </div>
            ))}
          </div>
        </div>

        <figure style={{ margin: "36px 0 0" }}>
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
          <figcaption
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "11px",
              color: "#8A8378",
              marginTop: "10px",
            }}
          >
            {full("caption")}
          </figcaption>
        </figure>

        {isWritten ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "26px", margin: "44px 0 0" }}>
            {post.body.map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    style={{
                      fontFamily: "'Source Serif 4',serif",
                      fontSize: "30px",
                      fontWeight: 600,
                      lineHeight: "1.2",
                      color: "#002D62",
                      letterSpacing: "-0.015em",
                      margin: "14px 0 0",
                    }}
                  >
                    {full(block.key)}
                  </h2>
                );
              }
              if (block.type === "pullquote") {
                return (
                  <div
                    key={i}
                    style={{
                      borderInlineStart: "2px solid #B57D49",
                      paddingInlineStart: "32px",
                      margin: "10px 0",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Source Serif 4',serif",
                        fontStyle: "italic",
                        fontWeight: 600,
                        fontSize: "26px",
                        lineHeight: "1.45",
                        color: "#002D62",
                        textWrap: "pretty",
                      }}
                    >
                      {full(block.key)}
                    </div>
                  </div>
                );
              }
              if (block.type === "numbered") {
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {Array.from({ length: block.count }, (_, j) => (
                      <div key={j} style={{ display: "flex", gap: "18px", alignItems: "baseline" }}>
                        <div
                          style={{
                            fontFamily: "'IBM Plex Mono',monospace",
                            fontSize: "13px",
                            color: "#B57D49",
                            flex: "none",
                          }}
                        >
                          {String(j + 1).padStart(2, "0")}
                        </div>
                        <div style={{ ...para, fontSize: "19px" }}>{full(`${block.key}.${j}`)}</div>
                      </div>
                    ))}
                  </div>
                );
              }
              if (block.type === "para-drop") {
                return (
                  <p key={i} style={{ ...para, margin: 0 }}>
                    <span
                      style={{
                        fontFamily: "'Source Serif 4',serif",
                        fontSize: "clamp(34px,6.5vw,68px)",
                        lineHeight: "0.82",
                        fontWeight: 600,
                        color: "#002D62",
                        float: "inline-start",
                        paddingInlineEnd: "10px",
                        paddingTop: "4px",
                      }}
                    >
                      {full(post.dropCapKey)}
                    </span>
                    {full(block.key)}
                  </p>
                );
              }
              return (
                <p key={i} style={{ ...para, margin: 0 }}>
                  {full(block.key)}
                </p>
              );
            })}

            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                borderTop: "1px solid #D8D1C7",
                paddingTop: "24px",
                marginTop: "18px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "999px",
                  backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 6px,#EFE1D2 6px 12px)",
                  border: "1px solid #D8D1C7",
                  flex: "none",
                }}
              />
              <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#5A6472" }}>
                <span style={{ color: "#002D62", fontWeight: 600 }}>{full("author")}</span> {full("bio")}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: "1px dashed #DEC5A9",
              borderRadius: "8px",
              background: "#F8F1E8",
              padding: "32px",
              margin: "44px 0 0",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#8F6135",
              }}
            >
              {t("notWrittenTitle")}
            </div>
            <div style={{ fontSize: "16px", lineHeight: "1.7", color: "#3E4650" }}>
              {t("notWrittenBody")}
            </div>
          </div>
        )}
      </article>

      {/* Footer signup */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "72px var(--sb-gutter) 96px" }}>
        <div className="grid grid-cols-1 md:grid-cols-2"
          style={{
            background: "#002D62",
            borderRadius: "8px",
            padding: "44px",
            display: "grid",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "11.5px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#B57D49",
              }}
            >
              {t("newsletterEyebrow")}
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "clamp(24px,3.0vw,32px)",
                lineHeight: "1.2",
                color: "#FDF8F1",
                letterSpacing: "-0.015em",
              }}
            >
              {t("newsletterTitle")}
            </div>
          </div>
          <NewsletterSignup />
        </div>
      </div>
    </>
  );
}
