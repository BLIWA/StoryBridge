"use client";

import { useEffect, useRef, useState } from "react";
import { FIELD_LABEL, INPUT, MONO_LABEL, PrimaryButton, GhostButton } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import {
  inviteStaff,
  InviteError,
  ROLES,
  ROLE_LABEL,
  ROLE_SCOPE,
  type Role,
} from "@/lib/staff";

export function InviteDialog({ onClose, onDone }: { onClose: () => void; onDone: (message: string) => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("journalist");
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const result = await inviteStaff({
        email,
        name,
        role,
        invitedBy: user?.email ?? "",
      });
      onDone(
        result.warning
          ? result.warning
          : result.emailSent
            ? `${name} is on the team — a set-your-password email is on its way to ${email.trim().toLowerCase()}.`
            : `${name} is on the team. They already have an account, so they can sign in straight away.`,
      );
    } catch (err) {
      setError(
        err instanceof InviteError
          ? err.message
          : "Couldn't add them. Check your connection and try again.",
      );
      setPending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add someone to the team"
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
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#FDF8F1",
          border: "1px solid #E6E0D8",
          borderRadius: "8px",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 18px 50px rgba(0,24,56,0.22)",
          animation: "cms-rise .28s cubic-bezier(.2,.7,.2,1) both",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <div style={MONO_LABEL}>People &amp; permissions</div>
          <h2
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "25px",
              lineHeight: 1.15,
              color: "#002D62",
              letterSpacing: "-0.018em",
              margin: 0,
            }}
          >
            Add someone to the desk
          </h2>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={FIELD_LABEL}>Full name</span>
          <input
            ref={firstField}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Imen Bliwa"
            style={INPUT}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={FIELD_LABEL}>Work email</span>
          <input
            required
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="imen@storybridge.news"
            style={INPUT}
          />
        </label>

        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          <legend style={{ ...FIELD_LABEL, padding: 0, marginBottom: "2px" }}>Role</legend>
          {ROLES.map((r) => (
            <label
              key={r}
              style={{
                display: "flex",
                gap: "11px",
                alignItems: "flex-start",
                border: `1px solid ${role === r ? "#B57D49" : "#E6E0D8"}`,
                background: role === r ? "#F8F1E8" : "#FFFFFF",
                borderRadius: "4px",
                padding: "11px 13px",
                cursor: "pointer",
                transition: "all .14s ease",
              }}
            >
              <input
                type="radio"
                name="role"
                checked={role === r}
                onChange={() => setRole(r)}
                style={{ accentColor: "#002D62", marginTop: "2px" }}
              />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#002D62" }}>
                  {ROLE_LABEL[r]}
                </span>
                <span style={{ display: "block", fontSize: "12.5px", lineHeight: 1.55, color: "#5A6472", marginTop: "2px" }}>
                  {ROLE_SCOPE[r]}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <div style={{ fontSize: "12.5px", lineHeight: 1.7, color: "#8A8378" }}>
          They get an email with a link to set their own password. Google sign-in works too, as long as
          it&rsquo;s the same address.
        </div>

        {error && (
          <div role="alert" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#A5342E", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #EDE7DE", paddingTop: "18px" }}>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit" style={{ opacity: pending ? 0.65 : 1 }}>
            {pending ? "Adding…" : "Add to the team"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
