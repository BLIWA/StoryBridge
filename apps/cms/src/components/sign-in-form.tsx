"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  AuthError,
} from "firebase/auth";
import { getFirebase, googleProvider } from "@/lib/firebase";

function messageFor(error: unknown): string {
  const code = (error as AuthError)?.code ?? "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return "That email and password don't match. Try again.";
  }
  if (code === "auth/user-not-found") {
    return "No StoryBridge account uses that email.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Wait a moment and try again.";
  }
  return "Couldn't sign you in. Check your connection and try again.";
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { auth } = getFirebase();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setPending(true);
    try {
      const { auth } = getFirebase();
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-sb-lg border border-hairline bg-card p-9 shadow-[var(--sb-shadow)]">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-bronze-deep">
        StoryBridge Studio
      </p>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-navy">Sign in</h1>
      <p className="mt-1 text-sm text-ink-mute">Editorial &amp; admin access only.</p>

      <form onSubmit={handleEmailSignIn} className="mt-7 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Work email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-sb border border-rule bg-cream px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-sb border border-rule bg-cream px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-navy"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-sb bg-navy py-3 text-[15px] font-semibold text-cream transition-colors hover:bg-navy-hover disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-ink-mute">
        <span className="h-px flex-1 bg-rule-soft" />
        or
        <span className="h-px flex-1 bg-rule-soft" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={pending}
        className="w-full rounded-sb border border-rule py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-narrative-light disabled:opacity-60"
      >
        Continue with Google
      </button>
    </div>
  );
}
