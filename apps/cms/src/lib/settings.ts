/**
 * Project-level switches — currently just one, `settings/security`'s
 * `allowContributorsOutsideTunisia`, read by the enforceContributorGeoRestriction
 * Auth blocking function (functions/src/blocking.ts) and editable here by an
 * owner. See firestore.rules for why this is owner-only to write.
 */

import { doc, onSnapshot, setDoc, type Firestore } from "firebase/firestore";

export type SecuritySettings = {
  allowContributorsOutsideTunisia: boolean;
};

const DEFAULTS: SecuritySettings = { allowContributorsOutsideTunisia: false };

export function watchSecuritySettings(
  db: Firestore,
  onChange: (settings: SecuritySettings) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    doc(db, "settings", "security"),
    (snap) => {
      const data = snap.data();
      onChange({
        allowContributorsOutsideTunisia:
          typeof data?.allowContributorsOutsideTunisia === "boolean"
            ? data.allowContributorsOutsideTunisia
            : DEFAULTS.allowContributorsOutsideTunisia,
      });
    },
    onError,
  );
}

export async function setAllowContributorsOutsideTunisia(db: Firestore, allow: boolean): Promise<void> {
  await setDoc(doc(db, "settings", "security"), { allowContributorsOutsideTunisia: allow }, { merge: true });
}
