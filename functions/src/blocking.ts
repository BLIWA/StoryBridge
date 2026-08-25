/**
 * Enforces "Allow contributor access from outside Tunisia" (Settings →
 * Security in the CMS) — the one checkbox in that card that used to be
 * pure display, unlike the 2FA/idle-signout work elsewhere this project.
 *
 * Only contributors are geo-restricted; the board's original design never
 * asked for this on owner/chief/journalist, and this project doesn't
 * second-guess that. The switch itself lives in Firestore
 * (`settings/security`, `allowContributorsOutsideTunisia`), owner-editable
 * from Settings — see apps/cms/src/components/views/settings.tsx and
 * firestore.rules.
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
export const enforceContributorGeoRestriction = beforeUserSignedIn({ region: "europe-west1" }, async (event) => {
  const email = event.data?.email;
  if (!email) return;

  const role = await activeRoleOf(email);
  if (role !== "contributor") return;

  const securitySnap = await getFirestore().collection("settings").doc("security").get();
  if (securitySnap.data()?.allowContributorsOutsideTunisia === true) return;

  if (!event.ipAddress) return; // Nothing to check against — fail open, same reasoning as a failed lookup below.

  const fromTunisia = await isFromTunisia(event.ipAddress);
  if (fromTunisia === false) {
    throw new HttpsError(
      "permission-denied",
      "Contributor access is currently limited to Tunisia. Ask an owner if this needs to change.",
    );
  }
  // true or null (lookup failed/timed out) both fall through to allow.
});
