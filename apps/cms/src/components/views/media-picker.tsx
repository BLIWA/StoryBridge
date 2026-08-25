"use client";

import { useEffect, useState } from "react";
import { MediaImage, GhostButton } from "@/components/ui";
import { watchMedia, type MediaItem } from "@/lib/media";
import { getFirebase } from "@/lib/firebase";

/**
 * The library the editor's "pick from the media library" copy has promised
 * since Phase 05's first slice — every past upload, credit and alt text
 * already attached, so picking one skips the re-upload and the re-prompt.
 */
export function MediaPicker({ onSelect, onClose }: { onSelect: (item: MediaItem) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);

  useEffect(() => {
    const { db } = getFirebase();
    return watchMedia(
      db,
      (list) => setItems(list),
      () => setItems([]),
    );
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media library"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(0,24,56,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "clamp(16px,4vw,56px) 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          maxHeight: "min(80vh, 640px)",
          display: "flex",
          flexDirection: "column",
          background: "#FFFFFF",
          border: "1px solid #E6E0D8",
          borderRadius: "8px",
          boxShadow: "0 18px 50px rgba(0,24,56,0.28)",
          animation: "cms-rise .28s cubic-bezier(.2,.7,.2,1) both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "14px 20px",
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
            Media library
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", lineHeight: 1, color: "#5A6472", padding: "4px" }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1 }}>
          {items === null ? (
            <div style={{ fontSize: "13.5px", color: "#8A8378", padding: "24px 0", textAlign: "center" }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ fontSize: "13.5px", color: "#8A8378", padding: "24px 0", textAlign: "center" }}>
              Nothing uploaded yet — upload an image once and it shows up here for next time.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: "14px" }}>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  data-hover="border-color:#B57D49"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "8px",
                    border: "1px solid #E6E0D8",
                    borderRadius: "6px",
                    background: "none",
                    cursor: "pointer",
                    textAlign: "start",
                    transition: "border-color .16s ease",
                  }}
                >
                  <MediaImage
                    src={item.url}
                    alt={item.alt}
                    style={{ width: "100%", aspectRatio: "4/3", borderRadius: "4px", overflow: "hidden" }}
                  />
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "#5A6472",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.credit || item.alt || "Untitled"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid #E6E0D8", display: "flex", justifyContent: "flex-end" }}>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
        </div>
      </div>
    </div>
  );
}
