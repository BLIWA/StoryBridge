import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

/**
 * The website's Firebase dependencies: reading published articles at build
 * time (see lib/articles.ts), and — since the Resend Cloud Functions landed —
 * calling submitContact() for the contact form (see lib/submissions.ts). No
 * Auth, no Storage, and no direct Firestore writes from this app; the
 * newsletter signup is the one exception (see lib/subscribers.ts) and stays
 * a direct write, not a Function call. See .env.production for why these
 * values are committed rather than secret.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Matches functions/src/index.ts's setGlobalOptions region — Cloud Functions
// has no eur3 (that's a Firestore-only multi-region id), europe-west1 is the
// closest Blaze region to the eur3 data.
const FUNCTIONS_REGION = "europe-west1";

let cachedDb: Firestore | null = null;
let cachedFunctions: Functions | null = null;

function app() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getDb(): Firestore {
  if (!cachedDb) cachedDb = getFirestore(app());
  return cachedDb;
}

export function getFn(): Functions {
  if (!cachedFunctions) cachedFunctions = getFunctions(app(), FUNCTIONS_REGION);
  return cachedFunctions;
}
