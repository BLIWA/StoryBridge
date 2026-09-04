"use client";

import { PrimaryButton } from "@/components/ui";
import type { Locale } from "@/lib/site-content";

const LOCALES: readonly Locale[] = ["en", "fr", "ar"];
const LOCALE_NAME: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية" };

/**
 * The second top bar the user asked for, once a page is selected: language
 * switch + the edit-mode toggle + save status/action. Sits directly above
 * the preview (or, for a page that hasn't gotten a live preview yet, above
 * the fallback field list — same controls either way).
 */
export function PreviewToolbar({
  locale,
  onLocale,
  editing,
  onEditing,
  savedLabel,
  dirty,
  onSave,
  hasLivePreview,
}: {
  locale: Locale;
  onLocale: (l: Locale) => void;
  editing: boolean;
  onEditing: (v: boolean) => void;
  savedLabel: string;
  dirty: boolean;
  onSave: () => void;
  hasLivePreview: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onLocale(l)}
            style={{
              padding: "8px 14px",
              borderRadius: "4px",
              border: `1px solid ${l === locale ? "#002D62" : "#D8D1C7"}`,
              background: l === locale ? "#002D62" : "#FDF8F1",
              color: l === locale ? "#FDF8F1" : "#3E4650",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {hasLivePreview && (
        <button
          type="button"
          onClick={() => onEditing(!editing)}
          aria-pressed={editing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "4px",
            border: `1px solid ${editing ? "#B57D49" : "#D8D1C7"}`,
            background: editing ? "#F8F1E8" : "#FDF8F1",
            color: editing ? "#8F6135" : "#3E4650",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              background: editing ? "#B57D49" : "#D8D1C7",
              display: "inline-block",
            }}
          />
          {editing ? "Editing — click text or images to change them" : "Edit mode off"}
        </button>
      )}

      <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ fontSize: "12.5px", color: "#8A8378" }}>{savedLabel}</div>
        <PrimaryButton onClick={onSave} disabled={!dirty}>
          Save {LOCALE_NAME[locale]}
        </PrimaryButton>
      </div>
    </div>
  );
}
