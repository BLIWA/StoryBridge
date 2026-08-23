import Image from "next/image";
import { Link } from "@/i18n/navigation";

/** Footer from "StoryBridge Website v2.dc.html" — dark navy, bronze weave behind. */

const COLUMNS = [
  {
    title: "Company",
    links: [
      { href: "/who-we-are", label: "Who we are" },
      { href: "/founders", label: "Founders" },
      { href: "/how-we-work", label: "How we work" },
      { href: "/work", label: "Selected work" },
    ],
  },
  {
    title: "Work with us",
    links: [
      { href: "/services", label: "Services" },
      { href: "/packages", label: "Packages" },
      { href: "/newsletter", label: "Newsletter" },
      { href: "/journal", label: "Journal" },
    ],
  },
] as const;

const labelStyle = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#B57D49",
} as const;

export function SiteFooter() {
  return (
    <div style={{ background: "#001838", color: "#FDF8F1", position: "relative", overflow: "hidden" }}>
      <div
        data-parallax="-34"
        style={{
          position: "absolute",
          inset: "-20% 0",
          opacity: 0.3,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        <svg width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <pattern id="weaveFooter" width="96" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 0,48 A 24,24 0 0 1 48,48 A 24,24 0 0 1 96,48"
                style={{ fill: "none", stroke: "#B57D49", strokeWidth: "1.1px" }}
              />
              <path
                d="M -24,24 A 24,24 0 0 1 24,24 A 24,24 0 0 1 72,24 A 24,24 0 0 1 120,24"
                style={{ fill: "none", stroke: "#B57D49", strokeWidth: "1.1px", opacity: 0.6 }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#weaveFooter)" />
        </svg>
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "72px 40px 36px",
          display: "grid",
          gridTemplateColumns: "1.3fr 0.7fr 0.7fr 1fr",
          gap: "48px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <Image
              src="/assets/mark-fdf8f1.png"
              alt="StoryBridge"
              width={110}
              height={120}
              style={{ height: "40px", width: "auto", flex: "none" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontWeight: 600,
                  fontSize: "25px",
                  lineHeight: 1,
                  color: "#FDF8F1",
                  letterSpacing: "-0.015em",
                }}
              >
                StoryBridge
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif 4',serif",
                  fontSize: "9.5px",
                  lineHeight: 1,
                  color: "#B57D49",
                  letterSpacing: "0.15em",
                }}
              >
                CONTENT &amp; MEDIA
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "14.5px",
              lineHeight: "1.7",
              color: "rgba(253,248,241,0.72)",
              maxWidth: "340px",
            }}
          >
            Content. Translation. Editorial. Media. One bridge between ideas and audiences.
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "11.5px",
              lineHeight: "1.9",
              color: "rgba(253,248,241,0.5)",
            }}
          >
            العربية · FRANÇAIS · ENGLISH
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={labelStyle}>{col.title}</div>
            {col.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-hover="color:#FDF8F1"
                style={{ fontSize: "14.5px", color: "rgba(253,248,241,0.8)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        ))}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={labelStyle}>Contact</div>
          <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "rgba(253,248,241,0.8)" }}>
            hello@storybridge.tn
          </div>
          <div style={{ fontSize: "14.5px", lineHeight: "1.7", color: "rgba(253,248,241,0.8)" }}>
            Tunis, Tunisia
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "10.5px",
              letterSpacing: "0.06em",
              color: "#B57D49",
              border: "1px dashed rgba(181,125,73,0.5)",
              borderRadius: "2px",
              padding: "6px 9px",
              alignSelf: "flex-start",
            }}
          >
            placeholder — real details to come
          </div>
        </div>
      </div>

      <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "0 40px" }}>
        <div
          style={{
            borderTop: "1px solid rgba(253,248,241,0.14)",
            padding: "22px 0 40px",
            display: "flex",
            justifyContent: "space-between",
            gap: "24px",
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11.5px",
            color: "rgba(253,248,241,0.5)",
          }}
        >
          <div>© 2026 StoryBridge Content &amp; Media</div>
          <div>Strategic communications · Content · Translation · Media</div>
        </div>
      </div>
    </div>
  );
}
