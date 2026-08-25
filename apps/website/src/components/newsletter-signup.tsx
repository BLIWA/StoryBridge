"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { subscribe } from "@/lib/subscribers";

/**
 * "The Bridge" signup, from the board's navy CTA block.
 *
 * Submits straight to Firestore (see lib/subscribers.ts) — the address is
 * genuinely saved now, which it never was before. What's still missing:
 * nothing is actually sent to anyone. Delivery is Cloud Functions + a
 * transactional email provider in roadmap Phase 06, blocked on Blaze.
 */
export function NewsletterSignup({ source = "Website" }: { source?: string }) {
  const t = useTranslations("NewsletterSignup");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        try {
          await subscribe(email, { lang: locale, source });
          setStatus("done");
        } catch {
          setStatus("error");
        }
      }}
      style={{ display: "flex", flexDirection: "column", gap: "14px" }}
    >
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("ariaLabel")}
          style={{
            flex: "1 1 200px",
            // Without this an input refuses to shrink past its intrinsic size,
            // which is what pushed the button off a 360px screen.
            minWidth: 0,
            border: "1.5px solid rgba(253,248,241,0.24)",
            borderRadius: "2px",
            padding: "14px 15px",
            fontSize: "15px",
            color: "#FDF8F1",
            background: "#072448",
          }}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          data-hover="background:#C99D74"
          style={{
            background: "#B57D49",
            color: "#001838",
            border: "none",
            borderRadius: "4px",
            padding: "14px 26px",
            fontWeight: 600,
            fontSize: "15px",
            cursor: status === "sending" ? "default" : "pointer",
            opacity: status === "sending" ? 0.7 : 1,
            whiteSpace: "nowrap",
            transition: "all .16s ease",
          }}
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
      </div>
      {status === "done" && (
        <div role="status" style={{ fontSize: "14px", color: "#B57D49", fontWeight: 500 }}>
          {t("done")}
        </div>
      )}
      {status === "error" && (
        <div role="alert" style={{ fontSize: "14px", color: "#E39A93", fontWeight: 500 }}>
          {t("error")}
        </div>
      )}
      <div style={{ fontSize: "13px", lineHeight: "1.6", color: "rgba(253,248,241,0.55)" }}>
        {t("blurb")}{" "}
        <Link href="/newsletter" style={{ color: "#B57D49", fontWeight: 500 }}>
          {t("pastIssues")}
        </Link>
      </div>
    </form>
  );
}
