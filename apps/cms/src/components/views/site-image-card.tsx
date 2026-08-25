"use client";

import { useRef, useState } from "react";
import { MONO_LABEL, FIELD_LABEL, INPUT, GhostButton, MediaImage } from "@/components/ui";
import { uploadMedia, describeUploadError, recordMediaMeta, type MediaItem } from "@/lib/media";
import { saveSiteImage, clearSiteImage, type SiteImage, type SiteImageSlot } from "@/lib/site-images";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { MediaPicker } from "./media-picker";

/**
 * One image slot's card in the Site copy editor — Upload/Replace/Choose from
 * library/Remove, the same verbs as the article editor's lead image (see
 * article-editor.tsx's leadImage block), but writing straight to
 * `siteImages/{slot.id}` on every action instead of batching into a draft:
 * an image slot has no encompassing "Save" step to wait for, unlike an
 * article or a page's text fields.
 */
export function SiteImageCard({ slot, image }: { slot: SiteImageSlot; image: SiteImage | undefined }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState(image?.alt ?? "");
  const [picker, setPicker] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Keeps the alt field in step with Firestore (another save, another tab)
  // — adjusted during render rather than in an effect, same pattern as
  // SiteContentView's own resetKey trick, so it can't cascade an extra
  // render and only fires when the server value actually changed, not on
  // every keystroke.
  const [altFor, setAltFor] = useState(image?.alt ?? "");
  if (altFor !== (image?.alt ?? "")) {
    setAltFor(image?.alt ?? "");
    setAltDraft(image?.alt ?? "");
  }

  async function persist(next: SiteImage) {
    setError(null);
    try {
      await saveSiteImage(getFirebase().db, slot.id, next);
    } catch (err) {
      setError(describeUploadError(err));
    }
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const media = await uploadMedia(file);
      void recordMediaMeta(media, { alt: altDraft, credit: "", uploadedBy: user?.email ?? "" });
      await persist({ url: media.url, path: media.path, alt: altDraft });
    } catch (err) {
      setError(describeUploadError(err));
    } finally {
      setUploading(false);
    }
  }

  function pickFromLibrary(item: MediaItem) {
    const alt = altDraft || item.alt;
    setAltDraft(alt);
    void persist({ url: item.url, path: item.path, alt });
  }

  async function remove() {
    setError(null);
    try {
      await clearSiteImage(getFirebase().db, slot.id);
    } catch (err) {
      setError(describeUploadError(err));
    }
  }

  function saveAltIfChanged() {
    if (altDraft === (image?.alt ?? "")) return;
    void persist({ url: image?.url ?? "", path: image?.path ?? "", alt: altDraft });
  }

  const hasImage = Boolean(image?.url);

  return (
    <div
      style={{
        border: "1px solid #E6E0D8",
        borderRadius: "8px",
        padding: hasImage ? "16px" : "24px",
        background: "#F8F4EE",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={MONO_LABEL}>{slot.label}</div>
      {hasImage ? (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <MediaImage
            src={image!.url}
            alt={image!.alt}
            style={{ width: "140px", aspectRatio: slot.aspect, borderRadius: "4px", border: "1px solid #D8D1C7", flex: "none", overflow: "hidden" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "200px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={FIELD_LABEL}>Alt text</span>
              <input
                value={altDraft}
                onChange={(e) => setAltDraft(e.target.value)}
                onBlur={saveAltIfChanged}
                style={{ ...INPUT, fontSize: "13px" }}
              />
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <GhostButton onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? "Uploading…" : "Replace"}
              </GhostButton>
              <GhostButton onClick={() => setPicker(true)}>Choose from library</GhostButton>
              <GhostButton onClick={() => void remove()}>Remove</GhostButton>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: "13px", color: "#8A8378" }}>No image set — the site shows its placeholder box.</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <GhostButton onClick={() => fileInput.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload image"}
            </GhostButton>
            <GhostButton onClick={() => setPicker(true)}>Choose from library</GhostButton>
          </div>
        </>
      )}
      {error && <div style={{ fontSize: "12px", color: "#A23B3B" }}>{error}</div>}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      {picker && <MediaPicker onSelect={pickFromLibrary} onClose={() => setPicker(false)} />}
    </div>
  );
}
