/**
 * The handful of keyframes and the `--sb-gutter` custom property that the
 * moved components' inline `style.animation`/`var(--sb-gutter)` strings
 * depend on. Copied verbatim from apps/website/src/app/globals.css (search
 * there for these names if this ever needs re-syncing) rather than shared
 * via a CSS import across the package boundary — Next's cross-workspace CSS
 * imports are fiddly, and this is small enough that a plain, occasionally
 * re-synced copy is the lower-risk choice. apps/website's own globals.css is
 * untouched by this — it doesn't import from here.
 *
 * apps/cms's live preview drops this into a plain `<style>` tag around the
 * rendered page (see live-preview.tsx); it never reaches the real website.
 */
export const PREVIEW_CSS = `
:root {
  --sb-gutter: 20px;
}
@media (min-width: 640px) {
  :root { --sb-gutter: 28px; }
}
@media (min-width: 1024px) {
  :root { --sb-gutter: 40px; }
}
@keyframes sb-draw {
  from { stroke-dashoffset: 1000; }
  to { stroke-dashoffset: 0; }
}
@keyframes sb-rise {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes sb-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes sb-wipe {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes sb-baton {
  0% { opacity: 0.24; }
  4% { opacity: 1; }
  28% { opacity: 1; }
  34% { opacity: 0.24; }
  100% { opacity: 0.24; }
}
@keyframes sb-batonbar {
  0% { transform: scaleY(0); }
  4% { transform: scaleY(1); }
  28% { transform: scaleY(1); }
  34% { transform: scaleY(0); }
  100% { transform: scaleY(0); }
}
@keyframes sb-cue {
  0%, 100% { opacity: 0.22; transform: translateY(-5px); }
  50% { opacity: 0.85; transform: translateY(4px); }
}
[data-anim-off="true"] [data-a] {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  stroke-dashoffset: 0 !important;
}
@media (prefers-reduced-motion: reduce) {
  [data-a] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    stroke-dashoffset: 0 !important;
  }
}
`;
