import { useState, type CSSProperties, type ReactNode } from "react";

/** Small primitives shared by the CMS views, styled from the board. */

export const MONO_LABEL: CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "10.5px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8F6135",
};

export const CARD: CSSProperties = {
  background: "#FDF8F1",
  border: "1px solid #E6E0D8",
  borderRadius: "8px",
  padding: "22px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

export const INPUT: CSSProperties = {
  border: "1px solid #D8D1C7",
  borderRadius: "4px",
  background: "#FFFFFF",
  padding: "11px 12px",
  width: "100%",
};

export const FIELD_LABEL: CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "#3E4650",
};

export function Pill({ bg, fg, children }: { bg: string; fg: string; children: ReactNode }) {
  return (
    <span
      style={{
        background: bg,
        color: fg,
        borderRadius: "3px",
        padding: "4px 9px",
        fontFamily: "'IBM Plex Mono',monospace",
        fontSize: "10.5px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function SectionCard({
  title,
  action,
  children,
  style,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ ...CARD, padding: 0, ...style }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "18px 22px",
          borderBottom: "1px solid #E6E0D8",
        }}
      >
        <div style={MONO_LABEL}>{title}</div>
        {action}
      </div>
      <div style={{ padding: "6px 22px 18px" }}>{children}</div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  style,
  disabled = false,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  style?: CSSProperties;
  /** Greys the button out and drops the hover rule, so it never invites a click it will ignore. */
  disabled?: boolean;
  /** Worth passing whenever `disabled` is true: it is where the reason goes. */
  title?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-hover={disabled ? undefined : "background:#001838"}
      style={{
        background: disabled ? "#D5D0C8" : "#002D62",
        color: disabled ? "#8A8378" : "#FDF8F1",
        border: "none",
        borderRadius: "4px",
        padding: "11px 18px",
        fontWeight: 600,
        fontSize: "13.5px",
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        transition: "all .16s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  style,
  disabled = false,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-hover={disabled ? undefined : "background:#F1EBE3"}
      style={{
        background: "#FDF8F1",
        border: "1px solid #D8D1C7",
        borderRadius: "4px",
        padding: "10px 16px",
        fontWeight: 600,
        fontSize: "13.5px",
        color: disabled ? "#A9A296" : "#3E4650",
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        transition: "all .16s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// One hook-shaped path — the same comma silhouette as the bronze stroke in
// /assets/storybridge-mark.png — drawn once and mirrored horizontally in
// navy, so the pair reads as an opening and closing curly quote rather than
// one blob. Used wherever the editor needs a curly-quote glyph in the
// brand's own shape rather than a generic typographic one: the toolbar's
// quote button and the pull-quote block in Preview. Kept local to the CMS
// rather than shared via @storybridge/ui — it's a few lines of SVG, not
// worth a package boundary.
const QUOTE_HOOK_PATH =
  "M27 2C16 3.6 8.5 12.4 8.5 21.8C8.5 29.8 14.6 36 21.8 36C28 36 33 31.2 33 25C33 18.8 28 14 21.8 14C19.6 14 17.6 14.7 16 15.9C16.7 8.6 21.2 3.6 27.8 1.7C28.9 1.4 28.3 1.8 27 2Z";

export function QuoteMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * (36 / 70)}
      viewBox="0 0 70 36"
      aria-hidden="true"
      style={{ display: "block", flex: "none" }}
    >
      <path d={QUOTE_HOOK_PATH} fill="#B57D49" />
      <path d={QUOTE_HOOK_PATH} fill="#002D62" transform="translate(70,0) scale(-1,1)" />
    </svg>
  );
}

/**
 * A Storage image with somewhere to go while it loads and somewhere to go if
 * it never does — the two states a bare `<img>` leaves blank. Used wherever
 * the editor shows a real uploaded image (lead image, in-body images in
 * Preview) now that lib/media.ts uploads to real URLs instead of nothing.
 */
export function MediaImage({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style?: CSSProperties;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");

  if (state === "error") {
    return (
      <div
        role="img"
        aria-label={alt || "Image failed to load"}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F3E3E3",
          border: "1px solid #E0C6C4",
          color: "#8A3B3B",
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: "11px",
          textAlign: "center",
          padding: "8px",
        }}
      >
        Couldn&rsquo;t load image
      </div>
    );
  }

  return (
    <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", ...style }}>
      {state === "loading" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg,#EDE7DE 0%,#F8F4EE 50%,#EDE7DE 100%)",
            backgroundSize: "200% 100%",
            animation: "cms-shimmer 1.3s ease-in-out infinite",
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: state === "loaded" ? 1 : 0,
          transition: "opacity .2s ease",
        }}
      />
    </div>
  );
}

/**
 * Banner marking a control that has no backend behind it yet. Used wherever the
 * board shows an action (publish, send, export) whose Firestore/Functions
 * implementation is still roadmap Phase 05–06 — so the UI never implies that
 * something was saved or sent when nothing left the browser.
 */
export function NotWiredNote({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono',monospace",
        fontSize: "10.5px",
        letterSpacing: "0.06em",
        lineHeight: 1.7,
        color: "#8F6135",
        border: "1px dashed #DEC5A9",
        borderRadius: "3px",
        padding: "8px 10px",
        background: "#F8F1E8",
      }}
    >
      {children}
    </div>
  );
}
