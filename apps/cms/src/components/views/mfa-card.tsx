"use client";

import { useMemo, useState } from "react";
import QRCode from "qrcode";
import type { TotpSecret } from "firebase/auth";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import {
  startEnrollment,
  finishEnrollment,
  enrolledFactors,
  unenrollFactor,
  MfaNotEnabledError,
} from "@/lib/mfa";

/**
 * Real TOTP (authenticator-app) enrollment — see lib/mfa.ts for why this
 * degrades to a plain notice rather than a stack trace when Identity
 * Platform's MFA support isn't switched on for the project yet.
 */
export function MfaCard() {
  const { user } = useAuth();
  // enrolledFactors() reads straight off the live `user` object, which
  // user.reload() below mutates in place rather than replacing — so a plain
  // derived read wouldn't notice a change. `refreshKey` exists purely to
  // force that read to happen again after enroll/unenroll, without an
  // effect or a second copy of the same state.
  const [refreshKey, setRefreshKey] = useState(0);
  const factors = useMemo(
    () => (user ? enrolledFactors(user).map((f) => ({ uid: f.uid, displayName: f.displayName ?? null })) : []),
    // refreshKey isn't read inside the callback — it's the point of this
    // dependency array. See the comment on its declaration above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, refreshKey],
  );

  const [notEnabled, setNotEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Enrollment in progress, if any.
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("Authenticator app");

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  async function begin() {
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      const started = await startEnrollment(user);
      setSecret(started.secret);
      setQrDataUrl(await QRCode.toDataURL(started.qrCodeUrl, { width: 220, margin: 1 }));
    } catch (err) {
      setError(err instanceof MfaNotEnabledError ? err.message : "Couldn't start enrollment. Try again.");
      setNotEnabled(err instanceof MfaNotEnabledError);
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    setSecret(null);
    setQrDataUrl(null);
    setCode("");
    setError(null);
  }

  async function confirm() {
    if (!user || !secret) return;
    setError(null);
    setBusy(true);
    try {
      await finishEnrollment(user, secret, code, label);
      await user.reload();
      cancel();
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't confirm that code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(uid: string) {
    if (!user) return;
    if (!window.confirm("Remove this authenticator? You'll be able to sign in with just your password again.")) return;
    setBusy(true);
    setError(null);
    try {
      await unenrollFactor(user, uid);
      await user.reload();
      refresh();
    } catch {
      setError("Couldn't remove that — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={CARD}>
      <div style={MONO_LABEL}>Two-factor authentication</div>

      {factors.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {factors.map((f) => (
            <div
              key={f.uid}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                border: "1px solid #E6E0D8",
                borderRadius: "4px",
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: "13.5px", color: "#3E4650" }}>
                {f.displayName || "Authenticator app"}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(f.uid)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12.5px", fontWeight: 600, color: "#A5342E" }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {secret && qrDataUrl ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#3E4650" }}>
            Scan this with Google Authenticator, 1Password, or any TOTP app — then enter the 6-digit code it shows.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- a locally-generated data: URL, not a remote asset Next's image pipeline should touch */}
          <img src={qrDataUrl} alt="Scan with your authenticator app" width={220} height={220} style={{ borderRadius: "4px", border: "1px solid #E6E0D8" }} />
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#8A8378", wordBreak: "break-all" }}>
            Can&rsquo;t scan? Enter this key manually: {secret.secretKey}
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={FIELD_LABEL}>Name this device</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} style={INPUT} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={FIELD_LABEL}>6-digit code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              style={{ ...INPUT, letterSpacing: "0.3em" }}
              autoFocus
            />
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <PrimaryButton onClick={() => void confirm()} disabled={busy || code.trim().length < 6}>
              {busy ? "Confirming…" : "Confirm"}
            </PrimaryButton>
            <GhostButton onClick={cancel} disabled={busy}>
              Cancel
            </GhostButton>
          </div>
        </div>
      ) : (
        <PrimaryButton onClick={() => void begin()} disabled={busy || notEnabled} style={{ alignSelf: "flex-start" }}>
          {busy ? "Starting…" : factors.length > 0 ? "Add another authenticator" : "Set up an authenticator app"}
        </PrimaryButton>
      )}

      {error && (
        <p role="alert" style={{ fontSize: "13px", color: "#A5342E", lineHeight: 1.6 }}>
          {error}
        </p>
      )}

      <NotWiredNote>
        This enrolls a second factor for your own account — real, backed by Identity Platform. Requiring it for
        every staff member project-wide is a separate setting an owner sets once in Firebase Console
        (Authentication → Sign-in method → Advanced → Multi-factor enforcement), not something this page controls.
      </NotWiredNote>
    </div>
  );
}
