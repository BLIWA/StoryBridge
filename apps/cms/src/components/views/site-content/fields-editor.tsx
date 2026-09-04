"use client";

import { useState } from "react";
import { CARD } from "@/components/ui";
import type { Locale } from "@/lib/site-content";

/**
 * The original flat field list, lightly extracted rather than rewritten —
 * still the whole editing surface for any page that hasn't gotten a live
 * preview yet (see live-preview.tsx), and for the "More" chip's leftover
 * namespaces. `paths` are full dotted paths already prefixed by namespace
 * (e.g. "HowWeWork.intro.title") — see the site-content orchestrator for how
 * they're computed from the catalog.
 */
export function FieldsEditor({
  paths,
  locale,
  defaultFlat,
  effectiveFlat,
  onChange,
}: {
  paths: string[];
  locale: Locale;
  defaultFlat: Record<string, string>;
  effectiveFlat: Record<string, string>;
  onChange: (path: string, value: string) => void;
}) {
  const [search, setSearch] = useState("");

  const shown = paths
    .filter(
      (p) =>
        !search ||
        p.toLowerCase().includes(search.toLowerCase()) ||
        (defaultFlat[p] ?? "").toLowerCase().includes(search.toLowerCase()),
    )
    .sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter fields…"
        aria-label="Filter fields"
        style={{
          border: "1px solid #D8D1C7",
          borderRadius: "4px",
          padding: "9px 12px",
          fontSize: "13.5px",
        }}
      />
      <div style={{ ...CARD, padding: 0 }}>
        {shown.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", fontSize: "13.5px", color: "#8A8378" }}>
            Nothing matches &ldquo;{search}&rdquo;.
          </div>
        ) : (
          shown.map((path, i) => {
            const value = effectiveFlat[path] ?? "";
            const isDefault = value === defaultFlat[path];
            const long = (defaultFlat[path] ?? "").length > 60;
            return (
              <div
                key={path}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "14px 18px",
                  borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#8F6135" }}>
                    {path}
                  </span>
                  {!isDefault && (
                    <>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: "10px",
                          color: "#2F6B4F",
                          border: "1px solid #2F6B4F",
                          borderRadius: "999px",
                          padding: "1px 7px",
                        }}
                      >
                        edited
                      </span>
                      <button
                        type="button"
                        onClick={() => onChange(path, defaultFlat[path])}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11.5px", color: "#8A8378", padding: 0 }}
                      >
                        Reset to default
                      </button>
                    </>
                  )}
                </div>
                {long ? (
                  <textarea
                    value={value}
                    onChange={(e) => onChange(path, e.target.value)}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    rows={3}
                    style={{
                      border: "1px solid #D8D1C7",
                      borderRadius: "4px",
                      padding: "10px 12px",
                      fontSize: "14px",
                      fontFamily: "'IBM Plex Sans',sans-serif",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(e) => onChange(path, e.target.value)}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    style={{
                      border: "1px solid #D8D1C7",
                      borderRadius: "4px",
                      padding: "9px 12px",
                      fontSize: "14px",
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
