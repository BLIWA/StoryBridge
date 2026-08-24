import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArcWeaveDark, QuoteTile } from "@/components/fx/backdrops";
import { PILLARS, TRUST_SIGNALS, DESK_STAGES, JOURNAL_POSTS } from "@/content/site";
import { NewsletterSignup } from "@/components/newsletter-signup";

const mono = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#8F6135",
} as const;

/** Trust strip — four rules-separated columns on Narrative Light. */
export function TrustStrip() {
  const t = useTranslations("Home.trust");

  return (
    <div style={{ background: "#E8E3DD", borderBlock: "1px solid #D8D1C7", position: "relative", overflow: "hidden" }}>
      <div
        data-parallax="22"
        style={{ position: "absolute", inset: "-24% 0", opacity: 0.5, pointerEvents: "none", willChange: "transform" }}
      >
        <QuoteTile id="qProof" />
      </div>
      <div
        style={{
          position: "relative",
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "44px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
          gap: "28px 0",
        }}
      >
        {TRUST_SIGNALS.map((id, i) => (
          <div
            key={id}
            style={{
              paddingInlineEnd: i === TRUST_SIGNALS.length - 1 ? undefined : "32px",
              paddingInlineStart: i === 0 ? undefined : "32px",
              borderInlineStart: i === 0 ? undefined : "1px solid #D8D1C7",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={mono}>{t(`${id}.label`)}</div>
            <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#3E4650" }}>{t(`${id}.body`)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Section rule: number, serif title, optional trailing link. */
export function SectionHead({
  n,
  title,
  note,
  linkHref,
  linkLabel,
  fontSize = "40px",
}: {
  n?: string;
  title: string;
  note?: string;
  linkHref?: string;
  linkLabel?: string;
  fontSize?: string;
}) {
  return (
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
      {n && (
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "14px", fontWeight: 500, color: "#8F6135" }}>
          {n}
        </div>
      )}
      <div
        style={{
          fontFamily: "'Source Serif 4',serif",
          fontWeight: 600,
          fontSize,
          lineHeight: 1,
          color: "#002D62",
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </div>
      {note && <div style={{ fontSize: "14.5px", color: "#5A6472", maxWidth: "520px", lineHeight: 1.6 }}>{note}</div>}
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          data-hover="color:#002D62"
          style={{
            marginInlineStart: "auto",
            fontSize: "14.5px",
            fontWeight: 600,
            color: "#8F6135",
            whiteSpace: "nowrap",
          }}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

/** "What we do" — four service cards with typographic marks. */
export function WhatWeDo() {
  const t = useTranslations("Home.whatWeDo");
  const p = useTranslations("Pillars");

  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "88px 40px" }}>
      <SectionHead n="01" title={t("title")} linkHref="/services" linkLabel={t("allServices")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "28px" }}>
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.id}
            href="/services"
            data-hover="box-shadow:0 2px 4px rgba(0,24,56,0.06),0 8px 24px rgba(0,24,56,0.08)"
            style={{
              background: "#FDF8F1",
              borderRadius: "8px",
              padding: "30px",
              boxShadow: "0 1px 2px rgba(0,24,56,0.06),0 2px 8px rgba(0,24,56,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              transition: "box-shadow .18s ease",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                border: "1.5px solid #002D62",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: "'Source Serif 4',serif", fontSize: "26px", lineHeight: 1, color: "#002D62" }}>
                {pillar.mark}
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "23px",
                fontWeight: 600,
                color: "#002D62",
                lineHeight: "1.25",
              }}
            >
              {p(`${pillar.id}.title`)}
            </div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#3E4650" }}>
              {p(`${pillar.id}.short`)}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#8F6135", marginTop: "auto" }}>
              {t("learnMore")}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Dark navy band — the four-stage desk process. */
export function DeskProcess() {
  const t = useTranslations("Home.desk");

  return (
    <div style={{ background: "#001838", position: "relative", overflow: "hidden" }}>
      <div
        data-parallax="-44"
        style={{ position: "absolute", inset: "-22% 0", opacity: 0.4, pointerEvents: "none", willChange: "transform" }}
      >
        <ArcWeaveDark id="weaveHome" />
      </div>
      <div
        style={{
          position: "relative",
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "80px 40px",
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: "72px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ ...mono, fontSize: "11.5px", letterSpacing: "0.18em", color: "#B57D49" }}>
            {t("eyebrow")}
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "42px",
              lineHeight: "1.12",
              color: "#FDF8F1",
              letterSpacing: "-0.015em",
            }}
          >
            {t("title")}
          </div>
          <div style={{ fontSize: "16px", lineHeight: "1.7", color: "rgba(253,248,241,0.78)" }}>
            {t("body")}
          </div>
          <Link
            href="/how-we-work"
            data-hover="color:#DEC5A9;border-bottom-color:#DEC5A9"
            style={{
              fontWeight: 600,
              fontSize: "15px",
              color: "#B57D49",
              borderBottom: "1.5px solid transparent",
              alignSelf: "flex-start",
              transition: "all .16s ease",
            }}
          >
            {t("link")}
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
          {DESK_STAGES.map((stage) => (
            <div
              key={stage.id}
              style={{
                background: "#072448",
                border: "1px solid rgba(253,248,241,0.10)",
                borderRadius: "8px",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#B57D49" }}>{stage.n}</div>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "19px", color: "#FDF8F1" }}>
                {t(`stages.${stage.id}.title`)}
              </div>
              <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "rgba(253,248,241,0.7)" }}>
                {t(`stages.${stage.id}.body`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** "Why StoryBridge" — bronze-ruled pull quote. */
export function WhyStoryBridge() {
  const t = useTranslations("Home.why");

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div
        data-parallax="-46"
        style={{
          position: "absolute",
          insetInlineEnd: "-1%",
          top: "-8%",
          fontFamily: "'Source Serif 4',serif",
          fontSize: "420px",
          lineHeight: "0.7",
          color: "#B57D49",
          opacity: 0.09,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        &#8221;
      </div>
      <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "88px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: "72px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ ...mono, fontSize: "11.5px", letterSpacing: "0.18em" }}>{t("eyebrow")}</div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "40px",
                lineHeight: "1.15",
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              {t("title")}
            </div>
            <Link
              href="/who-we-are"
              data-hover="color:#002D62"
              style={{ fontSize: "14.5px", fontWeight: 600, color: "#8F6135", alignSelf: "flex-start" }}
            >
              {t("link")}
            </Link>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              borderInlineStart: "2px solid #B57D49",
              paddingInlineStart: "40px",
            }}
          >
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "24px",
                lineHeight: "1.55",
                color: "#111111",
                textWrap: "pretty",
              }}
            >
              {t("quote")}
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "26px",
                lineHeight: "1.45",
                color: "#002D62",
              }}
            >
              {t("quoteEmphasis")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** "From the Journal" — three cards. */
export function FromTheJournal() {
  const t = useTranslations("Home.journal");
  const post = useTranslations("JournalPosts");

  return (
    <div style={{ background: "#E8E3DD", borderBlock: "1px solid #D8D1C7", position: "relative", overflow: "hidden" }}>
      <div
        data-parallax="26"
        style={{ position: "absolute", inset: "-18% 0", opacity: 0.42, pointerEvents: "none", willChange: "transform" }}
      >
        <QuoteTile id="qJournal" size={64} glyph={46} opacity={0.22} />
      </div>
      <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "80px 40px" }}>
        <SectionHead
          n="04"
          title={t("title")}
          fontSize="38px"
          note={t("note")}
          linkHref="/journal"
          linkLabel={t("all")}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: "32px" }}>
          {JOURNAL_POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/journal/${p.slug}`}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div
                style={{
                  aspectRatio: "3/2",
                  borderRadius: "8px",
                  border: "1px solid #D8D1C7",
                  backgroundImage: "repeating-linear-gradient(135deg,#E4DED6 0 11px,#EFE1D2 11px 22px)",
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
                  {t("imagePlaceholder")}
                </div>
              </div>
              <div style={{ ...mono, fontSize: "11px", letterSpacing: "0.14em" }}>
                {post(`${p.slug}.kicker`)}
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "24px",
                  fontWeight: 600,
                  lineHeight: "1.25",
                  color: "#002D62",
                }}
              >
                {post(`${p.slug}.title`)}
              </div>
              <div style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#3E4650" }}>
                {post(`${p.slug}.standfirst`)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Navy newsletter CTA block. */
export function NewsletterCta() {
  const t = useTranslations("Home.newsletterCta");

  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "88px 40px" }}>
      <div
        style={{
          background: "#002D62",
          borderRadius: "8px",
          padding: "56px",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: "56px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ ...mono, fontSize: "11.5px", letterSpacing: "0.18em", color: "#B57D49" }}>
            {t("eyebrow")}
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "38px",
              lineHeight: "1.15",
              color: "#FDF8F1",
              letterSpacing: "-0.015em",
            }}
          >
            {t("title")}
          </div>
          <div style={{ fontSize: "16px", lineHeight: "1.7", color: "rgba(253,248,241,0.78)" }}>
            {t("body")}
          </div>
        </div>
        <NewsletterSignup />
      </div>
    </div>
  );
}
