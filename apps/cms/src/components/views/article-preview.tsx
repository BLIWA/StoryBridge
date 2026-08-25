"use client";

import { QuoteMark, MediaImage } from "@/components/ui";
import { parseBody, tokenizeInline } from "@/lib/body-format";
import type { LangContent, Article } from "@/content/seed";

/**
 * What "Preview" opens. Renders the current tab's draft the way the Journal
 * template will — same type scale, same pull-quote treatment — using the
 * plain-text body's `## ` / `> ` / `![]()` convention (see lib/body-format.ts).
 * It is a read of editor state, not the live site: nothing here is fetched,
 * so it works before the article is ever saved anywhere.
 */
export function ArticlePreview({
  content,
  author,
  coAuthors,
  leadImage,
  onClose,
}: {
  content: LangContent;
  author: string;
  coAuthors: string[];
  leadImage: Article["leadImage"];
  onClose: () => void;
}) {
  const byline = [author, ...coAuthors].filter(Boolean).join(", ");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Article preview"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,24,56,0.5)",
        display: "flex",
        justifyContent: "center",
        padding: "clamp(16px,4vw,56px) 16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          height: "fit-content",
          background: "#FFFFFF",
          border: "1px solid #E6E0D8",
          borderRadius: "8px",
          boxShadow: "0 18px 50px rgba(0,24,56,0.28)",
          animation: "cms-rise .28s cubic-bezier(.2,.7,.2,1) both",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "14px 22px",
            borderBottom: "1px solid #E6E0D8",
            background: "#F8F4EE",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "10.5px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#8F6135",
            }}
          >
            Preview — not the live site
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: 1,
              color: "#5A6472",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        <article style={{ padding: "36px clamp(20px,4vw,48px) 48px", display: "flex", flexDirection: "column", gap: "22px" }}>
          <h1
            style={{
              fontFamily: "'Source Serif 4',serif",
              fontWeight: 600,
              fontSize: "clamp(26px,4.2vw,40px)",
              lineHeight: 1.1,
              letterSpacing: "-0.018em",
              color: "#002D62",
              margin: 0,
            }}
          >
            {content.title || "Untitled piece"}
          </h1>

          {content.excerpt && (
            <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "19px", lineHeight: 1.55, color: "#3E4650", margin: 0 }}>
              {content.excerpt}
            </p>
          )}

          {byline && (
            <div style={{ fontSize: "13.5px", color: "#8A8378", borderBlock: "1px solid #EDE7DE", padding: "12px 0" }}>
              By <span style={{ color: "#002D62", fontWeight: 600 }}>{byline}</span>
            </div>
          )}

          {leadImage?.url && (
            <figure style={{ margin: 0 }}>
              {/* Arbitrary Storage URL — MediaImage's plain <img>, not next/image, avoids a remotePatterns config change for one editor-only preview. */}
              <MediaImage src={leadImage.url} alt={leadImage.alt} style={{ borderRadius: "6px" }} />
              {leadImage.credit && (
                <figcaption
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "11px",
                    color: "#8A8378",
                    marginTop: "8px",
                  }}
                >
                  {leadImage.credit}
                </figcaption>
              )}
            </figure>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {parseBody(content.body).map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", fontWeight: 600, color: "#002D62", margin: 0 }}
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "pullquote") {
                return (
                  <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", borderInlineStart: "2px solid #B57D49", paddingInlineStart: "20px" }}>
                    <QuoteMark size={40} />
                    <div style={{ fontFamily: "'Source Serif 4',serif", fontStyle: "italic", fontWeight: 600, fontSize: "20px", lineHeight: 1.45, color: "#002D62" }}>
                      {block.text}
                    </div>
                  </div>
                );
              }
              if (block.type === "image") {
                return (
                  <figure key={i} style={{ margin: 0 }}>
                    <MediaImage src={block.url} alt={block.alt} style={{ borderRadius: "6px" }} />
                    {block.credit && (
                      <figcaption style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#8A8378", marginTop: "8px" }}>
                        {block.credit}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              return (
                <p key={i} style={{ fontFamily: "'Source Serif 4',serif", fontSize: "17px", lineHeight: 1.75, color: "#111111", margin: 0 }}>
                  {tokenizeInline(block.text).map((tok, j) =>
                    tok.href ? (
                      <a key={j} href={tok.href} style={{ color: "#8F6135" }}>
                        {tok.text}
                      </a>
                    ) : tok.bold ? (
                      <strong key={j}>{tok.text}</strong>
                    ) : tok.italic ? (
                      <em key={j}>{tok.text}</em>
                    ) : (
                      <span key={j}>{tok.text}</span>
                    ),
                  )}
                </p>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
