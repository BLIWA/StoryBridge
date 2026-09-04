"use client";

import { MONO_LABEL, Chip } from "@/components/ui";
import { PAGES, OTHER_NAMESPACES } from "./page-registry";

/** id used for the trailing "More" chip — not a real page, opens the plain namespace list. */
export const MORE_ID = "__more__";

/**
 * The top bar the user asked for: every page as a selectable chip, grouped
 * Pages / Site-wide / More so the ~20 raw catalog namespaces read as
 * recognizable page names instead of JSON keys.
 */
export function ChipBar({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const pages = PAGES.filter((p) => p.group === "page");
  const siteWide = PAGES.filter((p) => p.group === "site-wide");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ ...MONO_LABEL, flex: "none" }}>Pages</span>
        {pages.map((p) => (
          <Chip key={p.id} active={selected === p.id} onClick={() => onSelect(p.id)}>
            {p.label}
          </Chip>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ ...MONO_LABEL, flex: "none" }}>Site-wide</span>
        {siteWide.map((p) => (
          <Chip key={p.id} active={selected === p.id} onClick={() => onSelect(p.id)}>
            {p.label}
          </Chip>
        ))}
        {OTHER_NAMESPACES.length > 0 && (
          <Chip active={selected === MORE_ID} onClick={() => onSelect(MORE_ID)} style={{ borderStyle: "dashed" }}>
            More text…
          </Chip>
        )}
      </div>
    </div>
  );
}
