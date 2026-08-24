"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Brief form from the board's Contact page.
 *
 * The board only flips a `sent` flag. There is no endpoint yet — routing,
 * spam checks and the CMS inbox are roadmap Phase 06 — so the success state
 * must not claim the brief was delivered when nothing left the browser.
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

export function ContactForm() {
  const t = useTranslations("ContactForm");
  const [sent, setSent] = useState(false);

  if (sent) {
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
          onClick={() => setSent(false)}
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
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      style={{ display: "flex", flexDirection: "column", gap: "22px" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "22px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("name")}</span>
          <input type="text" required placeholder={t("namePlaceholder")} style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("email")}</span>
          <input type="email" required placeholder={t("emailPlaceholder")} style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("organisation")}</span>
          <input type="text" placeholder={t("organisationPlaceholder")} style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("need")}</span>
          <select style={field} defaultValue={NEEDS[0]}>
            {NEEDS.map((n) => (
              <option key={n} value={n}>
                {t(`needs.${n}`)}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("languages")}</span>
          <input type="text" placeholder={t("languagesPlaceholder")} style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>{t("deadline")}</span>
          <input type="text" placeholder={t("deadlinePlaceholder")} style={field} />
        </label>
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <span style={label}>{t("brief")}</span>
        <textarea
          rows={6}
          placeholder={t("briefPlaceholder")}
          style={{ ...field, resize: "vertical", fontFamily: "'IBM Plex Sans',sans-serif" }}
        />
      </label>

      <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="submit"
          data-hover="background:#001838;box-shadow:0 2px 8px rgba(0,24,56,0.18)"
          style={{
            background: "#002D62",
            color: "#FDF8F1",
            border: "none",
            borderRadius: "4px",
            padding: "15px 30px",
            fontWeight: 600,
            fontSize: "15px",
            cursor: "pointer",
            transition: "all .16s ease",
          }}
        >
          {t("submit")}
        </button>
        <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "#5A6472", maxWidth: "340px" }}>
          {t("reassurance")}
        </div>
      </div>
    </form>
  );
}
