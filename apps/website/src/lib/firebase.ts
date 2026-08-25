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

// "(default)" is the production database — the only one this app's own
// .env.production sets. A second named database, "test", exists in the
// same project (same rules, empty of real data) for exercising the site
// against sample data without touching anything live; point a local
// .env.local at it with NEXT_PUBLIC_FIRESTORE_DATABASE_ID=test. See
// scripts/seed-test-db.mjs to populate it and the root README.
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
