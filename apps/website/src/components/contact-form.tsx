"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { submitEnquiry } from "@/lib/submissions";
import { fetchContactFormSettings, DEFAULT_CONTACT_FORM_SETTINGS, type ContactFormSettings } from "@/lib/contact-form-settings";

/**
 * Brief form from the board's Contact page.
 *
 * Goes through submitContact() (see lib/submissions.ts) — a Cloud Function
 * that verifies a reCAPTCHA v3 token before writing anything and, once
 * written, emails the desk via Resend. Real spam protection, real routing.
 *
 * reCAPTCHA site key registered at google.com/recaptcha/admin as of 3 Sep
 * 2026 (NEXT_PUBLIC_RECAPTCHA_SITE_KEY, .env.production) — the script below
 * loads and every submission now carries a real token, verified server-side
 * in submitContact() (functions/src/recaptcha.ts). If that env var is ever
 * unset again, the script just doesn't load and verification skips itself
 * rather than blocking every enquiry.
 */
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

async function getCaptchaToken(): Promise<string | undefined> {
  if (!RECAPTCHA_SITE_KEY || typeof window === "undefined" || !window.grecaptcha) return undefined;
  try {
    await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve));
    return await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action: "contact" });
  } catch {
    // A missing/failed token isn't fatal here — submitContact() treats "no
    // token" as "verification unavailable," same as the key not being
    // configured at all. It never silently waves a real bot through: that
    // gate is the score check on the server, not whether a token exists.
    return undefined;
  }
}

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
  // Real config from settings/contactForm (see lib/contact-form-settings.ts)
  // — which of the optional fields are required, whether the honeypot is
  // on, and the consent line below. Starts at the same defaults the config
  // doc itself defaults to, so there's nothing to flash once the fetch
  // resolves for anyone who hasn't changed them from the CMS.
  const [formSettings, setFormSettings] = useState<ContactFormSettings>(DEFAULT_CONTACT_FORM_SETTINGS);
  useEffect(() => {
    let cancelled = false;
    fetchContactFormSettings().then((s) => {
      if (!cancelled) setFormSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
              <a href="mailto:contact@storybridge.news" style={{ color: "#8F6135", fontWeight: 600 }}>
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
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} strategy="afterInteractive" />
      )}
      <form
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setStatus("sending");
        try {
          const captchaToken = await getCaptchaToken();
          await submitEnquiry({
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            organisation: String(data.get("organisation") ?? ""),
            need: String(data.get("need") ?? NEEDS[0]),
            languages: String(data.get("languages") ?? ""),
            deadline: String(data.get("deadline") ?? ""),
            brief: String(data.get("brief") ?? ""),
            honeypot: String(data.get("company_website") ?? ""),
            captchaToken,
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
          <span style={label}>
            {t("organisation")}
            {formSettings.fields.organisation ? " *" : ""}
          </span>
          <input
            name="organisation"
            type="text"
            required={formSettings.fields.organisation}
            placeholder={t("organisationPlaceholder")}
            style={field}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>
            {t("need")}
            {formSettings.fields.need ? " *" : ""}
          </span>
          <select name="need" required={formSettings.fields.need} style={field} defaultValue={NEEDS[0]}>
            {NEEDS.map((n) => (
              <option key={n} value={n}>
                {t(`needs.${n}`)}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>
            {t("languages")}
            {formSettings.fields.languages ? " *" : ""}
          </span>
          <input
            name="languages"
            type="text"
            required={formSettings.fields.languages}
            placeholder={t("languagesPlaceholder")}
            style={field}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={label}>
            {t("deadline")}
            {formSettings.fields.deadline ? " *" : ""}
          </span>
          <input
            name="deadline"
            type="text"
            required={formSettings.fields.deadline}
            placeholder={t("deadlinePlaceholder")}
            style={field}
          />
        </label>
      </div>

      {/* Honeypot: off-screen, never shown to a real visitor, no label a screen reader announces. A filled-in
          value means whatever submitted this wasn't a person — see lib/submissions.ts. Real toggle now
          (settings/contactForm's "Honeypot" checkbox in the CMS) — when it's off, submitContact() skips the
          check server-side too, so there's no point still rendering (and possibly tripping a form-filling
          extension on) a field nothing reads. */}
      {formSettings.honeypotEnabled && (
        <input
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }}
        />
      )}

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

      {/* Real now — settings/contactForm's "Consent line before submit" (CMS Inbox → Contact form fields).
          Plain trust copy, not a checkbox: nothing here changes what the form does, same as the board's
          original design. Falls back to the same line that used to be hardcoded until a save changes it. */}
      {formSettings.consentLine && (
        <div style={{ fontSize: "12.5px", lineHeight: 1.6, color: "#8A8378" }}>{formSettings.consentLine}</div>
      )}

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

      {RECAPTCHA_SITE_KEY && (
        <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#8A8378" }}>
          {t.rich("captchaNotice", {
            privacy: (chunks) => (
              <Link href="/privacy" style={{ color: "#8F6135" }}>
                {chunks}
              </Link>
            ),
            terms: (chunks) => (
              <Link href="/terms" style={{ color: "#8F6135" }}>
                {chunks}
              </Link>
            ),
          })}
        </div>
      )}
      </form>
    </>
  );
}
