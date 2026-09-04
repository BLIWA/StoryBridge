import type { ReactNode } from "react";
import { PageHeroBackdrop } from "../fx/backdrops";

/**
 * The inner-page hero shared by Who We Are, Founders, How We Work, Services,
 * Packages, Work, Journal, Newsletter and Contact — identical on the board
 * apart from backdrop variant, glyph, eyebrow, title and optional standfirst.
 */
export function PageHero({
  backdropId,
  variant = "arcs",
  glyph = "“",
  eyebrow,
  title,
  standfirst,
  titleMaxWidth = "900px",
  standfirstSerif = false,
}: {
  backdropId: string;
  variant?: "arcs" | "quotes";
  glyph?: string;
  eyebrow: ReactNode;
  title: ReactNode;
  standfirst?: ReactNode;
  titleMaxWidth?: string;
  standfirstSerif?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#FDF8F1",
        borderBottom: "1px solid #E6E0D8",
      }}
    >
      <PageHeroBackdrop id={backdropId} variant={variant} glyph={glyph} />
      <div style={{ position: "relative", maxWidth: "1320px", margin: "0 auto", padding: "66px var(--sb-gutter) 70px" }}>
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
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "12px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8F6135",
            marginBottom: "20px",
            animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) 0.24s both",
          }}
        >
          {eyebrow}
        </div>
        {/* The board styles this as a div; it is the page's only <h1>, and
            seven of eleven pages shipped without one because of that. */}
        <h1
          data-a
          style={{
            fontFamily: "'Source Serif 4',serif",
            fontWeight: 600,
            fontSize: "clamp(32px,6.1vw,64px)",
            lineHeight: "1.05",
            letterSpacing: "-0.022em",
            color: "#002D62",
            maxWidth: titleMaxWidth,
            textWrap: "balance",
            margin: 0,
            animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) 0.36s both",
          }}
        >
          {title}
        </h1>
        {standfirst && (
          <div
            data-a
            style={
              standfirstSerif
                ? {
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "21px",
                    lineHeight: "1.7",
                    color: "#3E4650",
                    maxWidth: "720px",
                    marginTop: "22px",
                    textWrap: "pretty",
                    animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) 0.48s both",
                  }
                : {
                    fontSize: "18px",
                    lineHeight: "1.7",
                    color: "#5A6472",
                    maxWidth: "700px",
                    marginTop: "20px",
                    animation: "sb-rise .8s cubic-bezier(.2,.7,.2,1) 0.48s both",
                  }
            }
          >
            {standfirst}
          </div>
        )}
      </div>
    </div>
  );
}
