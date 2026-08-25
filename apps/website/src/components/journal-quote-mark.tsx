/**
 * A pull-quote mark drawn in the StoryBridge mark's own shape — one hook
 * path, the same comma silhouette as the bronze stroke in
 * /assets/storybridge-mark.png, drawn once and mirrored horizontally in navy
 * — so the pair reads as an opening and closing curly quote, instead of a
 * generic typographic quote glyph. Sits beside pull-quotes in the Journal
 * article template.
 */
const QUOTE_HOOK_PATH =
  "M27 2C16 3.6 8.5 12.4 8.5 21.8C8.5 29.8 14.6 36 21.8 36C28 36 33 31.2 33 25C33 18.8 28 14 21.8 14C19.6 14 17.6 14.7 16 15.9C16.7 8.6 21.2 3.6 27.8 1.7C28.9 1.4 28.3 1.8 27 2Z";

export function JournalQuoteMark({ size = 52 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * (36 / 70)}
      viewBox="0 0 70 36"
      aria-hidden="true"
      style={{ display: "block", flex: "none" }}
    >
      <path d={QUOTE_HOOK_PATH} fill="#B57D49" />
      <path d={QUOTE_HOOK_PATH} fill="#002D62" transform="translate(70,0) scale(-1,1)" />
    </svg>
  );
}
