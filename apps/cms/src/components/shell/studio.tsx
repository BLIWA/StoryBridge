"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { VIEW_META, type View } from "@/lib/view";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL } from "@/lib/staff";
import { ARTICLES, type Article } from "@/content/seed";
import { Dashboard } from "@/components/views/dashboard";
import { ArticlesView } from "@/components/views/articles";
import { ArticleEditor } from "@/components/views/article-editor";
import { PagesView } from "@/components/views/pages";
import { IssuesView } from "@/components/views/issues";
import { InboxView } from "@/components/views/inbox";
import { SettingsView } from "@/components/views/settings";
import { MESSAGES } from "@/content/seed";

const STATUSES = ["All", "Draft", "In review", "Scheduled", "Published"] as const;

export function Studio() {
  const { user, staff, role, can, signOut } = useAuth();
  const [view, setView] = useState<View>("dash");
  const [collapsed, setCollapsed] = useState(false);
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedLabel, setSavedLabel] = useState("All changes saved");

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
  }

  function newArticle() {
    const id = `new-${articles.length + 1}`;
    const blank: Article = {
      id,
      title: "Untitled piece",
      slug: "untitled-piece",
      lang: "EN",
      cat: "Editorial",
      author: userName,
      status: "Draft",
      date: "23 Aug 2026",
      words: 0,
      excerpt: "",
      body: "",
    };
    setArticles((prev) => [blank, ...prev]);
    setEditingId(id);
    setView("article");
    setSavedLabel("Not saved yet");
  }

  function patchDraft(patch: Partial<Article>) {
    if (!draft) return;
    setArticles((prev) => prev.map((a) => (a.id === draft.id ? { ...a, ...patch } : a)));
    setSavedLabel("Unsaved changes");
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
            padding: "0 32px",
            height: "70px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
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
              width: "280px",
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
            href="https://sotrybridge.web.app"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "13.5px", fontWeight: 600, color: "#8F6135", whiteSpace: "nowrap" }}
          >
            View site ↗
          </a>
        </div>

        <div style={{ flex: 1, padding: "30px 32px 56px", display: "flex", flexDirection: "column", gap: "26px" }}>
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
              onSaveDraft={() => setSavedLabel("Saved locally — not persisted yet")}
              onPublish={() => {
                patchDraft({ status: "Published" });
                setSavedLabel("Marked published locally — not live yet");
              }}
              onSendToReview={() => {
                patchDraft({ status: "In review" });
                setSavedLabel("Sent to review locally");
              }}
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
