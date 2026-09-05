"use client";

import { useEffect, useRef, useState } from "react";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";
import { FIELD_LABEL, INPUT, MONO_LABEL, PrimaryButton, GhostButton } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

/**
 * A step between "Publish now" and it actually happening. The board's Settings
 * card promises 2FA for every publish; full multi-factor needs Firebase
 * Identity Platform, which needs Blaze (see settings.tsx's NotWiredNote) — not
 * available on this project today. This is the part that *is* available on
 * the free tier: Firebase Auth's reauthenticateWith*, so publishing still
 * costs proving you are still you, not just having a browser tab open.
 *
 * Branches on how the signed-in user actually authenticates — a
 * password-account user re-enters their password; a Google-only user has no
 * password to check, so they get an interactive Google reauth prompt instead.
 *
 * Also reused, under different copy (see the `monoLabel`/`heading`/`blurb`/
 * `confirmLabel` props), for Archive and Republish in article-editor.tsx —
 * taking a piece off the live site or putting it back is exactly as
 * consequential as publishing it the first time.
 */
export function PublishConfirmDialog({
  articleTitle,
  onClose,
  onConfirmed,
  monoLabel = "Confirm to publish",
  heading = `Going live: “${articleTitle}”`,
  blurb = "Prove it's still you before this reaches the site.",
  confirmLabel = "Confirm & publish",
}: {
  articleTitle: string;
  onClose: () => void;
  onConfirmed: () => void;
  /** Lets Archive/Republish (see article-editor.tsx) reuse this same reauth
   * step under different copy — taking a piece off the site is as
   * consequential as putting it there. */
  monoLabel?: string;
  heading?: string;
  blurb?: string;
  confirmLabel?: string;
}) {
  const { user } = useAuth();
  const hasPassword = (user?.providerData ?? []).some((p) => p.providerId === "password");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function confirmWithPassword(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !user?.email) return;
    setPending(true);
    setError(null);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
      onConfirmed();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setError(
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "That password doesn't match your account."
          : code === "auth/too-many-requests"
            ? "Too many attempts — wait a moment and try again."
            : "Couldn't verify you. Check your connection and try again.",
      );
      setPending(false);
    }
  }

  async function confirmWithGoogle() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await reauthenticateWithPopup(user!, new GoogleAuthProvider());
      onConfirmed();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setError(
        code === "auth/popup-closed-by-user"
          ? "Sign-in was closed before it finished — try again."
          : "Couldn't verify you with Google. Try again.",
      );
      setPending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={monoLabel}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
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
          <div style={MONO_LABEL}>{monoLabel}</div>
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
            {heading}
          </h2>
          <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#5A6472", margin: 0 }}>{blurb}</p>
        </div>

        {hasPassword ? (
          <form onSubmit={confirmWithPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={FIELD_LABEL}>Your password</span>
              <input
                ref={firstField}
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={INPUT}
              />
            </label>

            {error && (
              <div role="alert" style={{ fontSize: "13px", lineHeight: 1.6, color: "#A5342E", fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <GhostButton onClick={onClose} disabled={pending}>
                Cancel
              </GhostButton>
              <PrimaryButton type="submit" style={{ opacity: pending ? 0.65 : 1 }}>
                {pending ? "Checking…" : confirmLabel}
              </PrimaryButton>
            </div>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "13px", lineHeight: 1.65, color: "#5A6472" }}>
              You signed in with Google and have no StoryBridge password to check — confirm through
              Google instead.
            </div>

            {error && (
              <div role="alert" style={{ fontSize: "13px", lineHeight: 1.6, color: "#A5342E", fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <GhostButton onClick={onClose} disabled={pending}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={confirmWithGoogle} style={{ opacity: pending ? 0.65 : 1 }} disabled={pending}>
                {pending ? "Checking…" : "Confirm with Google"}
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
