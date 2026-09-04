import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

/**
 * A minimal, self-contained Firebase client for the direct Firestore reads/
 * writes and the one Cloud Function call this package's contact/newsletter
 * pieces need — deliberately not apps/website's or apps/cms's own
 * lib/firebase.ts, since a shared package can't reach into either app's
 * src/. Both apps already point NEXT_PUBLIC_FIREBASE_* at the same
 * "storybridge-eb71e" project (see either app's src/lib/firebase.ts), and
 * firebase/app's initializeApp()/getApps() are a process-wide singleton, so
 * this reuses whichever app instance the host app's own lib/firebase.ts
 * already stood up rather than creating a second one.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Matches functions/src/index.ts's setGlobalOptions region.
const FUNCTIONS_REGION = "europe-west1";
const DATABASE_ID = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || "(default)";

let cachedDb: Firestore | null = null;
let cachedFunctions: Functions | null = null;

function app() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getDb(): Firestore {
  if (!cachedDb) cachedDb = getFirestore(app(), DATABASE_ID);
  return cachedDb;
}

export function getFn(): Functions {
  if (!cachedFunctions) cachedFunctions = getFunctions(app(), FUNCTIONS_REGION);
  return cachedFunctions;
}
