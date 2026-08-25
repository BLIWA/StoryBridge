"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CARD,
  FIELD_LABEL,
  INPUT,
  MONO_LABEL,
  Pill,
  GhostButton,
  NotWiredNote,
} from "@/components/ui";
import { InviteDialog } from "@/components/views/invite-dialog";
import { MfaCard } from "@/components/views/mfa-card";
import { useAuth } from "@/lib/auth-context";
import { getFirebase } from "@/lib/firebase";
import { watchSecuritySettings, setAllowContributorsOutsideTunisia } from "@/lib/settings";
import {
  watchStaff,
  setStaffRole,
  removeStaff,
  CAPABILITIES,
  ROLES,
  ROLE_LABEL,
  ROLE_SCOPE,
  normalizeEmail,
  type Capability,
  type Role,
  type StaffMember,
} from "@/lib/staff";

/**
 * Settings & access from "StoryBridge CMS.dc.html" (lines 578–636).
 *
 * People is live: the roster streams from Firestore's `staff` collection, and
 * adding, re-roling and removing all write to it. Everything below People is
 * still the board's static presentation — the Security and Site cards say so.
 */

const headCell = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8A8378",
} as const;

function roleTint(role: Role): { bg: string; fg: string } {
  return role === "owner" ? { bg: "#F6EADB", fg: "#8F6135" } : { bg: "#E5EBF3", fg: "#002D62" };
}

