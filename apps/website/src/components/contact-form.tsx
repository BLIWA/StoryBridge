"use client";

import { useState } from "react";

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

const NEEDS = [
  "Content & editorial",
  "Translation & localization",
  "Editing & writing",
  "Media & press",
  "Launch package",
  "Not sure yet",
] as const;

export function ContactForm() {
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
          Nothing was sent yet.
        </div>
        <div style={{ fontSize: "16px", lineHeight: "1.75", color: "#3E4650" }}>
          This form has no destination behind it — enquiry routing and the CMS inbox are still to be built, so
          your brief has not reached anyone. Until then, email{" "}
          <a href="mailto:hello@storybridge.tn" style={{ color: "#8F6135", fontWeight: 600 }}>
            hello@storybridge.tn
          </a>{" "}
          directly.
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
          Back to the form
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>Full name</span>
          <input type="text" required placeholder="Your name" style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>Work email</span>
          <input type="email" required placeholder="you@company.com" style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>Organisation</span>
          <input type="text" placeholder="Company or outlet" style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>What do you need?</span>
          <select style={field} defaultValue={NEEDS[0]}>
            {NEEDS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>Languages</span>
          <input type="text" placeholder="e.g. Arabic and French" style={field} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>Deadline</span>
          <input type="text" placeholder="dd / mm / yyyy" style={field} />
        </label>
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <span style={label}>The brief</span>
        <textarea
          rows={6}
          placeholder="What is the story, who is it for, and what would a good outcome look like?"
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
          Send the brief
        </button>
        <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "#5A6472", maxWidth: "340px" }}>
          We reply within two working days. Everything you send stays between us.
        </div>
      </div>
    </form>
  );
}
