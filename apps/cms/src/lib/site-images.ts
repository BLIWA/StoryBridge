/**
 * Site-wide imagery — the office photo on Who We Are, a step's field photo
 * on How We Work, each founder's portrait. Kept as its own small Firestore
 * collection rather than folded into siteContent's per-locale text overrides
 * (see lib/site-content.ts): a photo doesn't change by language, so there's
 * no reason to require uploading the same file three times, once per
 * EN/FR/AR tab, or risk it drifting out of sync between them.
 *
 * One doc per slot under `siteImages/{slotId}`, public-read (the website
 * build fetches it with no credentials, same as siteContent) and staff-write
 * (see firestore.rules' `/siteImages` match — same `canEditPages()` gate as
 * site copy). The upload itself goes through lib/media.ts's uploadMedia(),
 * so it lands in the same `/media` Storage path and rules as every other
 * image the CMS writes.
 */

import { doc, deleteDoc, setDoc, collection, onSnapshot, serverTimestamp, type Firestore } from "firebase/firestore";

export type SiteImageSlot = {
  /** Firestore doc id under `siteImages/` — must match the literal string the website page reads it back with. */
  id: string;
  /** Shown in the CMS only. */
  label: string;
  /** Which Site copy namespace this slot's card appears under. */
  namespace: string;
  /** CSS aspect-ratio, matching the box the website actually renders. */
  aspect: string;
};

// IDs are load-bearing: each one is read back verbatim by a website page
// component (grep the id string in apps/website/src/app to find where).
export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  { id: "who-we-are.photo", label: "Office photo", namespace: "WhoWeAre", aspect: "4 / 5" },
  { id: "how-we-work.field-photo", label: "Field step photo", namespace: "HowWeWork", aspect: "3 / 2" },
  { id: "founders.assia.portrait", label: "Assia's portrait", namespace: "Founders", aspect: "4 / 5" },
  { id: "founders.imen.portrait", label: "Imen's portrait", namespace: "Founders", aspect: "4 / 5" },
];

export type SiteImage = { url: string; path: string; alt: string };

export function watchSiteImages(
  db: Firestore,
  onChange: (items: Record<string, SiteImage>) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    collection(db, "siteImages"),
    (snap) => {
      const next: Record<string, SiteImage> = {};
      for (const d of snap.docs) {
        const data = d.data();
        next[d.id] = {
          url: typeof data.url === "string" ? data.url : "",
          path: typeof data.path === "string" ? data.path : "",
          alt: typeof data.alt === "string" ? data.alt : "",
        };
      }
      onChange(next);
    },
    onError,
  );
}

/** Overwrites one slot's image + alt text wholesale — same shape whether this is a fresh upload or just an alt edit. */
export async function saveSiteImage(db: Firestore, slotId: string, image: SiteImage): Promise<void> {
  await setDoc(doc(db, "siteImages", slotId), { ...image, updatedAt: serverTimestamp() });
}

/** Reverts a slot to the website's placeholder box — does not delete the file from Storage, only the pointer to it. */
export async function clearSiteImage(db: Firestore, slotId: string): Promise<void> {
  await deleteDoc(doc(db, "siteImages", slotId));
}
