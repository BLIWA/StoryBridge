"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { getFirebase, isFirebaseConfigured } from "./firebase";
import {
  fetchOwnStaff,
  touchLastSignIn,
  can as roleCan,
  type Capability,
  type Role,
  type StaffMember,
} from "./staff";

/**
 * Access is two questions, not one:
 *   1. Is this a real Firebase user?  → `user`
 *   2. Are they on the StoryBridge team?  → `staff`
 *
 * Anyone can obtain (1) — the sign-in screen is on the public internet and the
 * project allows self-registration. Only (2) opens Studio, and firestore.rules
 * makes the same check on every read and write, so a user stuck at (1) can see
 * nothing regardless of what the UI does.
 */

type AuthState = {
  user: User | null;
  staff: StaffMember | null;
  role: Role | null;
  /** True while either the Firebase session or the staff record is still resolving. */
  loading: boolean;
  /** False until NEXT_PUBLIC_FIREBASE_* is filled in — see .env.example. */
  configured: boolean;
  can: (capability: Capability) => boolean;
  signOut: () => Promise<void>;
  /** Re-reads the signed-in user's own staff record (e.g. after a role change). */
  refreshStaff: () => Promise<void>;
};

const Ctx = createContext<AuthState>({
  user: null,
  staff: null,
  role: null,
  loading: true,
  configured: false,
  can: () => false,
  signOut: async () => {},
  refreshStaff: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  // Seeded from `configured` rather than flipped in the effect: with no config
  // there is no session to wait for, so starting at `true` would only mean an
  // extra render to say so.
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) return;
    const { auth, db } = getFirebase();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u?.email) {
        setStaff(null);
        setLoading(false);
        return;
      }
      // Signed in, but Studio stays closed until the staff record comes back.
      setLoading(true);
      void fetchOwnStaff(db, u.email)
        .then((member) => {
          setStaff(member);
          if (member) void touchLastSignIn(db, u.email!);
        })
        .finally(() => setLoading(false));
    });
  }, [configured]);

  async function refreshStaff() {
    if (!configured || !user?.email) return;
    setStaff(await fetchOwnStaff(getFirebase().db, user.email));
  }

  const role = staff?.role ?? null;

  return (
    <Ctx.Provider
      value={{
        user,
        staff,
        role,
        loading,
        configured,
        can: (capability) => roleCan(role, capability),
        signOut: async () => {
          if (configured) await fbSignOut(getFirebase().auth);
          setStaff(null);
        },
        refreshStaff,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
