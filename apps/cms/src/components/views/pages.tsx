"use client";

import { useState } from "react";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { PAGES, type Section } from "@/content/seed";

/** Pages & sections from "StoryBridge CMS.dc.html" (lines 326–403). */

export function PagesView() {
  const [pageKey, setPageKey] = useState(PAGES[0].key);
  const [pages, setPages] = useState(PAGES);
  const page = pages.find((p) => p.key === pageKey)!;
  const [secId, setSecId] = useState<string | null>(page.sections[0]?.id ?? null);
  const section = page.sections.find((s) => s.id === secId) ?? page.sections[0];

  function updateSection(patch: Partial<Section>) {
    setPages((prev) =>
      prev.map((p) =>
        p.key !== pageKey
          ? p
          : { ...p, sections: p.sections.map((s) => (s.id === section.id ? { ...s, ...patch } : s)) },
      ),
    );
  }

  function move(id: string, dir: -1 | 1) {
    setPages((prev) =>
      prev.map((p) => {
        if (p.key !== pageKey) return p;
        const idx = p.sections.findIndex((s) => s.id === id);
        const next = idx + dir;
        if (idx < 0 || next < 0 || next >= p.sections.length) return p;
        const sections = [...p.sections];
        [sections[idx], sections[next]] = [sections[next], sections[idx]];
        return { ...p, sections };
      }),
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[216px_minmax(0,1fr)_340px]"
      style={{
        display: "grid",
        gap: "20px",
        alignItems: "start",
        animation: "cms-fade .3s ease both",
      }}
    >
      {/* Page list */}
      <div style={{ ...CARD, padding: 0 }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #E6E0D8" }}>
          <div style={MONO_LABEL}>Site pages</div>
        </div>
        <div style={{ padding: "8px" }}>
          {pages.map((p) => {
            const on = p.key === pageKey;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setPageKey(p.key);
                  setSecId(p.sections[0]?.id ?? null);
                }}
                data-hover={on ? undefined : "background:#F1EBE3"}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "start",
                  background: on ? "#002D62" : "transparent",
                  color: on ? "#FDF8F1" : "#3E4650",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  cursor: "pointer",
                  marginBottom: "2px",
                }}
              >
                <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{p.name}</div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "10.5px",
                    opacity: 0.75,
                    marginTop: "3px",
                  }}
                >
                  {p.path} · {p.sections.length} sections
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section list */}
      <div style={{ ...CARD, padding: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "16px 20px",
            borderBottom: "1px solid #E6E0D8",
          }}
        >
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#002D62" }}>{page.name}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", color: "#8A8378", marginTop: "3px" }}>
              {page.path} · edited {page.edited}
            </div>
          </div>
          <GhostButton>Add section</GhostButton>
        </div>

        <div style={{ padding: "10px" }}>
          {page.sections.map((s, i) => {
            const on = s.id === section?.id;
            return (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0,1fr) auto auto",
                  gap: "12px",
                  alignItems: "center",
                  background: on ? "#F8F4EE" : "transparent",
                  border: `1px solid ${on ? "#DEC5A9" : "transparent"}`,
                  borderRadius: "4px",
                  padding: "12px",
                  marginBottom: "2px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <button
                    type="button"
                    onClick={() => move(s.id, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: i === 0 ? "default" : "pointer",
                      color: i === 0 ? "#D8D1C7" : "#8A8378",
                      fontSize: "10px",
                      lineHeight: 1,
                      padding: "2px",
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(s.id, 1)}
                    disabled={i === page.sections.length - 1}
                    aria-label="Move down"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: i === page.sections.length - 1 ? "default" : "pointer",
                      color: i === page.sections.length - 1 ? "#D8D1C7" : "#8A8378",
                      fontSize: "10px",
                      lineHeight: 1,
                      padding: "2px",
                    }}
                  >
                    ▼
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSecId(s.id)}
                  style={{ background: "none", border: "none", textAlign: "start", cursor: "pointer", minWidth: 0, padding: 0 }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: s.on ? "#002D62" : "#8A8378",
                      lineHeight: 1.35,
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", color: "#8A8378", marginTop: "3px" }}>
                    {s.type} · {s.edited}
                  </div>
                </button>

                <Pill {...(s.on ? { bg: "#E2EDE7", fg: "#2F6B4F" } : { bg: "#EDE9E2", fg: "#5A6472" })}>
                  {s.on ? "Live" : "Hidden"}
                </Pill>

                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={s.on}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setPages((prev) =>
                        prev.map((p) =>
                          p.key !== pageKey
                            ? p
                            : { ...p, sections: p.sections.map((x) => (x.id === s.id ? { ...x, on: checked } : x)) },
                        ),
                      );
                    }}
                    aria-label={`${s.on ? "Hide" : "Show"} ${s.name}`}
                    style={{ width: "16px", height: "16px", accentColor: "#002D62" }}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section editor */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={CARD}>
          <div style={MONO_LABEL}>Editing section</div>
          {section ? (
            <>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#002D62" }}>{section.name}</div>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Heading</span>
                <input value={section.heading} onChange={(e) => updateSection({ heading: e.target.value })} style={INPUT} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Body copy</span>
                <textarea
                  rows={5}
                  value={section.body}
                  onChange={(e) => updateSection({ body: e.target.value })}
                  style={INPUT}
                />
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={FIELD_LABEL}>Button label</span>
                  <input value={section.cta} onChange={(e) => updateSection({ cta: e.target.value })} style={INPUT} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={FIELD_LABEL}>Links to</span>
                  <input
                    value={section.href}
                    onChange={(e) => updateSection({ href: e.target.value })}
                    style={{ ...INPUT, fontFamily: "'IBM Plex Mono',monospace", fontSize: "13px" }}
                  />
                </label>
              </div>
              <PrimaryButton style={{ alignSelf: "flex-start" }}>Save section</PrimaryButton>
            </>
          ) : (
            <div style={{ fontSize: "13.5px", color: "#8A8378" }}>Pick a section to edit it.</div>
          )}
        </div>

        <NotWiredNote>
          Reordering and edits live in memory only — they do not change the deployed site yet. Pages become
          Firestore documents the website reads in roadmap Phase 05.
        </NotWiredNote>
      </div>
    </div>
  );
}
