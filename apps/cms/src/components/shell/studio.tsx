"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./sidebar";
import { VIEW_META, type View } from "@/lib/view";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL, normalizeEmail } from "@/lib/staff";
import { getFirebase } from "@/lib/firebase";
import { watchArticles, createArticle, saveArticle, newArticleId } from "@/lib/articles";
import { type Article } from "@/content/seed";
import { Dashboard } from "@/components/views/dashboard";
import { ArticlesView, type Filter } from "@/components/views/articles";
import { ArticleEditor } from "@/components/views/article-editor";
import { PagesView } from "@/components/views/pages";
import { IssuesView } from "@/components/views/issues";
import { InboxView } from "@/components/views/inbox";
import { SettingsView } from "@/components/views/settings";
import { MESSAGES } from "@/content/seed";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Matches the seed data's "12 Aug 2026" style — see content/seed.ts. */
function todayLabel(): string {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function Studio() {
  const { user, staff, role, can, signOut } = useAuth();
  const [view, setView] = useState<View>("dash");
  const [collapsed, setCollapsed] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedLabel, setSavedLabel] = useState("All changes saved");
  // Separate from `savedLabel`: the label also carries transient/error text
  // ("Publishing…", "Couldn't save…") that isn't "All changes saved" but also
  // isn't unsaved local edits worth protecting from a snapshot refresh.
  const [dirty, setDirty] = useState(false);

  // Read by the Firestore listener below without forcing it to resubscribe on
  // every keystroke (it only depends on [staff]) — see the effect for why.
  const editingIdRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Live articles from Firestore. While the open draft has unsaved local
  // edits, an incoming snapshot keeps this component's copy of *that one*
  // article rather than the server's — otherwise someone else saving a
  // different article (or this same save completing) would refresh the whole
  // list and wipe out whatever the person editing hasn't clicked "Save" on
  // yet.
  useEffect(() => {
    // Studio only ever mounts once `staff` is set (see app/page.tsx) and it
    // doesn't change without a fresh sign-in, which remounts this component —
    // so there's no "staff became null" case to handle here.
    const { db } = getFirebase();
    return watchArticles(
      db,
      (list) => {
        setArticles((prev) => {
          const openId = editingIdRef.current;
          if (!openId || !dirtyRef.current) return list;
          const openLocally = prev.find((a) => a.id === openId);
          if (!openLocally) return list;
          // A brand-new draft's create() may not have landed yet — keep it
          // even though this snapshot doesn't have it, instead of letting it
          // vanish out from under the editor.
          return list.some((a) => a.id === openId)
            ? list.map((a) => (a.id === openId ? openLocally : a))
            : [openLocally, ...list];
        });
      },
      () => setArticles([]),
    );
  }, []);

  /**
   * Role comes from the signed-in user's `staff` record, and firestore.rules
   * makes the same check — so hiding Publish from a journalist is a courtesy,
   * not the control. The board splits chief (publishes directly) from
   * journalist (sends to review), which is exactly what `can("publish")` is.
   */
  const userName = staff?.name || user?.displayName || user?.email?.split("@")[0] || "Signed in";
  const userRole = role ? ROLE_LABEL[role] : "Signed in";
  const canPublish = can("publish");

  const openCount = articles.filter((a) => a.status !== "Published").length;
  const newCount = MESSAGES.filter((m) => m.status === "New").length;

  const draft = articles.find((a) => a.id === editingId) ?? null;

  function openArticle(id: string) {
    setEditingId(id);
    setView("article");
    setSavedLabel("All changes saved");
    setDirty(false);
  }

  function newArticle() {
    const { db } = getFirebase();
    const blank: Article = {
      id: newArticleId(db),
      title: "Untitled piece",
      slug: "untitled-piece",
      lang: "EN",
      cat: "Editorial",
      author: userName,
      authorEmail: user?.email ? normalizeEmail(user.email) : "",
      status: "Draft",
      date: todayLabel(),
      words: 0,
      excerpt: "",
      body: "",
    };
    setArticles((prev) => [blank, ...prev]);
    setEditingId(blank.id);
    setView("article");
    setSavedLabel("Not saved yet");
    // `dirty`, not just the label: until this is actually saved, the live
    // Firestore listener above must not be allowed to drop this draft just
    // because its own create() hasn't landed in a snapshot yet.
    setDirty(true);
    // Optimistic: the editor opens on the blank draft immediately. If this
    // create fails (offline, denied), the next save attempt from "Save draft"
    // will fail the same way and say so — nothing here silently loses work.
    void createArticle(db, blank, blank.authorEmail ?? "").catch(() => {
      setSavedLabel("Couldn't create this draft — check your connection");
    });
  }

  function patchDraft(patch: Partial<Article>) {
    if (!draft) return;
    setArticles((prev) => prev.map((a) => (a.id === draft.id ? { ...a, ...patch } : a)));
    setSavedLabel("Unsaved changes");
    setDirty(true);
  }

  /** Writes `draft` (with `statusPatch` applied) to Firestore; used by all three editor actions. */
  async function persistDraft(statusPatch: Partial<Article>, labels: { pending: string; done: string; failed: string }) {
    if (!draft) return;
    const next = { ...draft, ...statusPatch };
    if (Object.keys(statusPatch).length) patchDraft(statusPatch);
    setSavedLabel(labels.pending);
    try {
      await saveArticle(getFirebase().db, next);
      setSavedLabel(labels.done);
      setDirty(false);
    } catch {
      setSavedLabel(labels.failed);
    }
  }

  const meta =
    view === "article"
      ? { crumb: "Journal · editing", title: draft?.title ?? "Article" }
      : VIEW_META[view];

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "stretch" }}>
      <Sidebar
        view={view}
        setView={setView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openCount={openCount}
        newCount={newCount}
        userName={userName}
        userRole={userRole}
        onSignOut={() => void signOut()}
      />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "#FDF8F1",
            borderBottom: "1px solid #D8D1C7",
            padding: "0 clamp(16px, 3vw, 32px)",
            minHeight: "70px",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px 20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "10px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#8A8378",
              }}
            >
              {meta.crumb}
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontWeight: 600,
                fontSize: "21px",
                lineHeight: 1,
                color: "#002D62",
                letterSpacing: "-0.012em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {meta.title}
            </div>
          </div>

          <input
            placeholder="Search articles, pages, messages…"
            aria-label="Search"
            style={{
              marginInlineStart: "auto",
              width: "min(280px, 40vw)",
              minWidth: 0,
              border: "1px solid #D8D1C7",
              borderRadius: "4px",
              background: "#FFFFFF",
              padding: "9px 12px",
              fontSize: "13.5px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "11px",
              color: "#5A6472",
              border: "1px solid #D8D1C7",
              borderRadius: "4px",
              padding: "8px 11px",
              background: "#FFFFFF",
            }}
          >
            LIVE
            <span
              style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#3A6B55", display: "inline-block" }}
            />
          </div>
          <a
            href="https://storybridge-eb71e.web.app"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "13.5px", fontWeight: 600, color: "#8F6135", whiteSpace: "nowrap" }}
          >
            View site ↗
          </a>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "30px clamp(16px, 3vw, 32px) 56px",
            display: "flex",
            flexDirection: "column",
            gap: "26px",
          }}
        >
          {view === "dash" && (
            <Dashboard
              articles={articles}
              openCount={openCount}
              newCount={newCount}
              setView={setView}
              openArticle={openArticle}
            />
          )}
          {view === "articles" && (
            <ArticlesView
              articles={articles}
              filter={filter}
              setFilter={setFilter}
              openArticle={openArticle}
              newArticle={newArticle}
            />
          )}
          {view === "article" && draft && (
            <ArticleEditor
              draft={draft}
              setDraft={patchDraft}
              canPublish={canPublish}
              savedLabel={savedLabel}
              onBack={() => setView("articles")}
              onSaveDraft={() =>
                void persistDraft(
                  {},
                  { pending: "Saving…", done: "All changes saved", failed: "Couldn't save — check your connection" },
                )
              }
              onPublish={() =>
                void persistDraft(
                  { status: "Published" },
                  {
                    pending: "Publishing…",
                    done: "Published — saved, but the live site doesn't read Firestore yet",
                    failed: "Couldn't publish — check your connection",
                  },
                )
              }
              onSendToReview={() =>
                void persistDraft(
                  { status: "In review" },
                  { pending: "Sending to review…", done: "Sent to review", failed: "Couldn't send to review — check your connection" },
                )
              }
            />
          )}
          {view === "pages" && <PagesView />}
          {view === "issues" && <IssuesView />}
          {view === "inbox" && <InboxView />}
          {view === "settings" && <SettingsView />}
        </div>
      </div>
    </div>
  );
}
