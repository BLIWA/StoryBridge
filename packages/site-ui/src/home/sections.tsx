import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../navigation";
import { ArcWeaveDark, QuoteTile } from "../fx/backdrops";
import { PILLARS, TRUST_SIGNALS, DESK_STAGES, JOURNAL_POSTS } from "../content";
import { NewsletterSignup } from "../contact/newsletter-signup";
import { Editable } from "../preview/context";

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
          padding: "44px var(--sb-gutter)",
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
            <div style={mono}><Editable path={`Home.trust.${id}.label`}>{t(`${id}.label`)}</Editable></div>
            <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#3E4650" }}>
              <Editable path={`Home.trust.${id}.body`} multiline>{t(`${id}.body`)}</Editable>
            </div>
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
  title: ReactNode;
  note?: ReactNode;
  linkHref?: string;
  linkLabel?: ReactNode;
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
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "88px var(--sb-gutter)" }}>
      <SectionHead
        n="01"
        title={<Editable path="Home.whatWeDo.title">{t("title")}</Editable>}
        linkHref="/services"
        linkLabel={<Editable path="Home.whatWeDo.allServices">{t("allServices")}</Editable>}
      />
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
              <Editable path={`Pillars.${pillar.id}.title`}>{p(`${pillar.id}.title`)}</Editable>
            </div>
            <div style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#3E4650" }}>
              <Editable path={`Pillars.${pillar.id}.short`} multiline>{p(`${pillar.id}.short`)}</Editable>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#8F6135", marginTop: "auto" }}>
              <Editable path="Home.whatWeDo.learnMore">{t("learnMore")}</Editable>
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
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]"
        style={{
          position: "relative",
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "80px var(--sb-gutter)",
          display: "grid",
          gap: "clamp(28px,5vw,72px)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ ...mono, fontSize: "11.5px", letterSpacing: "0.18em", color: "#B57D49" }}>
            <Editable path="Home.desk.eyebrow">{t("eyebrow")}</Editable>
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "clamp(24px,4.0vw,42px)",
              lineHeight: "1.12",
              color: "#FDF8F1",
              letterSpacing: "-0.015em",
            }}
          >
            <Editable path="Home.desk.title">{t("title")}</Editable>
          </div>
          <div style={{ fontSize: "16px", lineHeight: "1.7", color: "rgba(253,248,241,0.78)" }}>
            <Editable path="Home.desk.body" multiline>{t("body")}</Editable>
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
            <Editable path="Home.desk.link">{t("link")}</Editable>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: "16px" }}>
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
                <Editable path={`Home.desk.stages.${stage.id}.title`}>{t(`stages.${stage.id}.title`)}</Editable>
              </div>
              <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "rgba(253,248,241,0.7)" }}>
                <Editable path={`Home.desk.stages.${stage.id}.body`} multiline>{t(`stages.${stage.id}.body`)}</Editable>
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
          fontSize: "clamp(140px,34vw,420px)",
          lineHeight: "0.7",
          color: "#B57D49",
          opacity: 0.09,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        &#8221;
      </div>
      <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "88px var(--sb-gutter)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]" style={{ gap: "clamp(28px,5vw,72px)", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ ...mono, fontSize: "11.5px", letterSpacing: "0.18em" }}>
              <Editable path="Home.why.eyebrow">{t("eyebrow")}</Editable>
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "clamp(24px,3.8vw,40px)",
                lineHeight: "1.15",
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              <Editable path="Home.why.title">{t("title")}</Editable>
            </div>
            <Link
              href="/who-we-are"
              data-hover="color:#002D62"
              style={{ fontSize: "14.5px", fontWeight: 600, color: "#8F6135", alignSelf: "flex-start" }}
            >
              <Editable path="Home.why.link">{t("link")}</Editable>
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
              <Editable path="Home.why.quote" multiline>{t("quote")}</Editable>
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
              <Editable path="Home.why.quoteEmphasis" multiline>{t("quoteEmphasis")}</Editable>
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
      <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "80px var(--sb-gutter)" }}>
        <SectionHead
          n="04"
          title={<Editable path="Home.journal.title">{t("title")}</Editable>}
          fontSize="38px"
          note={<Editable path="Home.journal.note" multiline>{t("note")}</Editable>}
          linkHref="/journal"
          linkLabel={<Editable path="Home.journal.all">{t("all")}</Editable>}
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
                  <Editable path="Home.journal.imagePlaceholder">{t("imagePlaceholder")}</Editable>
                </div>
              </div>
              <div style={{ ...mono, fontSize: "11px", letterSpacing: "0.14em" }}>
                <Editable path={`JournalPosts.${p.slug}.kicker`}>{post(`${p.slug}.kicker`)}</Editable>
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
                <Editable path={`JournalPosts.${p.slug}.title`}>{post(`${p.slug}.title`)}</Editable>
              </div>
              <div style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#3E4650" }}>
                <Editable path={`JournalPosts.${p.slug}.standfirst`} multiline>{post(`${p.slug}.standfirst`)}</Editable>
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
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "88px var(--sb-gutter)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]"
        style={{
          background: "#002D62",
          borderRadius: "8px",
          padding: "56px",
          display: "grid",
          gap: "clamp(28px,5vw,56px)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ ...mono, fontSize: "11.5px", letterSpacing: "0.18em", color: "#B57D49" }}>
            <Editable path="Home.newsletterCta.eyebrow">{t("eyebrow")}</Editable>
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "clamp(24px,3.6vw,38px)",
              lineHeight: "1.15",
              color: "#FDF8F1",
              letterSpacing: "-0.015em",
            }}
          >
            <Editable path="Home.newsletterCta.title">{t("title")}</Editable>
          </div>
          <div style={{ fontSize: "16px", lineHeight: "1.7", color: "rgba(253,248,241,0.78)" }}>
            <Editable path="Home.newsletterCta.body" multiline>{t("body")}</Editable>
          </div>
        </div>
        <NewsletterSignup source="Home page" />
      </div>
    </div>
  );
}
