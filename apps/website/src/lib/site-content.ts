/**
 * Layers Firestore overrides onto the static message catalog — see
 * packages/content/src/merge.ts for the shapes involved. Called once per
 * locale from i18n/request.ts, at build time (this app is still a static
 * export — see the root README), so a change made in the CMS only reaches
 * the live site on the next build+deploy, not instantly.
 *
 * `siteContent/{namespace}` documents are public-read (firestore.rules) —
 * this is marketing copy, not something that needs staff-only access, and
 * the build process has no privileged credentials to read it with anyway.
 *
 * Found the hard way: Next's on-disk data cache persists across separate
 * `next build` invocations sharing the same `.next` directory, and it
 * cached the Firestore SDK's underlying fetch call — a build run before an
 * override was saved would keep serving that stale (empty) result forever
 * after, even on later rebuilds. `pnpm build` now clears `.next` first
 * (see package.json) specifically so this can't happen silently.
 */

import { collection, getDocs } from "firebase/firestore";
import { deepMerge, type JSONObject } from "@storybridge/content/merge";
import { getDb } from "./firebase";

export async function loadMessages(locale: string, defaults: JSONObject): Promise<JSONObject> {
  try {
    const snap = await getDocs(collection(getDb(), "siteContent"));
    let merged = defaults;
    for (const doc of snap.docs) {
      const namespace = doc.id;
      const override = doc.data()[locale];
      if (override !== undefined && merged[namespace] !== undefined) {
        merged = { ...merged, [namespace]: deepMerge(merged[namespace], override) };
      }
    }
    return merged;
  } catch {
    // A Firestore hiccup at build time must never take the whole site down
    // with it — worst case, a page reverts to its default copy for one build.
    return defaults;
  }
}
