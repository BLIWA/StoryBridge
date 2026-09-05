"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "./sidebar";
import { VIEW_META, type View } from "@/lib/view";
import { useAuth } from "@/lib/auth-context";
import { useIdleSignOut } from "@/lib/idle-signout";
import { ROLE_LABEL, normalizeEmail } from "@/lib/staff";
import { getFirebase } from "@/lib/firebase";
import { watchArticles, createArticle, saveArticle, deleteArticle, newArticleId } from "@/lib/articles";
import { watchSubmissions } from "@/lib/submissions";
import { type Article, type Message } from "@/content/seed";
import { Dashboard } from "@/components/views/dashboard";
import { ArticlesView, type Filter } from "@/components/views/articles";
import { ArticleEditor } from "@/components/views/article-editor";
import { SiteContentView, NAMESPACES } from "@/components/views/site-content";
import { IssuesView } from "@/components/views/issues";
import { InboxView } from "@/components/views/inbox";
import { SettingsView } from "@/components/views/settings";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Matches the seed data's "12 Aug 2026" style — see content/seed.ts. */
function todayLabel(): string {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function Studio() {
  const { user, staff, role, can, signOut } = useAuth();
  const { warning: idleWarning, stayActive } = useIdleSignOut(() => void signOut());
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
  // SiteContentView's own dirty flag, mirrored up here (same idea as
  // `dirty` above, for the article editor) so leaving Site copy for another
  // part of Studio while it has unsaved field edits gets the same warning
  // SiteContentView itself shows for switching preview language — that one
  // it can show a rich dialog for; this cross-view case is a plain confirm.
  const [pagesDirty, setPagesDirty] = useState(false);

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

  // Just the count for the sidebar badge — InboxView runs its own copy of
  // this subscription for the actual list, same as watchArticles's split
  // between here and ArticleEditor's staff-roster watch.
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    const { db } = getFirebase();
    return watchSubmissions(
      db,
      (list) => setMessages(list),
      () => setMessages([]),
    );
  }, []);

  // Header search — across whatever this component already has loaded
  // (articles, messages) or knows the shape of (site copy's namespace
  // list), rather than a separate index. Cheap enough client-side at this
  // scale that a real search backend isn't worth building yet.
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  // Force SiteContentView/InboxView to remount on the namespace/message a
  // search result points at — both keep that selection in local state with
  // no setter prop, so a `key` change is what makes a second search inside
  // the same view actually jump, not just the first.
  const [pagesKey, setPagesKey] = useState(0);
  const [pendingNamespace, setPendingNamespace] = useState<string | undefined>(undefined);
  const [inboxKey, setInboxKey] = useState(0);
  const [pendingMessageId, setPendingMessageId] = useState<string | undefined>(undefined);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { articles: [], messages: [], namespaces: [] };
    return {
      articles: articles
        .filter((a) => [a.title, a.slug, a.excerpt, a.author].some((f) => f?.toLowerCase().includes(q)))
        .slice(0, 5),
      messages: messages
        .filter((m) => [m.name, m.subject, m.org, m.body].some((f) => f?.toLowerCase().includes(q)))
        .slice(0, 5),
      namespaces: NAMESPACES.filter((n) => n.toLowerCase().includes(q)).slice(0, 5),
    };
  }, [searchQuery, articles, messages]);

  const hasSearchResults =
    searchResults.articles.length > 0 || searchResults.messages.length > 0 || searchResults.namespaces.length > 0;

  // Site copy's own remount-on-jump trick (see pagesKey below) would wipe an
  // in-progress edit just as surely as switching to a different view would —
  // so every jump that isn't just staying put on the same page-copy edit
  // checks here first, same guard either way.
  function confirmLeavePagesIfDirty(): boolean {
    if (view === "pages" && pagesDirty) {
      return window.confirm("You have unsaved site-copy changes. Leave without saving?");
    }
    return true;
  }

  function goToNamespace(namespace: string) {
    if (!confirmLeavePagesIfDirty()) return;
    setPendingNamespace(namespace);
    setPagesKey((k) => k + 1);
    setView("pages");
    setSearchQuery("");
    setSearchFocused(false);
  }

  function goToMessage(id: string) {
    if (!confirmLeavePagesIfDirty()) return;
    setPendingMessageId(id);
    setInboxKey((k) => k + 1);
    setView("inbox");
    setSearchQuery("");
    setSearchFocused(false);
  }

  function goToSearchedArticle(id: string) {
    if (!confirmLeavePagesIfDirty()) return;
    // openArticle is declared further down in this component — a function
    // declaration, so it's hoisted and already callable by the time a click
    // actually invokes this (function declarations in the same scope are
    // fully set up before any statement runs, unlike a `const` arrow fn).
    openArticle(id);
    setSearchQuery("");
    setSearchFocused(false);
  }

  /**
   * Role comes from the signed-in user's `staff` record, and firestore.rules
   * makes the same check — so hiding Publish from a journalist is a courtesy,
   * not the control. The board splits chief (publishes directly) from
   * journalist (sends to review), which is exactly what `can("publish")` is.
   */
  const userName = staff?.name || user?.displayName || user?.email?.split("@")[0] || "Signed in";
  const userRole = role ? ROLE_LABEL[role] : "Signed in";
  const canPublish = can("publish");
  // Mirrors firestore.rules' `canEditAnyDraft()` — the same roles that rule
  // lets touch anyone's draft are the only ones its `allow delete` accepts.
  const canDelete = can("editAnyDraft");

  // "Open" work still headed toward publication — an Archived piece is
  // retired, not outstanding, so it doesn't belong in this count either.
  const openCount = articles.filter((a) => a.status !== "Published" && a.status !== "Archived").length;
  const newCount = messages.filter((m) => m.status === "New").length;

  const draft = articles.find((a) => a.id === editingId) ?? null;

  function openArticle(id: string) {
    if (!confirmLeavePagesIfDirty()) return;
    setEditingId(id);
    setView("article");
    setSavedLabel("All changes saved");
    setDirty(false);
  }

  function newArticle() {
    if (!confirmLeavePagesIfDirty()) return;
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

  /**
   * Writes `draft` (with `statusPatch` applied) to Firestore; used by Save
   * draft, Publish now, Send to review, Archive and Republish alike — they
   * differ only in what `status` the caller has already patched on.
   */
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

  /**
   * Deletes an article outright — offered in the list (a stray/test draft)
   * and in the editor (leaving back to the list once it's gone). Optimistic,
   * same spirit as newArticle(): the row disappears immediately, and if the
   * write is actually denied (not staff, or trying to delete a Published
   * piece — see firestore.rules) the live listener's next snapshot brings it
   * right back, which is as much of a "failed" signal as this needs.
   */
  function onDeleteArticle(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setView("articles");
    }
    void deleteArticle(getFirebase().db, id);
  }

  const meta =
    view === "article"
      ? { crumb: "Journal · editing", title: draft?.title ?? "Article" }
      : VIEW_META[view];

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "stretch" }}>
      <Sidebar
        view={view}
        setView={(next) => {
          if (confirmLeavePagesIfDirty()) setView(next);
        }}
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

          <div style={{ position: "relative", marginInlineStart: "auto", width: "min(280px, 40vw)", minWidth: 0 }}>
            <input
              placeholder="Search articles, pages, messages…"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                border: "1px solid #D8D1C7",
                borderRadius: "4px",
                background: "#FFFFFF",
                padding: "9px 12px",
                fontSize: "13.5px",
              }}
            />
            {searchFocused && searchQuery.trim() && (
              <div
                style={{
                  position: "absolute",
                  insetInlineStart: 0,
                  insetInlineEnd: 0,
                  top: "calc(100% + 6px)",
                  zIndex: 30,
                  background: "#FFFFFF",
                  border: "1px solid #D8D1C7",
                  borderRadius: "6px",
                  boxShadow: "0 8px 24px rgba(0,24,56,0.12)",
                  maxHeight: "min(420px, 70vh)",
                  overflowY: "auto",
                  padding: "8px",
                }}
              >
                {!hasSearchResults && (
                  <div style={{ padding: "10px 8px", fontSize: "12.5px", color: "#8A8378" }}>Nothing matches.</div>
                )}
                {searchResults.articles.length > 0 && (
                  <SearchGroup label="Journal">
                    {searchResults.articles.map((a) => (
                      <SearchResultButton key={a.id} onMouseDown={() => goToSearchedArticle(a.id)} title={a.title} subtitle={`${a.status} · ${a.author}`} />
                    ))}
                  </SearchGroup>
                )}
                {searchResults.namespaces.length > 0 && (
                  <SearchGroup label="Site copy">
                    {searchResults.namespaces.map((n) => (
                      <SearchResultButton key={n} onMouseDown={() => goToNamespace(n)} title={n} subtitle="Namespace" />
                    ))}
                  </SearchGroup>
                )}
                {searchResults.messages.length > 0 && (
                  <SearchGroup label="Contact">
                    {searchResults.messages.map((m) => (
                      <SearchResultButton
                        key={m.id}
                        onMouseDown={() => goToMessage(m.id)}
                        title={m.name}
                        subtitle={`${m.subject} · ${m.status}`}
                      />
                    ))}
                  </SearchGroup>
                )}
              </div>
            )}
          </div>
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
            href="https://storybridge.news"
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
              goToMessage={goToMessage}
            />
          )}
          {view === "articles" && (
            <ArticlesView
              articles={articles}
              filter={filter}
              setFilter={setFilter}
              openArticle={openArticle}
              newArticle={newArticle}
              canDelete={canDelete}
              onDelete={onDeleteArticle}
            />
          )}
          {view === "article" && draft && (
            <ArticleEditor
              draft={draft}
              setDraft={patchDraft}
              canPublish={canPublish}
              canDelete={canDelete}
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
                    done: "Published — it appears on the live site after the next deploy",
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
              onArchive={() =>
                void persistDraft(
                  { status: "Archived" },
                  {
                    pending: "Archiving…",
                    done: "Archived — it comes off the live site after the next deploy",
                    failed: "Couldn't archive — check your connection",
                  },
                )
              }
              onRepublish={() =>
                void persistDraft(
                  { status: "Published" },
                  {
                    pending: "Republishing…",
                    done: "Republished — it's back on the live site after the next deploy",
                    failed: "Couldn't republish — check your connection",
                  },
                )
              }
              onDelete={() => onDeleteArticle(draft.id)}
            />
          )}
          {view === "pages" && (
            <SiteContentView key={pagesKey} initialNamespace={pendingNamespace} onDirtyChange={setPagesDirty} />
          )}
          {view === "issues" && <IssuesView articles={articles} />}
          {view === "inbox" && <InboxView key={inboxKey} initialSelectedId={pendingMessageId} />}
          {view === "settings" && <SettingsView />}
        </div>
      </div>

      {idleWarning && (
        <div
          role="alertdialog"
          aria-label="You're about to be signed out"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,24,56,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#FDF8F1",
              border: "1px solid #D8D1C7",
              borderRadius: "8px",
              padding: "26px 28px",
              maxWidth: "360px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "19px", fontWeight: 600, color: "#002D62" }}>
              Still there?
            </div>
            <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#3E4650" }}>
              You&rsquo;ve been idle a while — Studio signs out inactive sessions after 12 hours. You&rsquo;ll be
              signed out in a minute unless you stay.
            </div>
            <button
              type="button"
              onClick={stayActive}
              style={{
                alignSelf: "flex-start",
                marginTop: "4px",
                background: "#002D62",
                color: "#FDF8F1",
                border: "none",
                borderRadius: "4px",
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Stay signed in
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "6px" }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: "9.5px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#8A8378",
          padding: "6px 8px 4px",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

/**
 * Uses onMouseDown rather than onClick — the input's onBlur (which closes
 * this dropdown) fires before a click would land, so a click never actually
 * reaches these buttons. mousedown fires first, while the dropdown is still
 * mounted.
 */
function SearchResultButton({ title, subtitle, onMouseDown }: { title: string; subtitle: string; onMouseDown: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      data-hover="background:#F8F4EE"
      style={{
        display: "block",
        width: "100%",
        textAlign: "start",
        background: "none",
        border: "none",
        borderRadius: "4px",
        padding: "8px",
        cursor: "pointer",
        transition: "background .12s ease",
      }}
    >
      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#002D62", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {title}
      </div>
      <div style={{ fontSize: "11.5px", color: "#8A8378", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {subtitle}
      </div>
    </button>
  );
}
