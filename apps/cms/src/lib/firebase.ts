import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// The "sotrybridge" web app, from `firebase apps:sdkconfig WEB`. Values live in
// .env.production (committed — they are public project identifiers, not secrets)
// and can be overridden per-machine in .env.local. See ../../.env.example.
//
// Exported because inviteStaff() needs it to stand up a throwaway secondary app
// — see lib/staff.ts for why creating a user needs its own Auth instance.
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy + memoized: every CMS page is force-dynamic, so this module still gets
// evaluated during the server-side render of client components. Constructing
// getAuth()/getFirestore() at import time would throw on the server whenever
// NEXT_PUBLIC_FIREBASE_* env vars aren't set (e.g. this scaffold, before the
// real Firebase web app config is filled into .env.local). Deferring to first
// call — which only ever happens client-side, inside an event handler —
// avoids that.
let cached: { auth: Auth; db: Firestore; storage: FirebaseStorage } | null = null;

export function getFirebase() {
  if (!cached) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cached = { auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
  }
  return cached;
}

// Safe to construct without a live config — it holds no network state.
export const googleProvider = new GoogleAuthProvider();

/**
 * True once the web app's config is present. The CMS renders its full UI
 * either way, but auth calls can't work without it, so the sign-in screen
 * says so plainly rather than failing with a Firebase error code.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.appId);
}
