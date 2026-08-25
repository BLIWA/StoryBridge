"use client";

import { useEffect, useMemo, useState } from "react";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { PAGES, type Page, type Section } from "@/content/seed";
import { getFirebase } from "@/lib/firebase";
import { watchPages, savePage, type PageOverrides, type SectionOverride } from "@/lib/pages";

/** Pages & sections from "StoryBridge CMS.dc.html" (lines 326–403). */

/**
 * Combines the seed's fixed section inventory (identity: id/name/type, and
 * default copy) with whatever's actually been saved to Firestore for that
 * page (copy edits, on/off, reorder). A page nobody has touched yet reads
 * exactly like the board's original — see lib/pages.ts.
 */
function mergePageOverrides(pages: readonly Page[], overrides: PageOverrides[]): Page[] {
  const byKey = new Map(overrides.map((o) => [o.key, o]));
  return pages.map((p) => {
    const o = byKey.get(p.key);
    if (!o) return p;
    const known = new Map(p.sections.map((s) => [s.id, s]));
    // Saved order first (dropping any id the seed no longer has), then any
    // seed section the saved order doesn't mention yet (newly added to the
    // board since the last save).
    const orderedIds = [...o.order.filter((id) => known.has(id)), ...p.sections.map((s) => s.id).filter((id) => !o.order.includes(id))];
    const sections = orderedIds.map((id) => {
      const base = known.get(id)!;
      const patch = o.sections[id];
      return patch ? { ...base, ...patch } : base;
    });
    return { ...p, sections };
  });
}

export function PagesView() {
  const [overrides, setOverrides] = useState<PageOverrides[]>([]);
  const [pageKey, setPageKey] = useState(PAGES[0].key);
  const [secId, setSecId] = useState<string | null>(PAGES[0].sections[0]?.id ?? null);
  const [savedLabel, setSavedLabel] = useState("All changes saved");

  // Local-only edits to the section currently open, layered on top of the
  // merged (seed + Firestore) view until "Save section" persists them. Kept
  // as its own piece of state rather than inside `overrides` — an incoming
  // snapshot replaces `overrides` wholesale, and unlike Studio's article
  // list (one flat array holding both saved and being-edited items) that
  // replacement can never clobber this, because it isn't stored there.
  const [localPatch, setLocalPatch] = useState<Partial<SectionOverride> | null>(null);

  useEffect(() => {
    const { db } = getFirebase();
    return watchPages(
      db,
      (list) => setOverrides(list),
      () => setOverrides([]),
    );
  }, []);

  const pages = useMemo(() => mergePageOverrides(PAGES, overrides), [overrides]);
  const page = pages.find((p) => p.key === pageKey)!;
  const savedSection = page.sections.find((s) => s.id === secId) ?? page.sections[0];
  const section: Section | undefined =
    savedSection && localPatch && secId === savedSection.id ? { ...savedSection, ...localPatch } : savedSection;

  function selectPage(key: string) {
    setPageKey(key);
    const firstId = pages.find((p) => p.key === key)?.sections[0]?.id ?? null;
    setSecId(firstId);
    setLocalPatch(null);
    setSavedLabel("All changes saved");
  }

  function selectSection(id: string) {
    setSecId(id);
    setLocalPatch(null);
    setSavedLabel("All changes saved");
  }

  function editSection(patch: Partial<SectionOverride>) {
    setLocalPatch((prev) => ({ ...prev, ...patch }));
    setSavedLabel("Unsaved changes");
  }

  /** Writes the page's full current section set (patched or not) to Firestore. */
  async function persistPage(nextSections: Section[], labels: { pending: string; done: string; failed: string }) {
    setSavedLabel(labels.pending);
    try {
      const overridesOut: Record<string, SectionOverride> = {};
      for (const s of nextSections) {
        overridesOut[s.id] = { heading: s.heading, body: s.body, cta: s.cta, href: s.href, on: s.on };
      }
      await savePage(getFirebase().db, pageKey, nextSections.map((s) => s.id), overridesOut);
      setSavedLabel(labels.done);
    } catch {
      setSavedLabel(labels.failed);
    }
  }

  function saveSection() {
    if (!section || !localPatch) return;
    const nextSections = page.sections.map((s) => (s.id === section.id ? { ...s, ...localPatch } : s));
    setLocalPatch(null);
    void persistPage(nextSections, {
      pending: "Saving…",
      done: "All changes saved",
      failed: "Couldn't save — check your connection",
    });
  }

  /** Toggling visibility and reordering have no separate "unsaved" gesture — they write straight through. */
  function toggleSection(id: string, on: boolean) {
    const nextSections = page.sections.map((s) => (s.id === id ? { ...s, on } : s));
    void persistPage(nextSections, { pending: "Saving…", done: "All changes saved", failed: "Couldn't save — check your connection" });
  }

  function move(id: string, dir: -1 | 1) {
    const idx = page.sections.findIndex((s) => s.id === id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= page.sections.length) return;
    const nextSections = [...page.sections];
    [nextSections[idx], nextSections[next]] = [nextSections[next], nextSections[idx]];
    void persistPage(nextSections, { pending: "Saving…", done: "All changes saved", failed: "Couldn't save — check your connection" });
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
                onClick={() => selectPage(p.key)}
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
              {page.path} · {savedLabel}
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
                  onClick={() => selectSection(s.id)}
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
                    {s.type}
                  </div>
                </button>

                <Pill {...(s.on ? { bg: "#E2EDE7", fg: "#2F6B4F" } : { bg: "#EDE9E2", fg: "#5A6472" })}>
                  {s.on ? "Live" : "Hidden"}
                </Pill>

                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={s.on}
                    onChange={(e) => toggleSection(s.id, e.target.checked)}
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
                <input value={section.heading} onChange={(e) => editSection({ heading: e.target.value })} style={INPUT} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Body copy</span>
                <textarea
                  rows={5}
                  value={section.body}
                  onChange={(e) => editSection({ body: e.target.value })}
                  style={INPUT}
                />
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "12px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={FIELD_LABEL}>Button label</span>
                  <input value={section.cta} onChange={(e) => editSection({ cta: e.target.value })} style={INPUT} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={FIELD_LABEL}>Links to</span>
                  <input
                    value={section.href}
                    onChange={(e) => editSection({ href: e.target.value })}
                    style={{ ...INPUT, fontFamily: "'IBM Plex Mono',monospace", fontSize: "13px" }}
                  />
                </label>
              </div>
              <PrimaryButton onClick={saveSection} disabled={!localPatch} style={{ alignSelf: "flex-start" }}>
                Save section
              </PrimaryButton>
            </>
          ) : (
            <div style={{ fontSize: "13.5px", color: "#8A8378" }}>Pick a section to edit it.</div>
          )}
        </div>

        <NotWiredNote>
          Heading, body, order and visibility are real — saved to Firestore, live-synced across the CMS.
          &ldquo;Add section&rdquo; isn&rsquo;t wired: the section inventory itself is still fixed in code. The
          public website doesn&rsquo;t read this collection yet — its marketing copy still comes from its own
          translation files.
        </NotWiredNote>
      </div>
    </div>
  );
}
