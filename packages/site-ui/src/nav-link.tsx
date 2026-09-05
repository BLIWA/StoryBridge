"use client";

import type { ComponentProps } from "react";
import { Link as RawLink } from "./navigation-core";
import { usePreview } from "./preview/context";

/**
 * Wraps next-intl's `Link` so it skips Next's automatic prefetch while
 * rendered inside the CMS's live preview (see live-preview.tsx and
 * preview/context.tsx). The preview already stops real navigation — a
 * capture-phase click handler there calls preventDefault() on every <a> —
 * but prefetch fires on its own as soon as a Link enters the viewport,
 * regardless of clicks. That sent Next looking for "/who-we-are",
 * "/founders" etc. against the CMS's own origin, where those routes don't
 * exist, filling devtools with 404s every time a Site copy page opened.
 *
 * On the real website (no PreviewProvider in the tree, so `usePreview()` is
 * null) this is a plain passthrough — prefetch behaves exactly as before.
 */
export function Link({ prefetch, ...rest }: ComponentProps<typeof RawLink>) {
  const preview = usePreview();
  return <RawLink prefetch={preview ? false : prefetch} {...rest} />;
}
