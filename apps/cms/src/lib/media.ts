/**
 * Media uploads — the CMS's first real write to Firebase Storage.
 *
 * Storage rules gate writes to `/media/**` on the same staff check
 * firestore.rules already does (see storage.rules) — this file does not
 * duplicate that logic, it just calls the SDK and lets the rules deny
 * whoever isn't allowed.
 *
 * A best-effort Firestore doc under `media/{id}` carries the credit and alt
 * text next to the file, mirroring the pattern in lib/staff.ts's
 * touchLastSignIn(): the upload itself is what matters, so a metadata-write
 * failure is swallowed rather than surfaced as an upload failure.
 */

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebase } from "./firebase";

export type UploadedMedia = {
  /** Storage path, e.g. `media/1737-cover.jpg` — kept so callers can delete later. */
  path: string;
  /** Public download URL, ready to drop into an <img> or the body text. */
  url: string;
};

const SAFE_NAME = /[^a-zA-Z0-9.\-]/g;

/**
 * Uploads a file under /media and returns its public URL. Throws on failure
 * — callers are interactive (a toolbar click, a dropzone), so there is
 * always a human on the other end to show the error to.
 */
export async function uploadMedia(file: File): Promise<UploadedMedia> {
  const { storage } = getFirebase();
  const safeName = file.name.replace(SAFE_NAME, "_");
  const path = `media/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type || undefined });
  const url = await getDownloadURL(storageRef);
  return { path, url };
}

/** Records credit/alt/uploader next to the file. Never blocks the upload it describes. */
export async function recordMediaMeta(
  media: UploadedMedia,
  meta: { credit: string; alt: string; uploadedBy: string },
): Promise<void> {
  try {
    const { db } = getFirebase();
    await setDoc(doc(db, "media", media.path.replace(/\//g, "__")), {
      path: media.path,
      url: media.url,
      credit: meta.credit,
      alt: meta.alt,
      uploadedBy: meta.uploadedBy,
      createdAt: serverTimestamp(),
    });
  } catch {
    // The file is already uploaded and usable; a missing metadata doc just
    // means the credit won't show up in a future media library list.
  }
}
