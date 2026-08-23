"use client";

import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { pill, type Article } from "@/content/seed";

/** Article editor from "StoryBridge CMS.dc.html" (lines 252–325). */

const toolbarBtn = {
  background: "#FDF8F1",
  border: "1px solid #E6E0D8",
  borderRadius: "3px",
  padding: "6px 10px",
  fontSize: "12.5px",
  color: "#3E4650",
  cursor: "pointer",
  minWidth: "32px",
} as const;

export function ArticleEditor({
  draft,
  setDraft,
  canPublish,
  onBack,
  savedLabel,
  onSaveDraft,
  onPublish,
  onSendToReview,
}: {
  draft: Article;
  setDraft: (patch: Partial<Article>) => void;
  canPublish: boolean;
  onBack: () => void;
  savedLabel: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSendToReview: () => void;
}) {
  const words = draft.body.split(/\s+/).filter(Boolean).length;
  const p = pill(draft.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "cms-fade .3s ease both" }}>
      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11.5px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8F6135",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          ← All articles
        </button>
        <div style={{ fontSize: "12.5px", color: "#8A8378", marginInlineStart: "12px" }}>{savedLabel}</div>
        <div style={{ display: "flex", gap: "10px", marginInlineStart: "auto", flexWrap: "wrap" }}>
          <GhostButton onClick={onSaveDraft}>Save draft</GhostButton>
          <GhostButton>Preview</GhostButton>
          {canPublish ? (
            <PrimaryButton onClick={onPublish}>Publish now</PrimaryButton>
          ) : (
            <PrimaryButton onClick={onSendToReview} style={{ background: "#8F6135" }}>
              Send to review
            </PrimaryButton>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "20px", alignItems: "start" }}>
        {/* Main column */}
        <div style={{ ...CARD, gap: "20px" }}>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ title: e.target.value })}
            placeholder="Headline"
            aria-label="Headline"
            style={{
              border: "none",
              background: "transparent",
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "32px",
              lineHeight: 1.15,
              color: "#002D62",
              letterSpacing: "-0.018em",
              padding: 0,
              width: "100%",
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={FIELD_LABEL}>Slug</span>
              <input
                value={draft.slug}
                onChange={(e) => setDraft({ slug: e.target.value })}
                style={{ ...INPUT, fontFamily: "'IBM Plex Mono',monospace", fontSize: "13px" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={FIELD_LABEL}>Section</span>
              <input value={draft.cat} onChange={(e) => setDraft({ cat: e.target.value })} style={INPUT} />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={FIELD_LABEL}>Standfirst</span>
            <textarea
              rows={2}
              value={draft.excerpt}
              onChange={(e) => setDraft({ excerpt: e.target.value })}
              style={INPUT}
            />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={FIELD_LABEL}>Body</span>
              <div style={{ flex: 1, height: "1px", background: "#E6E0D8" }} />
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#8A8378" }}>
                {words} words
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                alignItems: "center",
                border: "1px solid #E6E0D8",
                borderBottom: "none",
                borderRadius: "4px 4px 0 0",
                padding: "8px",
                background: "#F8F4EE",
              }}
            >
              {["B", "I", "H2", "“ ”", "link", "image"].map((t) => (
                <button key={t} type="button" data-hover="background:#E8E3DD" style={toolbarBtn}>
                  {t}
                </button>
              ))}
              <span
                style={{
                  marginInlineStart: "auto",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "11px",
                  color: "#8A8378",
                }}
              >
                AR / FR / EN
              </span>
            </div>
            <textarea
              rows={16}
              value={draft.body}
              onChange={(e) => setDraft({ body: e.target.value })}
              aria-label="Body"
              style={{
                ...INPUT,
                borderRadius: "0 0 4px 4px",
                fontFamily: "'Source Serif 4',serif",
                fontSize: "16px",
                lineHeight: 1.75,
                padding: "16px",
              }}
            />
            <NotWiredNote>
              Plain-text field. The board shows a rich-text toolbar; wiring it (and the media library) is
              roadmap Phase 05.
            </NotWiredNote>
          </div>

          <div
            style={{
              border: "1px dashed #D8D1C7",
              borderRadius: "6px",
              padding: "24px",
              textAlign: "center",
              background: "#F8F4EE",
            }}
          >
            <div style={{ ...MONO_LABEL, marginBottom: "6px" }}>Lead image</div>
            <div style={{ fontSize: "13px", color: "#8A8378" }}>Drop a file or pick from the media library</div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={CARD}>
            <div style={MONO_LABEL}>Publishing</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13.5px" }}>
              <span style={{ color: "#5A6472" }}>Status</span>
              <Pill {...p}>{draft.status}</Pill>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
              <span style={{ color: "#5A6472" }}>Author</span>
              <span style={{ color: "#002D62", fontWeight: 500 }}>{draft.author}</span>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={FIELD_LABEL}>Publish date</span>
              <input value={draft.date} onChange={(e) => setDraft({ date: e.target.value })} style={INPUT} />
            </label>
            <div style={{ fontSize: "12.5px", lineHeight: 1.65, color: "#8A8378" }}>
              {canPublish
                ? "You can publish directly to the live site."
                : "Publishing goes through review — an editor-in-chief signs off."}
            </div>
          </div>

          <div style={CARD}>
            <div style={MONO_LABEL}>Language versions</div>
            {[
              { code: "EN", state: "This version", cta: "—" },
              { code: "FR", state: "Not started", cta: "Create" },
              { code: "AR", state: "Not started", cta: "Create" },
            ].map((l, i) => (
              <div
                key={l.code}
                style={{
                  display: "grid",
                  gridTemplateColumns: "34px 1fr auto",
                  gap: "10px",
                  alignItems: "center",
                  paddingTop: i === 0 ? 0 : "10px",
                  borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                  marginTop: i === 0 ? 0 : "2px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "11.5px",
                    color: "#002D62",
                    fontWeight: 500,
                  }}
                >
                  {l.code}
                </div>
                <div style={{ fontSize: "13px", color: "#5A6472" }}>{l.state}</div>
                <div style={{ fontSize: "12.5px", color: "#8F6135", fontWeight: 600 }}>{l.cta}</div>
              </div>
            ))}
          </div>

          <div style={CARD}>
            <div style={MONO_LABEL}>Placement</div>
            {[
              { label: "Feature on the Journal index", def: true },
              { label: "Show in the home page teaser", def: true },
              { label: "Include in the next Bridge issue", def: false },
            ].map((c) => (
              <label
                key={c.label}
                style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px", color: "#3E4650" }}
              >
                <input type="checkbox" defaultChecked={c.def} style={{ width: "16px", height: "16px", accentColor: "#002D62" }} />
                {c.label}
              </label>
            ))}
          </div>

          <div style={CARD}>
            <div style={MONO_LABEL}>Search appearance</div>
            <div
              style={{
                fontFamily: "'Source Serif 4',serif",
                fontSize: "16px",
                color: "#002D62",
                lineHeight: 1.3,
              }}
            >
              {draft.title}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#2F6B4F" }}>
              storybridge.tn/journal/{draft.slug}
            </div>
            <div style={{ fontSize: "12.5px", lineHeight: 1.6, color: "#5A6472" }}>
              {draft.excerpt || "Add a standfirst to control the search snippet."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
