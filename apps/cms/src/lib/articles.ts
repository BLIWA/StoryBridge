/**
 * Article persistence — the first Firestore-backed slice of roadmap Phase 05.
 *
 * Collection: `articles`, one document per piece, doc id == `Article.id`. The
 * shape matches `Article` in content/seed.ts, plus `authorEmail` (normalized,
 * set once at creation and never changed after — see firestore.rules): the
 * board's `author` field is a display name, which isn't enough for rules to
 * tell "your own draft" from anyone else's without trusting the client.
 *
 * Writes are explicit, not autosave-on-keystroke: Studio patches its local
 * `articles` state on every field change (instant, no network), and only
 * calls saveArticle()/createArticle() from the editor's "Save draft",
 * "Publish now" and "Send to review" actions. That matches the UI, which
 * already shows a saved/unsaved indicator built for exactly this rhythm, and
 * avoids a write per keystroke.
 *
 * The website does not read this collection yet — it's still a static export
 * reading apps/website/src/content (see the root README and roadmap Phase
 * 05). Publishing here changes what Studio and Firestore agree is true; it
 * does not yet change what's live.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { Article } from "@/content/seed";
import { normalizeEmail } from "./staff";

const COLLECTION = "articles";

function toArticle(id: string, data: Record<string, unknown>): Article {
  // `id` comes from the doc, not the stored fields; everything else
  // (including `authorEmail`, which the Article type carries too) round-trips
  // through Firestore as-is.
  return { id, ...(data as Omit<Article, "id">) };
}

/** A fresh, unused document id — generated client-side, no network round trip. */
export function newArticleId(db: Firestore): string {
  return doc(collection(db, COLLECTION)).id;
}

/**
 * Live list of every article. Studio filters/sorts it client-side (see
 * components/views/articles.tsx) the same way it did with the in-memory seed.
 */
export function watchArticles(
  db: Firestore,
  onChange: (articles: Article[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => onChange(snap.docs.map((d) => toArticle(d.id, d.data()))),
    onError,
  );
}

/** Creates a brand-new article. `article.id` must come from newArticleId(). */
export async function createArticle(db: Firestore, article: Article, authorEmail: string): Promise<void> {
  const { id, ...data } = article;
  await setDoc(doc(db, COLLECTION, id), {
    ...data,
    authorEmail: normalizeEmail(authorEmail),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Overwrites an existing article with the editor's current local state. Used
 * by Save draft, Publish now and Send to review alike — they differ only in
 * what `status` the caller has already patched onto `article` before calling.
 */
export async function saveArticle(db: Firestore, article: Article): Promise<void> {
  const { id, ...data } = article;
  await setDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Deletes an article outright. Wired to Studio's "Delete draft" action —
 * firestore.rules refuses this for a Published piece (see its comment on
 * `allow delete`), so a live article can only come down via a status change
 * to "Archived", never this.
 */
export async function deleteArticle(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
