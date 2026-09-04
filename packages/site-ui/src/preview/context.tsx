"use client";

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Bridges a page body between two very different homes: the live website
 * (no provider mounted — every helper below degrades to a plain,
 * markup-free passthrough) and the CMS's live preview (a provider mounted
 * around the same components, fed by in-progress edits). See
 * apps/cms/src/components/views/site-content/live-preview.tsx for the
 * provider, and packages/site-ui's home/who-we-are/contact bodies for the
 * call sites.
 *
 * `Editable`/`EditableImage` don't hold the current value themselves — the
 * text they're given (`t(key)`, already resolved from whatever messages the
 * surrounding NextIntlClientProvider has, defaults or live-merged-with-edits)
 * is the single source of truth. Typing calls `onChange`, which the CMS
 * folds into its edits map and re-renders with — closing the loop without
 * this file needing to know anything about namespaces, Firestore, or how a
 * "path" is structured beyond being a stable string key.
 */

export type PreviewContextValue = {
  /** Whether the edit-mode toggle is on. Off: read-only, but still visibly marked. */
  editing: boolean;
  onChange: (path: string, value: string) => void;
  /** Renders the upload/replace/remove UI for one image slot (the CMS supplies this — see live-preview.tsx). */
  renderImageEditor: (slotId: string) => ReactNode;
};

const Ctx = createContext<PreviewContextValue | null>(null);

export const PreviewProvider = Ctx.Provider;

/** Null outside the CMS preview (i.e. on the real website) — every consumer below checks for that. */
export function usePreview(): PreviewContextValue | null {
  return useContext(Ctx);
}

const MARK_STYLE: CSSProperties = {
  outline: "1px dashed #B57D49",
  outlineOffset: "2px",
  borderRadius: "2px",
};

const ACTIVE_FIELD_STYLE: CSSProperties = {
  outline: "2px solid #B57D49",
  outlineOffset: "1px",
  borderRadius: "2px",
  background: "#FFFDF9",
  font: "inherit",
  color: "inherit",
  lineHeight: "inherit",
  padding: "1px 3px",
  border: "none",
};

/**
 * Wraps one piece of visible copy so the CMS preview can show it's editable
 * and let you edit it in place. On the real website (no PreviewProvider in
 * the tree) it's `<>{children}</>` — no extra element, no attribute, no
 * behavior change.
 *
 * `children` must be the already-resolved string (what `t(key)` returned) —
 * that's what makes this reactive to live edits for free: the CMS recomputes
 * the messages it hands to NextIntlClientProvider on every keystroke, so
 * `t(key)` already returns the in-progress value by the time it gets here.
 */
export function Editable({
  path,
  children,
  multiline,
  as = "span",
  style,
}: {
  path: string;
  children: string;
  multiline?: boolean;
  as?: "span" | "div";
  style?: CSSProperties;
}) {
  const ctx = usePreview();
  const [open, setOpen] = useState(false);
  const Tag = as;

  if (!ctx) return <>{children}</>;

  if (!ctx.editing) {
    // Read-only preview: shows what's editable without letting it be touched.
    return (
      <Tag style={{ ...style, ...MARK_STYLE }}>{children}</Tag>
    );
  }

  const isMultiline = multiline ?? children.length > 60;

  if (open) {
    const commit = () => setOpen(false);
    return isMultiline ? (
      <textarea
        autoFocus
        rows={Math.max(2, Math.ceil(children.length / 46))}
        value={children}
        onChange={(e) => ctx.onChange(path, e.target.value)}
        onBlur={commit}
        style={{ ...style, ...ACTIVE_FIELD_STYLE, display: "block", width: "100%", resize: "vertical" }}
      />
    ) : (
      <input
        autoFocus
        value={children}
        onChange={(e) => ctx.onChange(path, e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        style={{
          ...style,
          ...ACTIVE_FIELD_STYLE,
          width: `${Math.max(6, children.length + 2)}ch`,
          maxWidth: "100%",
        }}
      />
    );
  }

  return (
    <Tag
      role="button"
      tabIndex={0}
      title="Click to edit"
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
        }
      }}
      style={{ ...style, ...MARK_STYLE, cursor: "text" }}
    >
      {children}
    </Tag>
  );
}

/**
 * Same idea as `Editable`, for one image slot (see
 * apps/cms/src/lib/site-images.ts's SITE_IMAGE_SLOTS). Outside a
 * PreviewProvider it renders just `children` — the real image or its
 * placeholder, exactly as the website already builds it — with zero
 * wrapper. Inside the CMS preview it adds the editable outline, and in edit
 * mode a click opens the slot's upload/replace/remove editor (supplied by
 * the CMS via `renderImageEditor`, reusing the same component the old flat
 * editor used for it).
 */
export function EditableImage({
  slotId,
  children,
  rounded = "8px",
}: {
  slotId: string;
  children: ReactNode;
  rounded?: string;
}) {
  const ctx = usePreview();
  const [open, setOpen] = useState(false);

  if (!ctx) return <>{children}</>;

  return (
    <div style={{ position: "relative" }}>
      {ctx.editing ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Edit image"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            padding: 0,
            background: "transparent",
            border: "2px solid #B57D49",
            borderRadius: rounded,
            cursor: "pointer",
            zIndex: 1,
          }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, outline: "1px dashed #B57D49", outlineOffset: "2px", borderRadius: rounded, pointerEvents: "none" }} />
      )}
      {children}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            insetInlineStart: 0,
            zIndex: 40,
            width: "min(340px, 90vw)",
            boxShadow: "0 12px 36px rgba(0,24,56,0.18)",
          }}
        >
          {ctx.renderImageEditor(slotId)}
        </div>
      )}
    </div>
  );
}
