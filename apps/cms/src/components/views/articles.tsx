"use client";

import { CARD, Pill, PrimaryButton } from "@/components/ui";
import { pill, type Article, type ArticleStatus } from "@/content/seed";

/** Journal list from "StoryBridge CMS.dc.html" (lines 224–251). */

/** The status filter's options, and the type Studio holds the selection in. */
export const STATUSES = ["All", "Draft", "In review", "Scheduled", "Published"] as const;
export type Filter = (typeof STATUSES)[number];

const headCell = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8A8378",
} as const;

const GRID = "minmax(0,1fr) 92px 150px 118px 108px";

export function ArticlesView({
  articles,
  filter,
  setFilter,
  openArticle,
  newArticle,
}: {
  articles: Article[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  openArticle: (id: string) => void;
  newArticle: () => void;
}) {
  const counts = Object.fromEntries(
    STATUSES.map((s) => [
      s,
      s === "All" ? articles.length : articles.filter((a) => a.status === (s as ArticleStatus)).length,
    ]),
  ) as Record<Filter, number>;

  const visible = articles.filter((a) => filter === "All" || a.status === (filter as ArticleStatus));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "cms-fade .3s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {STATUSES.map((s) => {
          const on = filter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              style={{
                background: on ? "#002D62" : "#FDF8F1",
                color: on ? "#FDF8F1" : "#3E4650",
                border: `1px solid ${on ? "#002D62" : "#D8D1C7"}`,
                borderRadius: "4px",
                padding: "9px 14px",
                fontSize: "13.5px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {s}{" "}
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "11px",
                  opacity: 0.75,
                  marginInlineStart: "4px",
                }}
              >
                {counts[s]}
              </span>
            </button>
          );
        })}
        <PrimaryButton onClick={newArticle} style={{ marginInlineStart: "auto" }}>
          New article
        </PrimaryButton>
      </div>

      {/* GRID's fixed-width columns add up to more than a phone screen — the
          rounded card clips vertically as before, but this inner scroller
          lets a narrow viewport reach the rest of the row horizontally
          instead of silently cutting it off. */}
      <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: "16px",
            padding: "14px 22px",
            borderBottom: "1px solid #E6E0D8",
            background: "#F8F4EE",
            minWidth: "620px",
          }}
        >
          <div style={headCell}>Title</div>
          <div style={headCell}>Language</div>
          <div style={headCell}>Author</div>
          <div style={headCell}>Status</div>
          <div style={headCell}>Date</div>
        </div>

        {visible.map((a, i) => {
          const c = pill(a.status);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => openArticle(a.id)}
              data-hover="background:#F8F4EE"
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: "16px",
                alignItems: "center",
                padding: "16px 22px",
                borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                background: "transparent",
                border: "none",
                width: "100%",
                minWidth: "620px",
                textAlign: "start",
                cursor: "pointer",
                transition: "background .16s ease",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 600,
                    color: "#002D62",
                    lineHeight: 1.35,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.title}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "11px",
                    color: "#8A8378",
                    marginTop: "4px",
                  }}
                >
                  /journal/{a.slug} · {a.words} words
                </div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "12px", color: "#5A6472" }}>
                {a.lang}
              </div>
              <div style={{ fontSize: "13.5px", color: "#3E4650" }}>{a.author}</div>
              <div>
                <Pill {...c}>{a.status}</Pill>
              </div>
              <div style={{ fontSize: "12.5px", color: "#5A6472" }}>{a.date}</div>
            </button>
          );
        })}

        {visible.length === 0 && (
          <div style={{ padding: "40px 22px", textAlign: "center", fontSize: "14px", color: "#8A8378" }}>
            Nothing with that status.
          </div>
        )}
        </div>
      </div>

      <div style={{ fontSize: "12.5px", color: "#8A8378" }}>
        {visible.length} of {articles.length} pieces
      </div>
    </div>
  );
}
