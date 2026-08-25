"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * A trust signal, not a consent gate — see CookiePage for why. Plausible
 * (components/chrome/analytics.tsx) runs either way; this only ever
 * controls whether the notice about it is still showing.
 *
 * Dismissal lives in localStorage, not a cookie — fitting, on a page whose
 * whole point is that this site doesn't need one for this. Read via
 * useSyncExternalStore rather than an effect + setState, same reasoning as
 * the clock in apps/cms/src/components/views/issues.tsx: the server has no
 * localStorage, so the server snapshot and the first client read have to be
 * allowed to differ without either one being "wrong."
 */
const STORAGE_KEY = "sb-cookie-notice-dismissed";
const listeners = new Set<() => void>();
let cache: boolean | null = null;

function getSnapshot(): boolean {
  if (cache === null) {
    try {
      cache = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Private browsing or similar can make localStorage throw. Treating
      // that as "already dismissed" means a visitor who can't persist the
      // choice sees the notice once per session rather than not at all —
      // safer default than assuming consent-adjacent state we can't store.
      cache = true;
    }
  }
  return cache;
}

const getServerSnapshot = () => true;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function dismiss() {
  cache = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Same as above — a re-shown notice next visit isn't worth surfacing an error over.
  }
  listeners.forEach((l) => l());
}

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (dismissed) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        insetInlineStart: "16px",
        insetInlineEnd: "16px",
        bottom: "16px",
        zIndex: 40,
        maxWidth: "640px",
        marginInline: "auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "14px",
        background: "#002D62",
        color: "#FDF8F1",
        border: "1px solid rgba(253,248,241,0.18)",
        borderRadius: "8px",
        padding: "16px 18px",
        boxShadow: "0 10px 30px rgba(0,24,56,0.25)",
      }}
    >
      <div style={{ fontSize: "13.5px", lineHeight: 1.6, flex: "1 1 260px" }}>
        {t.rich("message", {
          cookies: (chunks) => (
            <Link href="/cookies" style={{ color: "#B57D49", fontWeight: 600 }}>
              {chunks}
            </Link>
          ),
        })}
      </div>
      <button
        type="button"
        onClick={dismiss}
        style={{
          flex: "none",
          background: "#B57D49",
          color: "#001838",
          border: "none",
          borderRadius: "4px",
          padding: "10px 18px",
          fontWeight: 600,
          fontSize: "13.5px",
          cursor: "pointer",
        }}
      >
        {t("dismiss")}
      </button>
    </div>
  );
}
