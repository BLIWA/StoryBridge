/**
 * Read/write side of the site-copy overrides the website merges onto its
 * default catalog at build time — see packages/content/src/merge.ts and
 * apps/website/src/lib/site-content.ts. One document per next-intl
 * top-level namespace, each holding only the strings someone has actually
 * overridden, keyed by locale.
 */

import { doc, getDoc, setDoc, serverTimestamp, type Firestore } from "firebase/firestore";
import type { JSONValue } from "@storybridge/content/merge";

export type Locale = "en" | "fr" | "ar";

/** Whatever's saved for one namespace — sparse, and only the locales someone has touched. */
export async function fetchNamespaceOverrides(db: Firestore, namespace: string): Promise<Partial<Record<Locale, JSONValue>>> {
  const snap = await getDoc(doc(db, "siteContent", namespace));
  return snap.exists() ? (snap.data() as Partial<Record<Locale, JSONValue>>) : {};
}

/** Overwrites one namespace's override for one locale. An empty `override` clears it back to defaults. */
export async function saveNamespaceOverride(
  db: Firestore,
  namespace: string,
  locale: Locale,
  override: JSONValue,
): Promise<void> {
  await setDoc(doc(db, "siteContent", namespace), { [locale]: override, updatedAt: serverTimestamp() }, { merge: true });
}
