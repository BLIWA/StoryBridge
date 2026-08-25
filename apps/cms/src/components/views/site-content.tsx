"use client";

import { useEffect, useMemo, useState } from "react";
import { CARD, MONO_LABEL, PrimaryButton, NotWiredNote } from "@/components/ui";
import { getFirebase } from "@/lib/firebase";
import { fetchNamespaceOverrides, saveNamespaceOverride, type Locale } from "@/lib/site-content";
import { watchSiteImages, SITE_IMAGE_SLOTS, type SiteImage } from "@/lib/site-images";
import { SiteImageCard } from "./site-image-card";
import { flatten, unflatten, type JSONObject } from "@storybridge/content/merge";
import enDefaults from "@storybridge/content/messages/en.json";
import frDefaults from "@storybridge/content/messages/fr.json";
import arDefaults from "@storybridge/content/messages/ar.json";

/**
 * The live editor for what the website actually reads — see
 * packages/content/src/merge.ts for the mechanism. Every string in the
 * catalog is flattened to a path ("Home.hero.titleLead") and shown as a
 * plain editable field; there's no bespoke layout per page, because
 * building one for each of the site's ~10 very differently-shaped pages
 * isn't tractable, and this covers all of them uniformly instead. Search
 * narrows a namespace's field list; nothing here previews layout.
 */

const DEFAULTS: Record<Locale, JSONObject> = {
  en: enDefaults as JSONObject,
  fr: frDefaults as JSONObject,
  ar: arDefaults as JSONObject,
};

const LOCALES: readonly Locale[] = ["en", "fr", "ar"];
const LOCALE_NAME: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية" };

// Superseded by real Firestore articles — see apps/website/src/content/journal.ts.
// Editing their old placeholder strings here would touch nothing live.
const EXCLUDED_NAMESPACES = new Set(["JournalPosts", "FeaturedPost"]);

export const NAMESPACES = Object.keys(enDefaults).filter((k) => !EXCLUDED_NAMESPACES.has(k));

