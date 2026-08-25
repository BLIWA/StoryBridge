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

import { ref, uploadBytes, getDownloadURL, StorageError } from "firebase/storage";
import { doc, setDoc, collection, query, orderBy, onSnapshot, serverTimestamp, type Firestore } from "firebase/firestore";
import { getFirebase } from "./firebase";

/**
 * storage.rules' single `allow write` clause ANDs together the staff check,
 * the size cap, and the content-type check — Storage collapses a failure of
 * *any* of those three into the same `storage/unauthorized` code, with no way
 * for the client to tell which one actually failed. Reported live: a fully
 * active staff member uploading a real photo whose browser-reported MIME
 * type came through empty or as `application/octet-stream` (common for
 * HEIC/Live Photos exports, some drag-and-drop paths) got told their account
 * wasn't recognized as staff — a wrong diagnosis pointing them at the wrong
 * fix. uploadMedia() below now checks size and content-type itself, client
 * side, before ever calling Storage, using the same 15MB/`image/*` limits
 * the rule enforces — so by the time a real `storage/unauthorized` reaches
 * here, those two are already known-good and it really can only mean "not
 * staff."
 */
export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

const MAX_BYTES = 15 * 1024 * 1024;

/**
 * A StorageError carries which of those it was, but the editor was
 * swallowing it and always showing the same "check your connection" copy.
 * That made every real cause (wrong content-type, not staff, oversized file,
 * actually offline) look identical. Map the ones worth telling apart.
 */
export function describeUploadError(err: unknown): string {
  if (err instanceof UploadValidationError) return err.message;
  const code = err instanceof StorageError ? err.code : undefined;
  switch (code) {
    case "storage/unauthorized":
      return "Couldn't upload that image — your account isn't recognized as active staff. Ask an owner to check Settings & access.";
    case "storage/unauthenticated":
      return "Couldn't upload that image — you've been signed out. Sign in again and retry.";
    case "storage/quota-exceeded":
      return "Couldn't upload that image — storage quota exceeded.";
    case "storage/canceled":
      return "Upload canceled.";
    case "storage/retry-limit-exceeded":
      return "Couldn't upload that image — the connection kept timing out. Check your connection and try again.";
    default:
      return "Couldn't upload that image. Check your connection and try again.";
  }
}

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
  if (file.size >= MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new UploadValidationError(`Couldn't upload that image — it's ${mb}MB, over the 15MB limit.`);
  }
  if (!file.type.startsWith("image/")) {
    throw new UploadValidationError(
      file.type
        ? `Couldn't upload that image — "${file.type}" isn't an image format the site can serve. Try a JPEG, PNG, WebP, or GIF.`
        : "Couldn't upload that image — your browser didn't report a recognizable image type for that file. Try exporting it as a JPEG, PNG, WebP, or GIF first.",
    );
  }

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

export type MediaItem = {
  id: string;
  path: string;
  url: string;
  credit: string;
  alt: string;
  uploadedBy: string;
};

/** The library the editor's "pick from the media library" copy has always promised. */
export function watchMedia(
  db: Firestore,
  onChange: (items: MediaItem[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    query(collection(db, "media"), orderBy("createdAt", "desc")),
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            path: typeof data.path === "string" ? data.path : "",
            url: typeof data.url === "string" ? data.url : "",
            credit: typeof data.credit === "string" ? data.credit : "",
            alt: typeof data.alt === "string" ? data.alt : "",
            uploadedBy: typeof data.uploadedBy === "string" ? data.uploadedBy : "",
          };
        }),
      ),
    onError,
  );
}
