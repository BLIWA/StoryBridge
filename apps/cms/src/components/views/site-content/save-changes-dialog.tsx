"use client";

import { MONO_LABEL, PrimaryButton, GhostButton } from "@/components/ui";

export type ChangeEntry = { path: string; from: string; to: string };

function truncate(s: string, n = 90): string {
  const clean = s.trim() || "(empty)";
  return clean.length > n ? `${clean.slice(0, n)}…` : clean;
}

/**
 * The second confirmation the user asked for: before a save actually
 * publishes anything, show exactly what changed — every path, old value and
 * new value — so "Save" is never a leap of faith.
 */
export function SaveChangesDialog({
  changes,
  localeName,
  pending,
  onConfirm,
  onCancel,
}: {
  changes: ChangeEntry[];
  localeName: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm changes"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,24,56,0.44)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          maxHeight: "80vh",
          background: "#FDF8F1",
          border: "1px solid #E6E0D8",
          borderRadius: "8px",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxShadow: "0 18px 50px rgba(0,24,56,0.22)",
          animation: "cms-rise .28s cubic-bezier(.2,.7,.2,1) both",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <div style={MONO_LABEL}>Confirm to publish</div>
          <h2
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "22px",
              lineHeight: 1.2,
              color: "#002D62",
              letterSpacing: "-0.016em",
              margin: 0,
            }}
          >
            Save {changes.length} change{changes.length === 1 ? "" : "s"} to {localeName}?
          </h2>
          <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#5A6472", margin: 0 }}>
            This goes live on the site&rsquo;s next deploy — check what&rsquo;s changing below.
          </p>
        </div>

        <div style={{ overflowY: "auto", border: "1px solid #E6E0D8", borderRadius: "6px" }}>
          {changes.map((c, i) => (
            <div
              key={c.path}
              style={{
                padding: "12px 14px",
                borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", color: "#8F6135" }}>
                {c.path}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.5, color: "#A5342E", textDecoration: "line-through" }}>
                {truncate(c.from)}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.5, color: "#2F6B4F" }}>{truncate(c.to)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <GhostButton onClick={onCancel} disabled={pending}>
            Cancel
          </GhostButton>
          <PrimaryButton onClick={onConfirm} style={{ opacity: pending ? 0.65 : 1 }} disabled={pending}>
            {pending ? "Saving…" : "Confirm & publish"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
