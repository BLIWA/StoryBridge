import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * The website's only Firebase dependency: reading published articles at
 * build time (see lib/articles.ts). No Auth, no Storage — this app never
 * signs anyone in and never writes anything. See .env.production for why
 * these values are committed rather than secret.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

let cached: Firestore | null = null;

export function getDb(): Firestore {
  if (!cached) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cached = getFirestore(app);
  }
  return cached;
}
