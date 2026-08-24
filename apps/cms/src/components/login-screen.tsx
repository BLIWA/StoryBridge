"use client";

import { useState } from "react";
import Image from "next/image";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  type AuthError,
} from "firebase/auth";
import { getFirebase, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

/** Split navy/cream sign-in from "StoryBridge CMS.dc.html" (lines 31–74). */

function messageFor(error: unknown): string {
  const code = (error as AuthError)?.code ?? "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return "That email and password don't match. Try again.";
  }
  if (code === "auth/user-not-found") return "No StoryBridge account uses that email.";
  if (code === "auth/too-many-requests") return "Too many attempts. Wait a moment and try again.";
  if (code === "auth/popup-closed-by-user") return "The Google window closed before sign-in finished.";
  if (code === "auth/unauthorized-domain") {
    return "This domain isn't in the Firebase authorised list yet. Add it under Authentication → Settings.";
  }
  return "Couldn't sign you in. Check your connection and try again.";
}

const inputStyle = {
  border: "1px solid #D8D1C7",
  borderRadius: "4px",
  background: "#FFFFFF",
  padding: "13px 14px",
  transition: "box-shadow .16s ease",
  width: "100%",
} as const;

export function LoginScreen() {
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setError(null);
    setNotice(null);
    if (!configured) {
      setError(
        "Firebase isn't configured in this build yet — add the web app config to .env.local (see .env.example).",
      );
      return;
    }
    setPending(true);
    try {
      await fn();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]" style={{ minHeight: "100vh" }}>
      {/* Left — navy panel */}
      <div
        style={{
          position: "relative",
          background: "#002D62",
          overflow: "hidden",
          padding: "56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5 }}>
          <svg width="100%" height="100%" style={{ display: "block" }}>
            <defs>
              <pattern id="cmsWeave" width="144" height="72" patternUnits="userSpaceOnUse">
                <path
                  d="M 0,72 A 36,36 0 0 1 72,72 A 36,36 0 0 1 144,72"
                  style={{ fill: "none", stroke: "#FDF8F1", strokeWidth: "1.1px", opacity: 0.16 }}
                />
                <path
                  d="M -36,36 A 36,36 0 0 1 36,36 A 36,36 0 0 1 108,36 A 36,36 0 0 1 180,36"
                  style={{ fill: "none", stroke: "#B57D49", strokeWidth: "1.1px", opacity: 0.4 }}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cmsWeave)" />
          </svg>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "11px" }}>
          <Image
            src="/assets/storybridge-mark.png"
            alt=""
            width={110}
            height={120}
            style={{ height: "40px", width: "auto", filter: "brightness(0) invert(1)", opacity: 0.92 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 600,
                fontSize: "23px",
                lineHeight: 1,
                color: "#FDF8F1",
                letterSpacing: "-0.015em",
              }}
            >
              StoryBridge
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "9.5px",
                lineHeight: 1,
                color: "#B57D49",
                letterSpacing: "0.18em",
              }}
            >
              CONTENT DESK
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "520px",
          }}
        >
          <div style={{ height: "5px", width: "180px", background: "#B57D49" }} />
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "52px",
              lineHeight: "1.06",
              letterSpacing: "-0.022em",
              color: "#FDF8F1",
            }}
          >
            The desk behind the site.
          </div>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontSize: "19px",
              lineHeight: "1.65",
              color: "rgba(253,248,241,0.74)",
              textWrap: "pretty",
            }}
          >
            Pages and sections, the Journal, The Bridge, and every message that comes through the contact form
            — edited and published from one place, in three languages.
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            gap: "36px",
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(253,248,241,0.5)",
          }}
        >
          <div>Tunis · Tunisia</div>
          <div>AR · FR · EN</div>
        </div>
      </div>

      {/* Right — form */}
      <div
        style={{
          background: "#FDF8F1",
          padding: "56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => signInWithEmailAndPassword(getFirebase().auth, email, pass));
          }}
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "26px",
            animation: "cms-rise .5s cubic-bezier(.2,.7,.2,1) both",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "11px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#8F6135",
              }}
            >
              Staff access
            </div>
            <h1
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 600,
                fontSize: "36px",
                lineHeight: "1.1",
                color: "#002D62",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Sign in
            </h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#3E4650" }}>Work email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#3E4650",
                }}
              >
                Password
                <button
                  type="button"
                  onClick={() => {
                    if (!email) {
                      setError("Enter your work email first, then choose Forgot.");
                      return;
                    }
                    void run(async () => {
                      await sendPasswordResetEmail(getFirebase().auth, email);
                      setNotice(`If ${email} has an account, a reset link is on its way.`);
                    });
                  }}
                  style={{
                    color: "#8F6135",
                    fontWeight: 500,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: 0,
                  }}
                >
                  Forgot?
                </button>
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                style={{ ...inputStyle, letterSpacing: "0.12em" }}
              />
            </label>
          </div>

          {error && (
            <div role="alert" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#A5342E", fontWeight: 500 }}>
              {error}
            </div>
          )}
          {notice && (
            <div role="status" style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#2F6B4F", fontWeight: 500 }}>
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            data-hover="background:#001838;box-shadow:0 2px 10px rgba(0,24,56,0.2)"
            style={{
              background: "#002D62",
              color: "#FDF8F1",
              border: "none",
              borderRadius: "4px",
              padding: "15px",
              fontWeight: 600,
              fontSize: "15px",
              textAlign: "center",
              cursor: "pointer",
              opacity: pending ? 0.65 : 1,
              transition: "all .16s ease",
            }}
          >
            {pending ? "Signing in…" : "Continue"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E6E0D8" }} />
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "10.5px",
                letterSpacing: "0.14em",
                color: "#A8A29A",
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: "1px", background: "#E6E0D8" }} />
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={() => void run(() => signInWithPopup(getFirebase().auth, googleProvider))}
            data-hover="background:#F8F1E8"
            style={{
              border: "1.5px solid #B57D49",
              color: "#8F6135",
              background: "none",
              borderRadius: "4px",
              padding: "13.5px",
              fontWeight: 600,
              fontSize: "14.5px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>

          <div
            style={{
              borderTop: "1px solid #E6E0D8",
              paddingTop: "18px",
              fontSize: "12.5px",
              lineHeight: "1.7",
              color: "#8A8378",
            }}
          >
            Access is limited to StoryBridge staff and named contributors. Every sign-in is logged.
            {!configured && (
              <>
                {" "}
                <span style={{ color: "#A5342E", fontWeight: 500 }}>
                  Firebase config is missing in this build, so sign-in will not complete yet.
                </span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
