/**
 * Page/section content persistence — the second Firestore-backed slice of
 * roadmap Phase 05, alongside lib/articles.ts.
 *
 * Unlike articles, the *inventory* of pages and sections — which sections a
 * page has, their names/types, the id each one is known by — is still fixed
 * in content/seed.ts's `PAGES`. There is no "add page" or "add section" flow
 * in this UI to create new ones (the board's own "Add section" button isn't
 * wired either — see components/views/pages.tsx). What Firestore holds is
 * the *editable* state per section: its copy, its on/off switch, and the
 * page's section order — keyed by page, one document per page, id ==
 * `Page.key`.
 *
 * A page with no Firestore document yet (nothing saved since the board's
 * seed copy) falls back to content/seed.ts's defaults — see
 * mergePageOverrides() in components/views/pages.tsx, which is where the
 * two are combined into what the editor actually shows.
 */

import { collection, doc, setDoc, onSnapshot, serverTimestamp, type Firestore } from "firebase/firestore";
import type { Section } from "@/content/seed";

const COLLECTION = "pages";

/** The fields of a Section that are actually editable — not its identity (id/name/type). */
export type SectionOverride = Pick<Section, "heading" | "body" | "cta" | "href" | "on">;

export type PageOverrides = {
  key: string;
  /** Section ids in display order. Ids not in the seed, or missing from here, are handled by the merge. */
  order: string[];
  sections: Record<string, SectionOverride>;
};

function toOverrides(key: string, data: Record<string, unknown>): PageOverrides {
  return {
    key,
    order: Array.isArray(data.order) ? (data.order as string[]) : [],
    sections: (data.sections as Record<string, SectionOverride>) ?? {},
  };
}

/** Live overrides for every page that has been saved at least once. */
export function watchPages(
  db: Firestore,
  onChange: (pages: PageOverrides[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => onChange(snap.docs.map((d) => toOverrides(d.id, d.data()))),
    onError,
  );
}

/** Overwrites one page's saved section content and order. */
export async function savePage(
  db: Firestore,
  key: string,
  order: string[],
  sections: Record<string, SectionOverride>,
): Promise<void> {
  await setDoc(doc(db, COLLECTION, key), { order, sections, updatedAt: serverTimestamp() }, { merge: true });
}
