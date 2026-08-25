import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { JournalQuoteMark } from "@/components/journal-quote-mark";
import { getPublishedArticle, listPublishedArticles } from "@/lib/articles";
import { parseBody, tokenizeInline } from "@/lib/body-format";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/i18n/metadata";
import type { Metadata } from "next";

/** Reserved — never a real article slug (see the guard below). Exists only to satisfy the constraint under `output: "export"`. */
const NO_ARTICLES_SENTINEL = "__none__";

export async function generateStaticParams() {
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => (await listPublishedArticles(locale)).map((a) => ({ locale, slug: a.slug }))),
  );
  const params = perLocale.flat();
  // `output: "export"` requires generateStaticParams() to return at least one
  // entry — there's no server to fall back to at request time. Nothing is
  // published anywhere yet, so without this the build fails outright rather
  // than shipping a Journal with an honest empty state. The sentinel route
  // renders nothing but a 404 (see the guard below) and is never linked from
  // anywhere; the moment a real article publishes, this branch stops firing.
  return params.length > 0 ? params : [{ locale: routing.defaultLocale, slug: NO_ARTICLES_SENTINEL }];
}

/** An article's own headline and standfirst, rather than the site defaults. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (slug === NO_ARTICLES_SENTINEL) return pageMetadata(locale, "journal", {});
  const article = await getPublishedArticle(locale, slug);
  const base = await pageMetadata(locale, `journal/${slug}`, article ? { title: article.title, description: article.excerpt } : {});
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
  if (slug === NO_ARTICLES_SENTINEL) notFound();

  const article = await getPublishedArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations("Article");
  const byline = [article.author, ...article.coAuthors].filter(Boolean).join(", ");

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
          {article.cat}
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
          {article.title}
        </h1>
        {article.excerpt && (
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
            {article.excerpt}
          </div>
        )}

        {byline && (
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
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#002D62" }}>{byline}</div>
          </div>
        )}

        {article.leadImage?.url && (
          <figure style={{ margin: "36px 0 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage URL; avoids a remotePatterns change for CMS-uploaded media */}
            <img
              src={article.leadImage.url}
              alt={article.leadImage.alt}
              style={{ aspectRatio: "16/9", objectFit: "cover", borderRadius: "8px", border: "1px solid #D8D1C7", width: "100%" }}
            />
            {article.leadImage.credit && (
              <figcaption
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "11px",
                  color: "#8A8378",
                  marginTop: "10px",
                }}
              >
                {article.leadImage.credit}
              </figcaption>
            )}
          </figure>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "26px", margin: "44px 0 0" }}>
          {parseBody(article.body).map((block, i) => {
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
                  {block.text}
                </h2>
              );
            }
            if (block.type === "pullquote") {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "18px",
                    alignItems: "flex-start",
                    borderInlineStart: "2px solid #B57D49",
                    paddingInlineStart: "26px",
                    margin: "10px 0",
                  }}
                >
                  <div style={{ marginTop: "4px" }}>
                    <JournalQuoteMark />
                  </div>
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
                    {block.text}
                  </div>
                </div>
              );
            }
            if (block.type === "image") {
              return (
                <figure key={i} style={{ margin: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage URL */}
                  <img src={block.url} alt={block.alt} style={{ width: "100%", borderRadius: "8px" }} />
                  {block.credit && (
                    <figcaption style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#8A8378", marginTop: "10px" }}>
                      {block.credit}
                    </figcaption>
                  )}
                </figure>
              );
            }
            return (
              <p key={i} style={{ ...para, margin: 0 }}>
                {tokenizeInline(block.text).map((tok, j) =>
                  tok.bold ? <strong key={j}>{tok.text}</strong> : tok.italic ? <em key={j}>{tok.text}</em> : <span key={j}>{tok.text}</span>,
                )}
              </p>
            );
          })}
        </div>
      </article>

      {/* Footer signup */}
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "72px var(--sb-gutter) 96px" }}>
        <div
          className="grid grid-cols-1 md:grid-cols-2"
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
          <NewsletterSignup source="Journal post" />
        </div>
      </div>
    </>
  );
}