function PeopleCard() {
  const { user, can } = useAuth();
  const [members, setMembers] = useState<StaffMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  const manages = can("managePeople");
  const me = user?.email ? normalizeEmail(user.email) : "";

  useEffect(() => {
    const { db } = getFirebase();
    return watchStaff(
      db,
      (next) => {
        setMembers(next);
        setError(null);
      },
      () => setError("Couldn't load the team. Check your connection and reload."),
    );
  }, []);

  const ownerCount = useMemo(
    () => (members ?? []).filter((m) => m.role === "owner").length,
    [members],
  );

  async function act(email: string, run: () => Promise<void>, done: string) {
    setBusyEmail(email);
    setError(null);
    setNotice(null);
    try {
      await run();
      setNotice(done);
    } catch (err) {
      setError(
        (err as { code?: string })?.code === "permission-denied"
          ? "Only an owner can change people and access."
          : "That didn't save. Check your connection and try again.",
      );
    } finally {
      setBusyEmail(null);
    }
  }

  return (
    <div style={{ ...CARD, padding: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px",
          borderBottom: "1px solid #E6E0D8",
        }}
      >
        <div style={MONO_LABEL}>People &amp; permissions</div>
        {manages && <GhostButton onClick={() => setInviting(true)}>Invite someone</GhostButton>}
      </div>

      {(error || notice) && (
        <div
          role={error ? "alert" : "status"}
          style={{
            padding: "12px 22px",
            fontSize: "13px",
            lineHeight: 1.6,
            fontWeight: 500,
            color: error ? "#A5342E" : "#2F6B4F",
            background: error ? "#FBF0EF" : "#EFF5F1",
            borderBottom: "1px solid #E6E0D8",
          }}
        >
          {error ?? notice}
        </div>
      )}

      {members === null && (
        <div style={{ padding: "22px", fontSize: "13px", color: "#8A8378" }}>Loading the team…</div>
      )}

      {members?.length === 0 && (
        <div style={{ padding: "22px", fontSize: "13.5px", lineHeight: 1.7, color: "#5A6472" }}>
          Nobody on the team yet.
        </div>
      )}

      {/* The role/status columns are fixed-width and don't fit a phone
          screen alongside a name — scroll the list horizontally there
          rather than letting rows bleed past the card's edge. */}
      <div style={{ overflowX: "auto" }}>
      {members?.map((u, i) => {
        const isMe = u.email === me;
        // An owner can always be removed except when they are the last one, or
        // when they are you — losing your own access mid-session, or emptying
        // the owner seat entirely, both lock the CMS with no way back in.
        const lastOwner = u.role === "owner" && ownerCount <= 1;
        const locked = isMe || lastOwner;
        return (
          <div
            key={u.email}
            style={{
              display: "grid",
              gridTemplateColumns: manages
                ? "minmax(0,1.15fr) 132px minmax(0,1fr) 74px 72px"
                : "minmax(0,1.2fr) 110px minmax(0,1.3fr) 90px",
              gap: "16px",
              alignItems: "center",
              padding: "16px 22px",
              minWidth: manages ? "560px" : "480px",
              borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
              opacity: busyEmail === u.email ? 0.5 : 1,
              transition: "opacity .14s ease",
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center", minWidth: 0 }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  flex: "none",
                  backgroundImage: "repeating-linear-gradient(135deg,#E8E3DD 0 5px,#EFE1D2 5px 10px)",
                  border: "1px solid #D8D1C7",
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#002D62" }}>
                  {u.name}
                  {isMe && (
                    <span style={{ color: "#8A8378", fontWeight: 400 }}> · you</span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "11px",
                    color: "#8A8378",
                    marginTop: "3px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {u.email}
                </div>
              </div>
            </div>

            {manages && !locked ? (
              <select
                aria-label={`Role for ${u.name}`}
                value={u.role}
                disabled={busyEmail === u.email}
                onChange={(e) => {
                  const next = e.target.value as Role;
                  void act(
                    u.email,
                    () => setStaffRole(u.email, next),
                    `${u.name} is now ${ROLE_LABEL[next]}.`,
                  );
                }}
                style={{ ...INPUT, padding: "7px 8px", fontSize: "12.5px" }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            ) : (
              <Pill {...roleTint(u.role)}>{ROLE_LABEL[u.role]}</Pill>
            )}

            <div style={{ fontSize: "13px", lineHeight: 1.5, color: "#5A6472" }}>
              {ROLE_SCOPE[u.role]}
            </div>

            <div
              title={u.lastSignInAt ? "Has signed in at least once" : "Invite not taken up yet"}
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: "10.5px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: u.lastSignInAt ? "#2F6B4F" : "#8F6135",
              }}
            >
              {u.lastSignInAt ? "Active" : "Invited"}
            </div>

            {manages && (
              <div style={{ textAlign: "right" }}>
                {!locked && (
                  <button
                    type="button"
                    disabled={busyEmail === u.email}
                    onClick={() => {
                      if (!window.confirm(`Remove ${u.name}'s access to Studio?`)) return;
                      void act(u.email, () => removeStaff(u.email), `${u.name} no longer has access.`);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#A5342E",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>

      {!manages && (
        <div style={{ padding: "0 22px 18px" }}>
          <NotWiredNote>
            Only an owner can add or remove people. Ask one if this list needs to change.
          </NotWiredNote>
        </div>
      )}

      {inviting && (
        <InviteDialog
          onClose={() => setInviting(false)}
          onDone={(message) => {
            setInviting(false);
            setError(null);
            setNotice(message);
          }}
        />
      )}
    </div>
  );
}

function RoleMatrixCard() {
  const caps = Object.entries(CAPABILITIES) as [Capability, (typeof CAPABILITIES)[Capability]][];
  return (
    <div style={{ ...CARD, padding: 0 }}>
      <div style={{ padding: "18px 22px", borderBottom: "1px solid #E6E0D8" }}>
        <div style={MONO_LABEL}>What each role can touch</div>
      </div>
      <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.6fr) repeat(4,80px)",
          gap: "12px",
          padding: "12px 22px",
          background: "#F8F4EE",
          borderBottom: "1px solid #E6E0D8",
          minWidth: "460px",
        }}
      >
        <div style={headCell}>Capability</div>
        {ROLES.map((r) => (
          <div key={r} style={{ ...headCell, textAlign: "center" }}>
            {ROLE_LABEL[r]}
          </div>
        ))}
      </div>
      {caps.map(([key, cap], i) => (
        <div
          key={key}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.6fr) repeat(4,80px)",
            gap: "12px",
            padding: "13px 22px",
            alignItems: "center",
            minWidth: "460px",
            borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
          }}
        >
          <div style={{ fontSize: "13.5px", color: "#3E4650" }}>{cap.label}</div>
          {ROLES.map((r) => {
            const allowed = cap.roles.includes(r);
            return (
              <div
                key={r}
                style={{ textAlign: "center", fontSize: "13px", color: allowed ? "#2F6B4F" : "#C9C2B8" }}
              >
                <span aria-label={allowed ? "yes" : "no"}>{allowed ? "●" : "—"}</span>
              </div>
            );
          })}
        </div>
      ))}
      </div>
      <div style={{ padding: "0 22px 18px" }}>
        <NotWiredNote>
          This table is generated from the same role definitions firestore.rules enforces — it
          describes what the database actually allows, not just what the UI shows.
        </NotWiredNote>
      </div>
    </div>
  );
}

function SecurityCard() {
  const { can } = useAuth();
  const manages = can("managePeople");
  const [allowOutsideTunisia, setAllowOutsideTunisia] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { db } = getFirebase();
    return watchSecuritySettings(
      db,
      (settings) => setAllowOutsideTunisia(settings.allowContributorsOutsideTunisia),
      () => {},
    );
  }, []);

  async function toggle() {
    if (!manages) return;
    const next = !allowOutsideTunisia;
    setBusy(true);
    setError(null);
    try {
      await setAllowContributorsOutsideTunisia(getFirebase().db, next);
    } catch {
      setError("Couldn't save that. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={CARD}>
      <div style={MONO_LABEL}>Security</div>
      <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px", color: "#3E4650" }}>
        <input type="checkbox" checked disabled style={{ width: "16px", height: "16px", accentColor: "#002D62" }} />
        Sign out inactive sessions after 12 hours
      </label>
      <label
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          fontSize: "13.5px",
          color: "#3E4650",
          opacity: busy ? 0.6 : 1,
        }}
      >
        <input
          type="checkbox"
          checked={allowOutsideTunisia}
          disabled={!manages || busy}
          onChange={() => void toggle()}
          style={{ width: "16px", height: "16px", accentColor: "#002D62" }}
        />
        Allow contributor access from outside Tunisia
      </label>
      {error && (
        <p role="alert" style={{ fontSize: "13px", color: "#A5342E" }}>
          {error}
        </p>
      )}
      <NotWiredNote>
        The idle sign-out above is real (lib/idle-signout.ts) and fixed at 12 hours rather than configurable, so
        its checkbox stays checked and disabled instead of pretending it&apos;s a live setting. The geo-restriction
        switch is real too now — it&apos;s read by an Auth blocking function (functions/src/blocking.ts) that
        checks a signing-in contributor&apos;s IP against a free geolocation lookup, failing open (letting them
        in) if that lookup errors or times out rather than locking someone out over a third-party hiccup.{" "}
        {!manages && "Only an owner can change it."}
      </NotWiredNote>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]"
      style={{
        display: "grid",
        gap: "24px",
        alignItems: "start",
        animation: "cms-fade .3s ease both",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <PeopleCard />
        <RoleMatrixCard />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <MfaCard />

        <SecurityCard />

        <div style={CARD}>
          <div style={MONO_LABEL}>Site</div>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={FIELD_LABEL}>Default language</span>
            <select style={INPUT} defaultValue="English">
              <option>English</option>
              <option>Français</option>
              <option>العربية</option>
            </select>
          </label>
          {[
            { label: "Publish the Arabic version of the site", def: true },
            { label: "Publish the French version of the site", def: true },
            { label: "Maintenance notice on every page", def: false },
          ].map((c) => (
            <label
              key={c.label}
              style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px", color: "#3E4650" }}
            >
              <input type="checkbox" defaultChecked={c.def} style={{ width: "16px", height: "16px", accentColor: "#002D62" }} />
              {c.label}
            </label>
          ))}
          <NotWiredNote>
            Site settings aren&rsquo;t stored yet — a `settings/site` document lands with the content
            modules in Phase 05.
          </NotWiredNote>
        </div>
      </div>
    </div>
  );
}
