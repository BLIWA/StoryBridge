"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitEnquiry } from "@/lib/submissions";

/**
 * Brief form from the board's Contact page.
 *
 * Submits straight to Firestore (see lib/submissions.ts) — there is still no
 * Cloud Function behind it, so nobody is notified automatically and no email
 * goes out. Enquiry routing and outbound mail are roadmap Phase 06, blocked
 * on Blaze. What's real now: the brief is saved and visible in the CMS
 * inbox, which it never was before.
 */

const label = { fontSize: "13px", fontWeight: 500, color: "#3E4650" } as const;

const field = {
  border: "1px solid #D8D1C7",
  borderRadius: "4px",
  padding: "13px 14px",
  fontSize: "15px",
  color: "#111111",
  background: "#FFFFFF",
  width: "100%",
} as const;

/** Ids only — the visible options are translated. */
const NEEDS = ["editorial", "translation", "editing", "media", "launch", "unsure"] as const;

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const t = useTranslations("ContactForm");
  const [status, setStatus] = useState<Status>("idle");

  if (status === "sent") {
    return (
      <div
        style={{
          border: "1px solid #D8D1C7",
          borderRadius: "8px",
          background: "#FDF8F1",
          padding: "44px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontFamily: "'Source Serif 4',serif",
            fontSize: "30px",
            fontWeight: 600,
            color: "#002D62",
            lineHeight: "1.2",
          }}
        >
          {t("sentTitle")}
        </div>
        <div style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650" }}>
          {t.rich("sentBody", {
            mail: (chunks) => (
              <a href="mailto:hello@storybridge.tn" style={{ color: "#8F6135", fontWeight: 600 }}>
                {chunks}
              </a>
            ),
          })}
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          style={{
            marginTop: "8px",
            alignSelf: "flex-start",
            background: "none",
            border: "1.5px solid #B57D49",
            borderRadius: "4px",
            color: "#8F6135",
            padding: "11px 20px",
            fontWeight: 600,
            fontSize: "14.5px",
            cursor: "pointer",
          }}
        >
          {t("backToForm")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setStatus("sending");
        try {
          await submitEnquiry({
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            organisation: String(data.get("organisation") ?? ""),
            need: String(data.get("need") ?? NEEDS[0]),
            languages: String(data.get("languages") ?? ""),
            deadline: String(data.get("deadline") ?? ""),
            brief: String(data.get("brief") ?? ""),
            honeypot: String(data.get("company_website") ?? ""),
          });
          setStatus("sent");
        } catch {
          setStatus("error");
        }
      }}
      style={{ display: "flex", flexDirection: "column", gap: "22px" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "22px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("name")}</span>
          <input name="name" type="text" required placeholder={t("namePlaceholder")} style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("email")}</span>
          <input name="email" type="email" required placeholder={t("emailPlaceholder")} style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("organisation")}</span>
          <input name="organisation" type="text" placeholder={t("organisationPlaceholder")} style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("need")}</span>
          <select name="need" style={field} defaultValue={NEEDS[0]}>
            {NEEDS.map((n) => (
              <option key={n} value={n}>
                {t(`needs.${n}`)}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("languages")}</span>
          <input name="languages" type="text" placeholder={t("languagesPlaceholder")} style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("deadline")}</span>
          <input name="deadline" type="text" placeholder={t("deadlinePlaceholder")} style={field} />
        </label>
      </div>

      {/* Honeypot: off-screen, never shown to a real visitor, no label a screen reader announces. A filled-in
          value means whatever submitted this wasn't a person — see lib/submissions.ts. */}
      <input
        name="company_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }}
      />

      <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <span style={label}>{t("brief")}</span>
        <textarea
          name="brief"
          required
          rows={6}
          placeholder={t("briefPlaceholder")}
          style={{ ...field, resize: "vertical", fontFamily: "'IBM Plex Sans',sans-serif" }}
        />
      </label>

      <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={status === "sending"}
          data-hover="background:#001838;box-shadow:0 2px 8px rgba(0,24,56,0.18)"
          style={{
            background: "#002D62",
            color: "#FDF8F1",
            border: "none",
            borderRadius: "4px",
            padding: "15px 30px",
            fontWeight: 600,
            fontSize: "15px",
            cursor: status === "sending" ? "default" : "pointer",
            opacity: status === "sending" ? 0.7 : 1,
            transition: "all .16s ease",
          }}
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
        <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "#5A6472", maxWidth: "340px" }}>
          {t("reassurance")}
        </div>
      </div>

      {status === "error" && (
        <div role="alert" style={{ fontSize: "14px", color: "#A5342E" }}>
          {t("error")}
        </div>
      )}
    </form>
  );
}
