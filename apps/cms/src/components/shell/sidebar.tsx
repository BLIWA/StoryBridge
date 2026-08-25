"use client";

import Image from "next/image";
import type { View } from "@/lib/view";

/** Collapsible navy sidebar from "StoryBridge CMS.dc.html" (lines 102–146). */

// Every mark here is a classic printer's reference glyph in the same weight
// and register — pilcrow, section, dagger, double dagger, guillemet — so the
// row reads as one typographic family. The board's original mark for "The
// Bridge" was ✉, a pictographic envelope that sits heavier than its neighbors
// (and renders as a colour emoji in some fonts); ‡ keeps the dagger/section
// idiom instead.
const WORKSPACE = [
  { view: "dash" as const, mark: "¶", label: "Overview" },
  { view: "articles" as const, mark: "§", label: "Journal", badge: "open" as const },
  { view: "pages" as const, mark: "†", label: "Site copy" },
  { view: "issues" as const, mark: "‡", label: "The Bridge" },
  { view: "inbox" as const, mark: "«", label: "Contact", badge: "new" as const },
];

export function Sidebar({
  view,
  setView,
  collapsed,
  setCollapsed,
  openCount,
  newCount,
  userName,
  userRole,
  onSignOut,
}: {
  view: View;
  setView: (v: View) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  openCount: number;
  newCount: number;
  userName: string;
  userRole: string;
  onSignOut: () => void;
}) {
  const labelDisp = collapsed ? "none" : "flex";

  // "Journal" stays lit while editing a single article.
  const isActive = (v: View) => (v === "articles" ? view === "articles" || view === "article" : view === v);

  const itemStyle = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "10px 11px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14.5px",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    width: "100%",
    textAlign: "start" as const,
    border: "none",
    background: active ? "rgba(253,248,241,0.12)" : "transparent",
    color: active ? "#FDF8F1" : "rgba(253,248,241,0.7)",
  });

  const markStyle = {
    fontFamily: "'Source Serif 4',serif",
    fontSize: "15px",
    width: "16px",
    textAlign: "center" as const,
    color: "#B57D49",
    flex: "none",
  };

  const groupLabel = {
    display: labelDisp,
    fontFamily: "'IBM Plex Mono',monospace",
    fontSize: "9.5px",
    letterSpacing: "0.16em",
    color: "rgba(253,248,241,0.4)",
    whiteSpace: "nowrap" as const,
  };

  return (
    <div
      className="cms-sidebar"
      style={{
        width: collapsed ? "72px" : "250px",
        flex: "none",
        background: "#002D62",
        color: "#FDF8F1",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        // No alignSelf override here: the parent row is `alignItems: "stretch"`
        // (see studio.tsx) specifically so this box matches the height of the
        // content column next to it — the navy background needs to reach the
        // page's actual bottom, not just wrap its own header+nav+footer.
        // `position: sticky` still pins it to the viewport while it's taller
        // than the screen.
        transition: "width .2s cubic-bezier(.2,.7,.2,1)",
      }}
    >
      <div
        style={{
          padding: collapsed ? "22px 12px" : "22px 14px 22px 20px",
          borderBottom: "1px solid rgba(253,248,241,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: "10px",
          minHeight: "79px",
          overflow: "hidden",
        }}
      >
        {!collapsed && (
          <Image
            src="/assets/storybridge-mark.png"
            alt=""
            width={110}
            height={120}
            style={{ height: "32px", width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9, flex: "none" }}
          />
        )}
        <div style={{ display: labelDisp, flexDirection: "column", gap: "2px", minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "18px",
              lineHeight: 1,
              color: "#FDF8F1",
              whiteSpace: "nowrap",
            }}
          >
            StoryBridge
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "9px",
              lineHeight: 1,
              color: "#B57D49",
              letterSpacing: "0.16em",
              whiteSpace: "nowrap",
            }}
          >
            CONTENT DESK
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
          aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
          data-hover="background:rgba(253,248,241,0.12);color:#FDF8F1"
          style={{
            marginInlineStart: collapsed ? "0" : "auto",
            flex: "none",
            width: collapsed ? "44px" : "26px",
            height: "32px",
            borderRadius: "4px",
            border: "1px solid rgba(253,248,241,0.24)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "12px",
            color: "rgba(253,248,241,0.75)",
          }}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <nav
        style={{
          padding: "18px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
        }}
      >
        <div style={{ ...groupLabel, padding: "6px 10px 8px" }}>WORKSPACE</div>
        {WORKSPACE.map((item) => {
          const active = isActive(item.view);
          const count = item.badge === "open" ? openCount : item.badge === "new" ? newCount : null;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              title={item.label}
              style={itemStyle(active)}
            >
              <span style={markStyle}>{item.mark}</span>
              <span style={{ display: collapsed ? "none" : "inline" }}>{item.label}</span>
              {count !== null && count > 0 && (
                <span
                  style={{
                    display: collapsed ? "none" : "inline",
                    marginInlineStart: "auto",
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "10.5px",
                    background: item.badge === "new" ? "#B57D49" : "rgba(181,125,73,0.3)",
                    color: item.badge === "new" ? "#25150A" : "#EFD8BE",
                    padding: "2px 7px",
                    borderRadius: "3px",
                    fontWeight: item.badge === "new" ? 500 : 400,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ height: "1px", background: "rgba(253,248,241,0.12)", margin: "14px 10px" }} />
        <div style={{ ...groupLabel, padding: "0 10px 8px" }}>ADMINISTRATION</div>
        <button
          type="button"
          onClick={() => setView("settings")}
          title="Settings & access"
          style={itemStyle(view === "settings")}
        >
          <span style={markStyle}>⁂</span>
          <span style={{ display: collapsed ? "none" : "inline" }}>Settings &amp; access</span>
        </button>
      </nav>

      <div
        style={{
          borderTop: "1px solid rgba(253,248,241,0.14)",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: "11px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            flex: "none",
            backgroundImage: "repeating-linear-gradient(135deg,#B57D49 0 5px,#8F6135 5px 10px)",
          }}
        />
        <div style={{ display: labelDisp, flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 600,
              color: "#FDF8F1",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "9.5px",
              letterSpacing: "0.1em",
              color: "rgba(253,248,241,0.55)",
              textTransform: "uppercase",
            }}
          >
            {userRole}
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          title="Sign out"
          data-hover="color:#B57D49"
          style={{
            display: collapsed ? "none" : "inline",
            fontSize: "12px",
            color: "rgba(253,248,241,0.6)",
            cursor: "pointer",
            flex: "none",
            background: "none",
            border: "none",
          }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}
