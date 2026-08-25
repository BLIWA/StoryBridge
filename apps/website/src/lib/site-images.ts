import { doc, getDoc } from "firebase/firestore";
import { getDb } from "./firebase";

export type SiteImage = { url: string; alt: string };

/**
 * One image slot, set from the CMS's Site copy → Images cards (see
 * apps/cms/src/lib/site-images.ts for the id contract and the write side —
 * ids here must match those literally). Returns null wherever no one has
 * uploaded anything yet, so callers fall back to the page's placeholder box
 * exactly like an unset article lead image already does (see
 * app/[locale]/journal/[slug]/page.tsx).
 */
export async function getSiteImage(slotId: string): Promise<SiteImage | null> {
  try {
    const snap = await getDoc(doc(getDb(), "siteImages", slotId));
    if (!snap.exists()) return null;
    const data = snap.data();
    const url = typeof data.url === "string" ? data.url : "";
    if (!url) return null;
    return { url, alt: typeof data.alt === "string" ? data.alt : "" };
  } catch {
    // A Firestore hiccup at build time must never fail the page — same
    // reasoning as lib/site-content.ts's loadMessages().
    return null;
  }
}
