"use client";

import { useEffect, useMemo, useState } from "react";
import { CARD, MONO_LABEL, GhostButton, NotWiredNote } from "@/components/ui";
import { getFirebase } from "@/lib/firebase";
import { fetchNamespaceOverrides, saveNamespaceOverride, type Locale } from "@/lib/site-content";
import { watchSiteImages, SITE_IMAGE_SLOTS, type SiteImage } from "@/lib/site-images";
import { watchArticles } from "@/lib/articles";
import { watchIssues, type Issue } from "@/lib/bridge-issues";
import { publishedArticlesFor, sentIssuesFor } from "@/lib/public-content";
import type { Article } from "@/content/seed";
import { flatten, unflatten, type JSONObject, type JSONValue } from "@storybridge/content/merge";
import enDefaults from "@storybridge/content/messages/en.json";
import frDefaults from "@storybridge/content/messages/fr.json";
import arDefaults from "@storybridge/content/messages/ar.json";
import { PAGES, ALL_NAMESPACES, OTHER_NAMESPACES } from "./page-registry";
import { ChipBar, MORE_ID } from "./chip-bar";
import { PreviewToolbar } from "./preview-toolbar";
import { LivePreview } from "./live-preview";
import { FieldsEditor } from "./fields-editor";
import { SiteImageCard } from "../site-image-card";
import { useUnsavedGuard, LeaveConfirmDialog } from "./unsaved-guard";
import { SaveChangesDialog, type ChangeEntry } from "./save-changes-dialog";

/**
 * The live, page-by-page editor: a chip bar picks a page (page-registry.ts),
 * a second toolbar picks the preview language and (for the pages that have
 * one — see live-preview.tsx) toggles edit mode, and below that is either
 * the real page rendered live (LivePreview) or, for everything not migrated
 * yet, the original flat field list (FieldsEditor) — both wrapped in the
 * same save/leave-guard here.
 *
 * Every string in the catalog is still addressed by one flat path
 * ("Home.hero.titleLead", now namespace-prefixed since edits span whatever
 * pages/namespaces got touched this session, not just one) — see
 * @storybridge/content/merge for flatten/unflatten and how a path becomes a
 * Firestore write.
 */

const DEFAULTS: Record<Locale, JSONObject> = {
  en: enDefaults as JSONObject,
  fr: frDefaults as JSONObject,
  ar: arDefaults as JSONObject,
};

const LOCALE_NAME: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية" };

// Kept for studio.tsx's header search ("Site copy" results group) — same
// name/shape it already imports, so that integration point didn't need to
// change. FeaturedPost stays out — see page-registry.ts's DEAD_NAMESPACES.
export const NAMESPACES = ALL_NAMESPACES.filter((n) => n !== "FeaturedPost");

function pageIdForNamespace(namespace: string | undefined): string {
  if (!namespace) return PAGES[0].id;
  const page = PAGES.find((p) => p.namespaces.includes(namespace));
  if (page) return page.id;
  return OTHER_NAMESPACES.includes(namespace) ? MORE_ID : PAGES[0].id;
}

type PendingLeave = { kind: "locale"; next: Locale } | { kind: "away" };

