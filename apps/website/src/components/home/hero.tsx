import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArcWeave, BridgeArcs } from "@/components/fx/backdrops";

/**
 * Home hero from "StoryBridge Website v2.dc.html" (lines 128–208).
 * Backdrop: arc weave + oversized bronze quote + drawn bridge + cream scrim.
 * The board exposes a `heroBackdrop` (arcs|quotes) and `heroVariant`
 * (masthead|portrait) prop; this ships the board's defaults — arcs + masthead.
 */
export function HomeHero() {
  const t = useTranslations("Home.hero");

  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#FDF8F1" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          data-parallax="30"
          style={{ position: "absolute", left: 0, right: 0, top: "-16%", height: "132%", willChange: "transform" }}
        >
          <ArcWeave id="heroWeaveEn" />
        </div>
        <div
          data-parallax="-64"
          style={{
            position: "absolute",
            insetInlineEnd: "1.5%",
            top: "2%",
            fontFamily: "'Source Serif 4',serif",
            fontSize: "400px",
            lineHeight: "0.66",
            color: "#B57D49",
            opacity: 0.11,
            willChange: "transform",
          }}
        >
          &#8220;
        </div>
        <div
          data-parallax="16"
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "320px", willChange: "transform" }}
        >
          <BridgeArcs height={320} />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,rgba(253,248,241,0.97) 0%,rgba(253,248,241,0.9) 34%,rgba(253,248,241,0.4) 60%,rgba(253,248,241,0.78) 100%)",
          }}
        />
      </div>

      {/* Dateline strip */}
      <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "18px 40px 0" }}>
        <div
          style={{
            borderBottom: "1px solid #D8D1C7",
            paddingBottom: "13px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px 28px",
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#8A8378",
          }}
        >
          <div>{t("dateline.place")}</div>
          <div>{t("dateline.disciplines")}</div>
          <div>{t("dateline.languages")}</div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "66px 40px 30px",
          display: "grid",
          gridTemplateColumns: "1.12fr 0.88fr",
          gap: "72px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            data-a
            style={{
              height: "6px",
              width: "220px",
              background: "#B57D49",
              transformOrigin: "left",
              animation: "sb-wipe .85s cubic-bezier(.2,.7,.2,1) .1s both",
            }}
          />
          <div
            data-a
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8F6135",
              animation: "sb-rise .7s cubic-bezier(.2,.7,.2,1) .22s both",
            }}
          >
            {t("eyebrow")}
          </div>
          <h1
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "74px",
              lineHeight: "1.02",
              letterSpacing: "-0.024em",
              color: "#002D62",
              margin: 0,
            }}
          >
            <div data-a style={{ animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) .34s both" }}>
              {t("titleLead")}
            </div>
            <div data-a style={{ animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) .48s both" }}>
              {t("titleApplied")}{" "}
              <span style={{ position: "relative", display: "inline-block" }}>
                <span style={{ position: "relative", zIndex: 1 }}>{t("titleHighlight")}</span>
                <span
                  data-a
                  style={{
                    position: "absolute",
                    insetInline: "-4px",
                    bottom: "0.09em",
                    height: "0.3em",
                    background: "rgba(181,125,73,0.34)",
                    transformOrigin: "left",
                    animation: "sb-wipe .9s cubic-bezier(.2,.7,.2,1) 1.05s both",
                  }}
                />
              </span>
            </div>
          </h1>
          <div
            data-a
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "21px",
              lineHeight: "1.62",
              color: "#3E4650",
              maxWidth: "600px",
              textWrap: "pretty",
              animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) .62s both",
            }}
          >
            {t("intro")}
          </div>
          <div
            data-a
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "center",
              flexWrap: "wrap",
              animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) .76s both",
            }}
          >
            <Link
              href="/contact"
              data-hover="background:#001838;box-shadow:0 2px 8px rgba(0,24,56,0.18)"
              style={{
                background: "#002D62",
                color: "#FDF8F1",
                borderRadius: "4px",
                padding: "15px 28px",
                fontWeight: 600,
                fontSize: "15px",
                letterSpacing: "0.02em",
                transition: "all .16s ease",
              }}
            >
              {t("ctaPrimary")}
            </Link>
            <Link
              href="/how-we-work"
              data-hover="background:#F8F1E8;color:#5F4123"
              style={{
                color: "#8F6135",
                border: "1.5px solid #B57D49",
                borderRadius: "4px",
                padding: "13.5px 26px",
                fontWeight: 600,
                fontSize: "15px",
                letterSpacing: "0.02em",
                transition: "all .16s ease",
              }}
            >
              {t("ctaSecondary")}
            </Link>
          </div>
          <div
            data-a
            style={{
              borderTop: "1px solid #D8D1C7",
              paddingTop: "20px",
              display: "flex",
              gap: "14px",
              alignItems: "center",
              animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) .9s both",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "999px",
                backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 6px,#EFE1D2 6px 12px)",
                border: "1px solid #D8D1C7",
                flex: "none",
              }}
            />
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "999px",
                backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 6px,#EFE1D2 6px 12px)",
                border: "1px solid #D8D1C7",
                flex: "none",
                marginInlineStart: "-20px",
              }}
            />
            <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#5A6472" }}>
              {t.rich("foundedBy", {
                founder: (chunks) => (
                  <Link
                    href="/founders"
                    style={{ color: "#002D62", fontWeight: 600, borderBottom: "1px solid #DEC5A9" }}
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </div>
          </div>
        </div>

        {/* Masthead card — the three languages cycle on a shared 10.5s baton */}
        <div
          data-a
          style={{
            position: "relative",
            border: "1px solid #E6E0D8",
            borderRadius: "8px",
            background: "#FFFFFF",
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            boxShadow: "0 1px 2px rgba(0,24,56,0.06),0 12px 36px rgba(0,24,56,0.07)",
            animation: "sb-rise .9s cubic-bezier(.2,.7,.2,1) .58s both",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-1px",
              insetInline: "-1px",
              height: "4px",
              background: "#B57D49",
              borderRadius: "8px 8px 0 0",
            }}
          />
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
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "11px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#8F6135",
              }}
            >
              {t("mastheadLabel")}
            </div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", lineHeight: 1, color: "#B57D49" }}>
              &#182;
            </div>
          </div>

          {[
            {
              delay: "1.4s",
              dir: "rtl" as const,
              text: "نبني الجسر بين الفكرة والجمهور الذي كُتبت من أجله.",
              style: {
                fontFamily: "'Noto Naskh Arabic',serif",
                fontSize: "26px",
                lineHeight: "1.75",
                color: "#002D62",
              },
            },
            {
              delay: "4.9s",
              text: "Nous bâtissons le pont entre une idée et le public auquel elle s'adresse.",
              style: {
                fontFamily: "'Source Serif 4',serif",
                fontSize: "22px",
                lineHeight: "1.5",
                color: "#3E4650",
              },
            },
            {
              delay: "8.4s",
              text: "We build the bridge between an idea and the audience it was written for.",
              style: {
                fontFamily: "'Source Serif 4',serif",
                fontSize: "22px",
                lineHeight: "1.5",
                color: "#3E4650",
              },
            },
          ].map((row, i) => (
            <div key={row.delay}>
              {i > 0 && <div style={{ height: "1px", background: "#E6E0D8", marginBottom: "22px" }} />}
              <div style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
                <div
                  data-a
                  style={{
                    width: "3px",
                    flex: "none",
                    background: "#B57D49",
                    transformOrigin: "top",
                    animation: `sb-batonbar 10.5s linear ${row.delay} infinite`,
                  }}
                />
                <div
                  dir={row.dir}
                  data-a
                  style={{ flex: 1, ...row.style, animation: `sb-baton 10.5s linear ${row.delay} infinite` }}
                >
                  {row.text}
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/"
            locale="ar"
            data-hover="color:#002D62"
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "11.5px",
              letterSpacing: "0.12em",
              color: "#8F6135",
              borderTop: "1px solid #E6E0D8",
              paddingTop: "16px",
            }}
          >
            {t("readInArabic")}
          </Link>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "0 40px 40px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          data-a
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "10.5px",
            letterSpacing: "0.2em",
            color: "#8A8378",
            animation: "sb-fade 1s ease 1.7s both",
          }}
        >
          {t("scroll")}
        </div>
        <div
          data-a
          style={{ width: "1px", height: "34px", background: "#B57D49", animation: "sb-cue 2.8s ease-in-out 2.1s infinite" }}
        />
      </div>
    </div>
  );
}
