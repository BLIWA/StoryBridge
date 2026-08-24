import type { CSSProperties, ReactNode } from "react";

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