export function SiteContentView({
  initialNamespace,
  onDirtyChange,
}: {
  initialNamespace?: string;
  onDirtyChange?: (dirty: boolean) => void;
} = {}) {
  const [pageId, setPageId] = useState(() => pageIdForNamespace(initialNamespace));
  const [locale, setLocale] = useState<Locale>("en");
  const [editing, setEditing] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);

  const [overridesByNs, setOverridesByNs] = useState<Record<string, Partial<Record<Locale, JSONValue>>>>({});
  const [overridesLoaded, setOverridesLoaded] = useState(false);
  const [images, setImages] = useState<Record<string, SiteImage>>({});
  const [articles, setArticles] = useState<Article[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savedLabel, setSavedLabel] = useState("All changes saved");
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<PendingLeave | null>(null);

  useEffect(() => {
    let cancelled = false;
    const { db } = getFirebase();
    Promise.all(ALL_NAMESPACES.map((ns) => fetchNamespaceOverrides(db, ns).then((o) => [ns, o] as const))).then(
      (pairs) => {
        if (cancelled) return;
        setOverridesByNs(Object.fromEntries(pairs));
        setOverridesLoaded(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const { db } = getFirebase();
    return watchSiteImages(
      db,
      (items) => setImages(items),
      () => setImages({}),
    );
  }, []);

  // Feeds the Journal/Newsletter chips' live preview — see
  // ./live-preview.tsx and lib/public-content.ts. A second, independent
  // subscription from Studio's own (unlifted) Articles/Issues state, same
  // trade-off as this view's other self-contained subscriptions above.
  useEffect(() => {
    const { db } = getFirebase();
    return watchArticles(db, setArticles, () => setArticles([]));
  }, []);

  useEffect(() => {
    const { db } = getFirebase();
    return watchIssues(db, setIssues, () => setIssues([]));
  }, []);

  const journalArticles = useMemo(() => publishedArticlesFor(articles, locale), [articles, locale]);
  const newsletterIssues = useMemo(() => sentIssuesFor(issues, articles, locale), [issues, articles, locale]);

  const defaultFlat = useMemo(() => flatten(DEFAULTS[locale]), [locale]);
  const overrideFlat = useMemo(() => {
    const combined: JSONObject = {};
    for (const ns of ALL_NAMESPACES) {
      const v = overridesByNs[ns]?.[locale];
      if (v !== undefined) combined[ns] = v;
    }
    return flatten(combined);
  }, [overridesByNs, locale]);
  const allPaths = useMemo(() => Object.keys(defaultFlat), [defaultFlat]);

  function baseline(path: string): string {
    return overrideFlat[path] ?? defaultFlat[path] ?? "";
  }

  const changedPaths = useMemo(
    () => Object.keys(edits).filter((p) => edits[p] !== baseline(p)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edits, overrideFlat, defaultFlat],
  );
  const dirty = changedPaths.length > 0;

  useUnsavedGuard(dirty);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const effectiveFlat = useMemo(() => ({ ...defaultFlat, ...overrideFlat, ...edits }), [defaultFlat, overrideFlat, edits]);
  const messages = useMemo(() => unflatten(effectiveFlat) as JSONObject, [effectiveFlat]);

  function editPath(path: string, value: string) {
    setEdits((prev) => ({ ...prev, [path]: value }));
    setSavedLabel("Unsaved changes");
  }

  function discardEdits() {
    setEdits({});
    setSavedLabel("All changes saved");
  }

  function requestLocale(next: Locale) {
    if (next === locale) return;
    if (dirty) {
      setPendingLeave({ kind: "locale", next });
      return;
    }
    setLocale(next);
  }

  function confirmLeave() {
    const p = pendingLeave;
    setPendingLeave(null);
    discardEdits();
    if (p?.kind === "locale") setLocale(p.next);
  }

  const changes: ChangeEntry[] = useMemo(
    () => changedPaths.map((p) => ({ path: p, from: baseline(p), to: edits[p] })).sort((a, b) => a.path.localeCompare(b.path)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [changedPaths, edits],
  );

  async function confirmSave() {
    setSaving(true);
    try {
      const { db } = getFirebase();
      const byNs = new Map<string, Record<string, string>>();
      for (const p of changedPaths) {
        const ns = p.split(".")[0];
        const rest = p.slice(ns.length + 1);
        if (!byNs.has(ns)) byNs.set(ns, {});
        byNs.get(ns)![rest] = edits[p];
      }
      // Carry forward this namespace's other already-overridden paths — a
      // Firestore write here replaces the whole locale's override object,
      // so anything from a previous session not touched this time would
      // otherwise be silently dropped.
      for (const [ns, changedRest] of byNs) {
        for (const p of allPaths) {
          if (!p.startsWith(`${ns}.`)) continue;
          const rest = p.slice(ns.length + 1);
          if (rest in changedRest) continue;
          const existing = overrideFlat[p];
          if (existing !== undefined && existing !== defaultFlat[p]) changedRest[rest] = existing;
        }
      }
      for (const [ns, obj] of byNs) {
        await saveNamespaceOverride(db, ns, locale, unflatten(obj));
      }
      setOverridesByNs((prev) => {
        const next = { ...prev };
        for (const [ns, obj] of byNs) {
          next[ns] = { ...(next[ns] ?? {}), [locale]: unflatten(obj) };
        }
        return next;
      });
      setEdits((prev) => {
        const next = { ...prev };
        for (const p of changedPaths) delete next[p];
        return next;
      });
      setSavedLabel("All changes saved");
      setShowSaveDialog(false);
    } catch {
      setSavedLabel("Couldn't save — check your connection");
    } finally {
      setSaving(false);
    }
  }

  const activePage = pageId === MORE_ID ? null : PAGES.find((p) => p.id === pageId);
  const activeNamespaces = pageId === MORE_ID ? OTHER_NAMESPACES : (activePage?.namespaces ?? []);
  const fieldPaths = useMemo(
    () => allPaths.filter((p) => activeNamespaces.includes(p.split(".")[0])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allPaths, pageId],
  );
  const imageSlots = SITE_IMAGE_SLOTS.filter((s) => activeNamespaces.includes(s.namespace));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "cms-fade .3s ease both" }}>
      <ChipBar selected={pageId} onSelect={setPageId} />

      <PreviewToolbar
        locale={locale}
        onLocale={requestLocale}
        editing={editing}
        onEditing={setEditing}
        savedLabel={savedLabel}
        dirty={dirty}
        onSave={() => setShowSaveDialog(true)}
        hasLivePreview={Boolean(activePage?.live)}
      />

      {!overridesLoaded ? (
        <div style={{ ...CARD, padding: "32px", textAlign: "center", fontSize: "13.5px", color: "#8A8378" }}>Loading…</div>
      ) : activePage?.live ? (
        <>
          <LivePreview
            kind={activePage.live}
            locale={locale}
            messages={messages}
            editing={editing}
            onChange={editPath}
            imageSlots={imageSlots}
            images={images}
            articles={journalArticles}
            issues={newsletterIssues}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <GhostButton onClick={() => setShowAllFields((v) => !v)}>
              {showAllFields ? "Hide" : "Show"} every field on this page as a plain list
            </GhostButton>
            {showAllFields && (
              <FieldsEditor
                paths={fieldPaths}
                locale={locale}
                defaultFlat={defaultFlat}
                effectiveFlat={effectiveFlat}
                onChange={editPath}
              />
            )}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {imageSlots.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={MONO_LABEL}>Images — same across EN/FR/AR</div>
              {imageSlots.map((slot) => (
                <SiteImageCard key={slot.id} slot={slot} image={images[slot.id]} />
              ))}
            </div>
          )}
          <FieldsEditor
            paths={fieldPaths}
            locale={locale}
            defaultFlat={defaultFlat}
            effectiveFlat={effectiveFlat}
            onChange={editPath}
          />
        </div>
      )}

      <NotWiredNote>
        Real, saved to Firestore, and read by the website at build time — but only at build time. A save doesn&apos;t
        change the live site until the next deploy. Fields left untouched keep reading the default copy from the
        catalog; &ldquo;Reset to default&rdquo; reverts a field rather than re-copying the default text over it.
      </NotWiredNote>

      {showSaveDialog && (
        <SaveChangesDialog
          changes={changes}
          localeName={LOCALE_NAME[locale]}
          pending={saving}
          onConfirm={() => void confirmSave()}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}

      {pendingLeave && (
        <LeaveConfirmDialog
          summary={`${changes.length} field${changes.length === 1 ? "" : "s"} changed and not yet saved. Switching language now throws that away.`}
          onDiscard={confirmLeave}
          onKeepEditing={() => setPendingLeave(null)}
        />
      )}
    </div>
  );
}
