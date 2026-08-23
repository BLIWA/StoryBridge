import { Link } from "@/i18n/navigation";
import { ArcWeave, BridgeArcs, QuoteTile } from "@/components/fx/backdrops";

/**
 * Arabic home, ported from "StoryBridge Website v2.dc.html" (lines 78–125).
 *
 * A distinct design, not a mirrored English page: Noto Naskh Arabic for
 * display, its own copy, RTL scrim direction, and a four-pillar band that
 * uses the same typographic marks. The board's Arabic build covers the home
 * page only — the inner pages are English-only on the board.
 */
export function ArabicHome() {
  return (
    <div style={{ fontFamily: "'IBM Plex Sans Arabic',sans-serif" }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div
            data-parallax="30"
            style={{ position: "absolute", left: 0, right: 0, top: "-16%", height: "132%", willChange: "transform" }}
          >
            <ArcWeave id="heroWeaveAr" />
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
            &#8221;
          </div>
          <div
            data-parallax="16"
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "300px", willChange: "transform" }}
          >
            <BridgeArcs height={320} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(270deg,rgba(253,248,241,0.97) 0%,rgba(253,248,241,0.9) 34%,rgba(253,248,241,0.4) 60%,rgba(253,248,241,0.78) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "60px 40px 76px",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "64px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "12px",
                letterSpacing: "0.18em",
                color: "#8F6135",
              }}
            >
              تونس · عربي · إنجليزي · فرنسي
            </div>
            <h1
              style={{
                fontFamily: "'Noto Naskh Arabic',serif",
                fontWeight: 700,
                fontSize: "60px",
                lineHeight: "1.35",
                color: "#002D62",
                margin: 0,
              }}
            >
              معايير الصحافة، في خدمة محتواك.
            </h1>
            <div style={{ fontSize: "19px", lineHeight: "1.95", color: "#3E4650", maxWidth: "560px" }}>
              ستوري بريدج للمحتوى والإعلام شركة اتصال ومحتوى متعدد اللغات، أسّستها صحفيتان ومحررتان التقتا في
              غرفة الأخبار ولم تتوقفا عن بناء الأفكار معًا.
            </div>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <Link
                href="/contact"
                data-hover="background:#001838"
                style={{
                  background: "#002D62",
                  color: "#FDF8F1",
                  borderRadius: "4px",
                  padding: "14px 26px",
                  fontWeight: 600,
                  fontSize: "15px",
                  transition: "all .16s ease",
                }}
              >
                اطلب عرض سعر
              </Link>
              <Link
                href="/how-we-work"
                data-hover="background:#F8F1E8"
                style={{
                  color: "#8F6135",
                  border: "1.5px solid #B57D49",
                  borderRadius: "4px",
                  padding: "12.5px 24px",
                  fontWeight: 600,
                  fontSize: "15px",
                  transition: "all .16s ease",
                }}
              >
                كيف نعمل ←
              </Link>
            </div>
            <div
              style={{
                borderTop: "1px solid #D8D1C7",
                paddingTop: "18px",
                fontSize: "15px",
                color: "#5A6472",
                lineHeight: "1.8",
              }}
            >
              تأسست على يد <span style={{ color: "#002D62", fontWeight: 600 }}>آسيا التواتي</span> و
              <span style={{ color: "#002D62", fontWeight: 600 }}>إيمان بلواء</span> — محررة وصحفية، أكثر من عشر
              سنوات في الصحافة والترجمة والإعلام الدولي.
            </div>
          </div>

          <div
            style={{
              border: "1px solid #E6E0D8",
              borderRadius: "8px",
              background: "#FFFFFF",
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              boxShadow: "0 1px 2px rgba(0,24,56,0.06),0 2px 8px rgba(0,24,56,0.05)",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "11px",
                letterSpacing: "0.16em",
                color: "#8F6135",
              }}
            >
              رسالة واحدة · ثلاث لغات
            </div>
            <div
              style={{
                fontFamily: "'Noto Naskh Arabic',serif",
                fontSize: "27px",
                lineHeight: "1.7",
                color: "#002D62",
              }}
            >
              نبني الجسر بين الفكرة والجمهور الذي كُتبت من أجله.
            </div>
            <div style={{ height: "1px", background: "#E6E0D8" }} />
            <div
              dir="ltr"
              style={{ fontFamily: "'Source Serif 4',serif", fontSize: "22px", lineHeight: "1.5", color: "#3E4650" }}
            >
              Nous bâtissons le pont entre une idée et le public auquel elle s&apos;adresse.
            </div>
            <div style={{ height: "1px", background: "#E6E0D8" }} />
            <div
              dir="ltr"
              style={{ fontFamily: "'Source Serif 4',serif", fontSize: "22px", lineHeight: "1.5", color: "#3E4650" }}
            >
              We build the bridge between an idea and the audience it was written for.
            </div>
          </div>
        </div>
      </div>

      {/* Four pillars */}
      <div style={{ background: "#E8E3DD", borderBlock: "1px solid #D8D1C7", position: "relative", overflow: "hidden" }}>
        <div
          data-parallax="22"
          style={{ position: "absolute", inset: "-24% 0", opacity: 0.5, pointerEvents: "none", willChange: "transform" }}
        >
          <QuoteTile id="qProofAr" />
        </div>
        <div
          style={{
            position: "relative",
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "56px 40px",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "36px",
          }}
        >
          {[
            { mark: "¶", title: "المحتوى والتحرير", body: "مقالات، محتوى المواقع، محتوى الشبكات الاجتماعية والمواد التحريرية." },
            { mark: "« »", title: "الترجمة والتوطين", body: "عربي، إنجليزي وفرنسي — بانتباه إلى المعنى والسياق والنبرة والجمهور." },
            { mark: "§", title: "التحرير والكتابة", body: "مراجعة، تدقيق وإعادة صياغة مع الحفاظ على الغرض والصوت." },
            { mark: "†", title: "الإعلام والصحافة", body: "تغطية صحفية، محتوى إعلامي ومواد اتصال ودعم ميداني." },
          ].map((p) => (
            <div key={p.title} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontFamily: "'Noto Naskh Arabic',serif", fontSize: "28px", color: "#B57D49" }}>{p.mark}</div>
              <div
                style={{
                  fontFamily: "'Noto Naskh Arabic',serif",
                  fontSize: "23px",
                  fontWeight: 700,
                  color: "#002D62",
                }}
              >
                {p.title}
              </div>
              <div style={{ fontSize: "15px", lineHeight: "1.9", color: "#3E4650" }}>{p.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "72px 40px 88px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontFamily: "'Noto Naskh Arabic',serif",
            fontSize: "38px",
            lineHeight: "1.5",
            color: "#002D62",
            maxWidth: "900px",
          }}
        >
          اللغة أكثر من ترجمة. الأمر يتعلق بإيصال الرسالة الصحيحة إلى الأشخاص المناسبين بالطريقة المناسبة.
        </div>
        <Link
          href="/"
          locale="en"
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "12px",
            letterSpacing: "0.14em",
            color: "#8F6135",
            borderBottom: "1px solid #DEC5A9",
            paddingBottom: "3px",
          }}
        >
          ← BACK TO ENGLISH SITE
        </Link>
      </div>
    </div>
  );
}
