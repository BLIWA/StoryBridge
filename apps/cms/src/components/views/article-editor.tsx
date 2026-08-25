"use client";

import { useEffect, useRef, useState } from "react";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote, QuoteMark, MediaImage } from "@/components/ui";
import { pill, type Article } from "@/content/seed";
import { ALL_LANGS, LANG_NAME, langContentOf, langStarted, langPatch, primaryLangOf } from "@/lib/languages";
import { bodyOps, type Selection } from "@/lib/body-format";
import { uploadMedia, recordMediaMeta, describeUploadError, type MediaItem } from "@/lib/media";
import { watchStaff, type StaffMember } from "@/lib/staff";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { ArticlePreview } from "@/components/views/article-preview";
import { PublishConfirmDialog } from "@/components/views/publish-confirm-dialog";
import { MediaPicker } from "@/components/views/media-picker";

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
  display: "flex",
  alignItems: "center",
  gap: "6px",
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
  const { user } = useAuth();
  const primaryLang = primaryLangOf(draft.lang);
  const [activeLang, setActiveLang] = useState(primaryLang);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [picker, setPicker] = useState<"lead" | "toolbar" | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const leadImageInput = useRef<HTMLInputElement>(null);
  const toolbarImageInput = useRef<HTMLInputElement>(null);

  // The editor switched to a different article — land back on its primary tab.
  // Adjusted during render rather than in an effect (React's own pattern for
  // "reset state when a prop changes"): an effect would set state one render
  // late, showing the previous article's tab for a frame.
  const [tabbedFor, setTabbedFor] = useState(draft.id);
  if (draft.id !== tabbedFor) {
    setTabbedFor(draft.id);
    setActiveLang(primaryLang);
  }

  useEffect(() => {
    const { db } = getFirebase();
    return watchStaff(
      db,
      (members) => setStaff(members),
      () => setStaff([]),
    );
  }, []);

  const content = langContentOf(draft, activeLang);
  const words = content.body.split(/\s+/).filter(Boolean).length;
  const p = pill(draft.status);

  function patchContent(fieldPatch: Partial<typeof content>) {
    setDraft(langPatch(draft, activeLang, fieldPatch));
  }

  function currentSelection(): Selection {
    const el = bodyRef.current;
    if (!el) return { start: content.body.length, end: content.body.length };
    return { start: el.selectionStart, end: el.selectionEnd };
  }

  function applyBodyEdit(edit: { text: string; sel: Selection }) {
    patchContent({ body: edit.text });
    // The textarea is a controlled input — its DOM selection only exists after
    // the new value has actually painted, so the re-select waits a tick.
    requestAnimationFrame(() => {
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(edit.sel.start, edit.sel.end);
    });
  }

  async function insertImageFromFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const media = await uploadMedia(file);
      const alt = window.prompt("Alt text (describes the image for screen readers and search):", "") ?? "";
      const credit = window.prompt("Credit (shown under the image, e.g. “Photo: Jane Doe”):", "") ?? "";
      void recordMediaMeta(media, { alt, credit, uploadedBy: user?.email ?? "" });
      applyBodyEdit(bodyOps.image(content.body, currentSelection(), media.url, alt, credit));
    } catch (err) {
      setUploadError(describeUploadError(err));
    } finally {
      setUploading(false);
    }
  }

  async function setLeadImageFromFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const media = await uploadMedia(file);
      void recordMediaMeta(media, { alt: "", credit: "", uploadedBy: user?.email ?? "" });
      setDraft({ leadImage: { url: media.url, path: media.path, alt: "", credit: "" } });
    } catch (err) {
      setUploadError(describeUploadError(err));
    } finally {
      setUploading(false);
    }
  }

  /** A library pick already has its credit/alt recorded — no re-prompt, unlike a fresh upload. */
  function insertFromLibrary(item: MediaItem) {
    if (picker === "lead") {
      setDraft({ leadImage: { url: item.url, path: item.path, alt: item.alt, credit: item.credit } });
    } else {
      applyBodyEdit(bodyOps.image(content.body, currentSelection(), item.url, item.alt, item.credit));
    }
    setPicker(null);
  }

  const coAuthorChoices = staff.filter((s) => s.name !== draft.author);

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
          <GhostButton onClick={() => setShowPreview(true)}>Preview</GhostButton>
          {canPublish ? (
            <PrimaryButton onClick={() => setShowPublishConfirm(true)}>Publish now</PrimaryButton>
          ) : (
            <PrimaryButton onClick={onSendToReview} style={{ background: "#8F6135" }}>
              Send to review
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Language tabs — one full set of fields per language, not one field with a label. */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid #D8D1C7" }}>
        {ALL_LANGS.map((code) => {
          const active = code === activeLang;
          const started = langStarted(draft, code);
          return (
            <button
              key={code}
              type="button"
              onClick={() => setActiveLang(code)}
              aria-current={active ? "true" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: "none",
                border: "none",
                borderBottom: active ? "2px solid #002D62" : "2px solid transparent",
                marginBottom: "-1px",
                cursor: "pointer",
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "12px",
                letterSpacing: "0.06em",
                fontWeight: active ? 600 : 500,
                color: active ? "#002D62" : "#8A8378",
              }}
            >
              {code} <span style={{ fontWeight: 400, color: "#8A8378" }}>{LANG_NAME[code]}</span>
              {code === primaryLang ? (
                <span style={{ fontSize: "10px", color: "#8F6135" }}>· original</span>
              ) : !started ? (
                <span style={{ fontSize: "10px", color: "#B0A99C" }}>· not started</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]" style={{ gap: "20px", alignItems: "start" }}>
        {/* Main column */}
        <div style={{ ...CARD, gap: "20px" }}>
          <input
            value={content.title}
            onChange={(e) => patchContent({ title: e.target.value })}
            placeholder="Headline"
            aria-label={`Headline (${activeLang})`}
            dir={activeLang === "AR" ? "rtl" : "ltr"}
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

          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={FIELD_LABEL}>Slug ({activeLang})</span>
              <input
                value={content.slug}
                onChange={(e) => patchContent({ slug: e.target.value })}
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
              value={content.excerpt}
              onChange={(e) => patchContent({ excerpt: e.target.value })}
              dir={activeLang === "AR" ? "rtl" : "ltr"}
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
              <button type="button" title="Bold" data-hover="background:#E8E3DD" style={toolbarBtn} onClick={() => applyBodyEdit(bodyOps.bold(content.body, currentSelection()))}>
                B
              </button>
              <button type="button" title="Italic" data-hover="background:#E8E3DD" style={toolbarBtn} onClick={() => applyBodyEdit(bodyOps.italic(content.body, currentSelection()))}>
                I
              </button>
              <button type="button" title="Heading" data-hover="background:#E8E3DD" style={toolbarBtn} onClick={() => applyBodyEdit(bodyOps.h2(content.body, currentSelection()))}>
                H2
              </button>
              <button
                type="button"
                title="Pull-quote, in the StoryBridge mark"
                data-hover="background:#E8E3DD"
                style={toolbarBtn}
                onClick={() => applyBodyEdit(bodyOps.pullquote(content.body, currentSelection()))}
              >
                <QuoteMark size={24} />
              </button>
              <button
                type="button"
                title="Link"
                data-hover="background:#E8E3DD"
                style={toolbarBtn}
                onClick={() => {
                  const url = window.prompt("Link URL:", "https://");
                  if (url) applyBodyEdit(bodyOps.link(content.body, currentSelection(), url));
                }}
              >
                link
              </button>
              <button
                type="button"
                title="Insert image"
                data-hover="background:#E8E3DD"
                style={toolbarBtn}
                disabled={uploading}
                onClick={() => toolbarImageInput.current?.click()}
              >
                {uploading ? "uploading…" : "image"}
              </button>
              <button
                type="button"
                title="Pick from the media library"
                data-hover="background:#E8E3DD"
                style={toolbarBtn}
                onClick={() => setPicker("toolbar")}
              >
                library
              </button>
              <input
                ref={toolbarImageInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void insertImageFromFile(file);
                }}
              />
              <span
                style={{
                  marginInlineStart: "auto",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "11px",
                  color: "#8A8378",
                }}
              >
                Editing {activeLang}
              </span>
            </div>
            <textarea
              ref={bodyRef}
              rows={16}
              value={content.body}
              onChange={(e) => patchContent({ body: e.target.value })}
              aria-label={`Body (${activeLang})`}
              dir={activeLang === "AR" ? "rtl" : "ltr"}
              style={{
                ...INPUT,
                borderRadius: "0 0 4px 4px",
                fontFamily: "'Source Serif 4',serif",
                fontSize: "16px",
                lineHeight: 1.75,
                padding: "16px",
              }}
            />
            {uploadError && (
              <div role="alert" style={{ fontSize: "12.5px", color: "#A5342E" }}>
                {uploadError}
              </div>
            )}
            <NotWiredNote>
              Plain-text field with a light markdown convention (**bold**, _italic_, ## heading, &gt;
              pull-quote, images) — a full rich-text field is still roadmap Phase 05.
            </NotWiredNote>
          </div>

          <div
            style={{
              border: "1px dashed #D8D1C7",
              borderRadius: "6px",
              padding: draft.leadImage?.url ? "16px" : "24px",
              textAlign: draft.leadImage?.url ? "left" : "center",
              background: "#F8F4EE",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ ...MONO_LABEL, marginBottom: draft.leadImage?.url ? 0 : "6px" }}>Lead image</div>
            {draft.leadImage?.url ? (
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
                <MediaImage
                  src={draft.leadImage.url}
                  alt={draft.leadImage.alt}
                  style={{ width: "160px", height: "100px", borderRadius: "4px", border: "1px solid #D8D1C7", flex: "none", overflow: "hidden" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "200px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={FIELD_LABEL}>Credit</span>
                    <input
                      value={draft.leadImage.credit}
                      onChange={(e) => setDraft({ leadImage: { ...draft.leadImage!, credit: e.target.value } })}
                      placeholder="Photo: Jane Doe / Unsplash"
                      style={{ ...INPUT, fontSize: "13px" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={FIELD_LABEL}>Alt text</span>
                    <input
                      value={draft.leadImage.alt}
                      onChange={(e) => setDraft({ leadImage: { ...draft.leadImage!, alt: e.target.value } })}
                      style={{ ...INPUT, fontSize: "13px" }}
                    />
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <GhostButton onClick={() => leadImageInput.current?.click()} disabled={uploading}>
                      Replace
                    </GhostButton>
                    <GhostButton onClick={() => setPicker("lead")}>Choose from library</GhostButton>
                    <GhostButton onClick={() => setDraft({ leadImage: undefined })}>Remove</GhostButton>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "13px", color: "#8A8378" }}>Drop a file or pick from the media library</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <GhostButton onClick={() => leadImageInput.current?.click()} disabled={uploading}>
                    {uploading ? "Uploading…" : "Upload image"}
                  </GhostButton>
                  <GhostButton onClick={() => setPicker("lead")}>Choose from library</GhostButton>
                </div>
              </>
            )}
            <input
              ref={leadImageInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void setLeadImageFromFile(file);
              }}
            />
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
            <div style={MONO_LABEL}>Co-authors</div>
            {coAuthorChoices.length === 0 ? (
              <div style={{ fontSize: "12.5px", color: "#8A8378" }}>No other active staff to credit yet.</div>
            ) : (
              coAuthorChoices.map((s) => {
                const checked = (draft.coAuthors ?? []).includes(s.name);
                return (
                  <label key={s.email} style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px", color: "#3E4650" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(draft.coAuthors ?? []), s.name]
                          : (draft.coAuthors ?? []).filter((n) => n !== s.name);
                        setDraft({ coAuthors: next });
                      }}
                      style={{ width: "16px", height: "16px", accentColor: "#002D62" }}
                    />
                    {s.name}
                  </label>
                );
              })
            )}
          </div>

          <div style={CARD}>
            <div style={MONO_LABEL}>Language versions</div>
            {ALL_LANGS.map((code, i) => {
              const isPrimary = code === primaryLang;
              const started = langStarted(draft, code);
              return (
                <div
                  key={code}
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
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11.5px", color: "#002D62", fontWeight: 500 }}>
                    {code}
                  </div>
                  <div style={{ fontSize: "13px", color: "#5A6472" }}>
                    {isPrimary ? "This version" : started ? "Draft" : "Not started"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveLang(code)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12.5px", color: "#8F6135", fontWeight: 600 }}
                  >
                    {isPrimary ? "Editing" : started ? "Edit" : "Start"}
                  </button>
                </div>
              );
            })}
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
              {content.title || draft.title}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#2F6B4F" }}>
              storybridge.tn/journal/{content.slug || draft.slug}
            </div>
            <div style={{ fontSize: "12.5px", lineHeight: 1.6, color: "#5A6472" }}>
              {content.excerpt || "Add a standfirst to control the search snippet."}
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <ArticlePreview
          content={content}
          author={draft.author}
          coAuthors={draft.coAuthors ?? []}
          leadImage={draft.leadImage}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showPublishConfirm && (
        <PublishConfirmDialog
          articleTitle={draft.title}
          onClose={() => setShowPublishConfirm(false)}
          onConfirmed={() => {
            setShowPublishConfirm(false);
            onPublish();
          }}
        />
      )}

      {picker && <MediaPicker onSelect={insertFromLibrary} onClose={() => setPicker(null)} />}
    </div>
  );
}