export function SiteContentView({ initialNamespace }: { initialNamespace?: string } = {}) {
  const [namespace, setNamespace] = useState(initialNamespace ?? NAMESPACES[0]);
  const [locale, setLocale] = useState<Locale>("en");
  const [search, setSearch] = useState("");
  const [overrides, setOverrides] = useState<Partial<Record<Locale, unknown>>>({});
  // Which namespace `overrides` actually reflects — lets `loaded` be derived
  // instead of a second flag flipped from inside the effect.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savedLabel, setSavedLabel] = useState("All changes saved");
  const [images, setImages] = useState<Record<string, SiteImage>>({});

  // One subscription for the whole view, not per-namespace: there are only
  // a handful of image slots total, and unlike the text overrides below,
  // an image isn't scoped to a language — a card just needs to know if a
  // slot has been set at all.
  useEffect(() => {
    const { db } = getFirebase();
    return watchSiteImages(
      db,
      (items) => setImages(items),
      () => setImages({}),
    );
  }, []);

  const imageSlots = SITE_IMAGE_SLOTS.filter((s) => s.namespace === namespace);

  useEffect(() => {
    let cancelled = false;
    const { db } = getFirebase();
    fetchNamespaceOverrides(db, namespace).then((o) => {
      if (cancelled) return;
      setOverrides(o);
      setLoadedFor(namespace);
    });
    return () => {
      cancelled = true;
    };
  }, [namespace]);

  const loaded = loadedFor === namespace;

  const defaultFlat = useMemo(() => flatten(DEFAULTS[locale][namespace] ?? {}), [locale, namespace]);
  const overrideFlat = useMemo(
    () => flatten((overrides[locale] as JSONObject | undefined) ?? {}),
    [overrides, locale],
  );

  // Reset the local draft when namespace/language/load-state changes — not
  // in an effect (that would set state one render late); adjusted during
  // render instead, same pattern as the article editor's own tab reset.
  const resetKey = `${namespace}:${locale}:${loaded}`;
  const [editsFor, setEditsFor] = useState(resetKey);
  if (editsFor !== resetKey) {
    setEditsFor(resetKey);
    const next: Record<string, string> = {};
    for (const path of Object.keys(defaultFlat)) next[path] = overrideFlat[path] ?? defaultFlat[path];
    setEdits(next);
    setSavedLabel("All changes saved");
  }

  const paths = useMemo(
    () =>
      Object.keys(defaultFlat)
        .filter((p) => !search || p.toLowerCase().includes(search.toLowerCase()) || defaultFlat[p].toLowerCase().includes(search.toLowerCase()))
        .sort(),
    [defaultFlat, search],
  );

  function editPath(path: string, value: string) {
    setEdits((prev) => ({ ...prev, [path]: value }));
    setSavedLabel("Unsaved changes");
  }

  async function save() {
    setSavedLabel("Saving…");
    try {
      const { db } = getFirebase();
      const changed: Record<string, string> = {};
      for (const path of Object.keys(defaultFlat)) {
        if (edits[path] !== undefined && edits[path] !== defaultFlat[path]) changed[path] = edits[path];
      }
      const nextOverride = unflatten(changed);
      await saveNamespaceOverride(db, namespace, locale, nextOverride);
      setOverrides((prev) => ({ ...prev, [locale]: nextOverride }));
      setSavedLabel("All changes saved");
    } catch {
      setSavedLabel("Couldn't save — check your connection");
    }
  }

  const dirty = savedLabel === "Unsaved changes";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "cms-fade .3s ease both" }}>
      <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)]" style={{ gap: "20px", alignItems: "start" }}>
        {/* Namespace list */}
        <div style={{ ...CARD, padding: 0 }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #E6E0D8" }}>
            <div style={MONO_LABEL}>Page / section</div>
          </div>
          <div style={{ padding: "8px", maxHeight: "560px", overflowY: "auto" }}>
            {NAMESPACES.map((ns) => {
              const on = ns === namespace;
              return (
                <button
                  key={ns}
                  type="button"
                  onClick={() => setNamespace(ns)}
                  data-hover={on ? undefined : "background:#F1EBE3"}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "start",
                    background: on ? "#002D62" : "transparent",
                    color: on ? "#FDF8F1" : "#3E4650",
                    border: "none",
                    borderRadius: "4px",
                    padding: "9px 12px",
                    fontSize: "13.5px",
                    fontWeight: on ? 600 : 500,
                    cursor: "pointer",
                    marginBottom: "2px",
                  }}
                >
                  {ns}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {imageSlots.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={MONO_LABEL}>Images — same across EN/FR/AR</div>
              {imageSlots.map((slot) => (
                <SiteImageCard key={slot.id} slot={slot} image={images[slot.id]} />
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
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
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter fields…"
              aria-label="Filter fields"
              style={{
                flex: "1 1 200px",
                minWidth: 0,
                border: "1px solid #D8D1C7",
                borderRadius: "4px",
                padding: "9px 12px",
                fontSize: "13.5px",
              }}
            />
            <div style={{ fontSize: "12.5px", color: "#8A8378" }}>{savedLabel}</div>
            <PrimaryButton onClick={() => void save()} disabled={!dirty}>
              Save {LOCALE_NAME[locale]}
            </PrimaryButton>
          </div>

          <div style={{ ...CARD, padding: 0 }}>
            {!loaded ? (
              <div style={{ padding: "32px", textAlign: "center", fontSize: "13.5px", color: "#8A8378" }}>Loading…</div>
            ) : paths.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", fontSize: "13.5px", color: "#8A8378" }}>
                Nothing matches &ldquo;{search}&rdquo;.
              </div>
            ) : (
              paths.map((path, i) => {
                const value = edits[path] ?? "";
                const isDefault = value === defaultFlat[path];
                const long = defaultFlat[path].length > 60;
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
                            onClick={() => editPath(path, defaultFlat[path])}
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
                        onChange={(e) => editPath(path, e.target.value)}
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
                        onChange={(e) => editPath(path, e.target.value)}
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
      </div>

      <NotWiredNote>
        Real, saved to Firestore, and read by the website at build time — but only at build time. A save (or an
        image upload) here doesn&apos;t change the live site until the next deploy. Fields left untouched keep
        reading the default copy from the catalog; &ldquo;Reset to default&rdquo; deletes the override rather than
        re-copying the default text. Images are shared across EN/FR/AR — there&apos;s one office photo, not three.
      </NotWiredNote>
    </div>
  );
}
