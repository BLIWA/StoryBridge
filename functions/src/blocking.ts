/**
 * Two jobs on every sign-in, both decided from the same `activeRoleOf()`
 * lookup:
 *
 * 1. Enforces "Allow contributor access from outside Tunisia" (Settings →
 *    Security in the CMS) — the one checkbox in that card that used to be
 *    pure display, unlike the 2FA/idle-signout work elsewhere this project.
 *    Only contributors are geo-restricted; the board's original design
 *    never asked for this on owner/chief/journalist, and this project
 *    doesn't second-guess that. The switch itself lives in Firestore
 *    (`settings/security`, `allowContributorsOutsideTunisia`), owner-editable
 *    from Settings — see apps/cms/src/components/views/settings.tsx and
 *    firestore.rules.
 *
 * 2. Stamps an `active_staff` custom claim onto the ID token this sign-in
 *    mints. storage.rules' isStaff() reads that claim directly instead of
 *    doing a cross-service firestore.get() the way it used to (and the way
 *    firestore.rules' own isStaff() still does for same-service Firestore
 *    reads — those are fine). Real incident, 5 Sep 2026: a genuinely active
 *    owner (staff/mohamedbliwa@gmail.com, active:true, confirmed via direct
 *    Admin SDK read) got "not recognized as active staff" on every image
 *    upload in production. Bisected live by temporarily dropping the staff
 *    check from storage.rules (any signed-in user, size/content-type still
 *    enforced) — the upload succeeded, isolating the failure to Storage's
 *    cross-service Firestore call itself, not anything in this app's rule
 *    logic or data (both verified correct: the exact same check, run against
 *    the exact same data, passes cleanly in the emulator). A custom claim
 *    lives on the ID token itself — no cross-service call, no staleness.
 *
 *    Trade-off worth knowing: the claim is only as fresh as the signed-in
 *    user's last actual sign-in. Deactivating someone (setStaffRole/
 *    removeStaff in lib/staff.ts) doesn't retroactively strip an
 *    already-issued token's claim — same gap Firebase's own docs describe
 *    for custom claims generally. Firestore-backed checks (Studio's own
 *    reads/writes, firestore.rules) stay immediately live either way.
 *
 * Geolocation is a plain HTTP call to ip-api.com's free, keyless endpoint
 * — reasonable for this project's volume, but it is a third party this
 * function now depends on being up. Every failure mode (no IP on the
 * event, the lookup erroring, the lookup timing out) fails open — a
 * contributor let through when the network hiccups is a far smaller
 * problem than every contributor locked out because a free geolocation API
 * had a bad minute.
 */

import { getFirestore } from "firebase-admin/firestore";
import { beforeUserSignedIn } from "firebase-functions/v2/identity";
import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { activeRoleOf } from "./staff";

const LOOKUP_TIMEOUT_MS = 3000;

async function isFromTunisia(ip: string): Promise<boolean | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=countryCode`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { countryCode?: string };
    return typeof data.countryCode === "string" ? data.countryCode === "TN" : null;
  } catch (err) {
    logger.warn("blocking: geolocation lookup failed, failing open", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// setGlobalOptions' region doesn't reach blocking functions the way it does
// every other trigger in index.ts — deploying without an explicit region
// here landed this one in us-east1 instead. Asking for europe-west1
// explicitly, to match the rest of this project, in case that was just a
// default rather than a genuine restriction on where blocking functions
// can run.
//
// Kept the exported name even though it now does more than geo-restriction
// (see the file comment above) — renaming a deployed function orphans the
// old one until it's explicitly deleted, not worth the churn for this.
export const enforceContributorGeoRestriction = beforeUserSignedIn({ region: "europe-west1" }, async (event) => {
  const email = event.data?.email;
  if (!email) return;

  const role = await activeRoleOf(email);

  if (role === "contributor") {
    const securitySnap = await getFirestore().collection("settings").doc("security").get();
    if (securitySnap.data()?.allowContributorsOutsideTunisia !== true && event.ipAddress) {
      const fromTunisia = await isFromTunisia(event.ipAddress);
      if (fromTunisia === false) {
        throw new HttpsError(
          "permission-denied",
          "Contributor access is currently limited to Tunisia. Ask an owner if this needs to change.",
        );
      }
      // true or null (lookup failed/timed out) both fall through to allow.
    }
  }

  // See the file comment's job #2 — refreshed on every sign-in, read by
  // storage.rules' isStaff().
  return { customClaims: { active_staff: role !== null } };
});
