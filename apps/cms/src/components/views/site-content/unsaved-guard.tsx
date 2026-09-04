"use client";

import { useEffect } from "react";
import { MONO_LABEL, PrimaryButton, GhostButton } from "@/components/ui";

/** Browser-level backstop: a tab close/refresh while dirty gets the browser's own generic prompt. */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

/**
 * The in-app half of the same guard: shown before switching preview
 * language (which discards the current draft, since overrides are saved
 * per-locale) or leaving Site copy for another part of Studio while dirty.
 * Styled like publish-confirm-dialog.tsx's overlay/card.
 */
export function LeaveConfirmDialog({
  summary,
  onDiscard,
  onKeepEditing,
}: {
  summary: string;
  onDiscard: () => void;
  onKeepEditing: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Leave without saving?"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onKeepEditing();
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
          maxWidth: "420px",
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
          <div style={MONO_LABEL}>Unsaved changes</div>
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
            Leave without saving?
          </h2>
          <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#5A6472", margin: 0 }}>{summary}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <GhostButton onClick={onKeepEditing}>Keep editing</GhostButton>
          <PrimaryButton onClick={onDiscard} style={{ background: "#A5342E" }}>
            Discard changes &amp; leave
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
