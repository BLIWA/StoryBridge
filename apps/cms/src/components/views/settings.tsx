"use client";

import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, GhostButton, NotWiredNote } from "@/components/ui";
import { STAFF, ROLE_MATRIX } from "@/content/seed";

/** Settings & access from "StoryBridge CMS.dc.html" (lines 578–636). */

const headCell = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8A8378",
} as const;

export function SettingsView() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 360px",
        gap: "24px",
        alignItems: "start",
        animation: "cms-fade .3s ease both",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* People */}
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
            <GhostButton>Invite someone</GhostButton>
          </div>
          {STAFF.map((u, i) => (
            <div
              key={u.email}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.2fr) 110px minmax(0,1.3fr) 90px",
                gap: "16px",
                alignItems: "center",
                padding: "16px 22px",
                borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
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
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#002D62" }}>{u.name}</div>
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
              <Pill bg="#E5EBF3" fg="#002D62">
                {u.role}
              </Pill>
              <div style={{ fontSize: "13px", lineHeight: 1.5, color: "#5A6472" }}>{u.scope}</div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "11px",
                  color: u.mfa === "2FA on" ? "#2F6B4F" : "#A5342E",
                }}
              >
                {u.mfa}
              </div>
            </div>
          ))}
        </div>

        {/* Role matrix */}
        <div style={{ ...CARD, padding: 0 }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #E6E0D8" }}>
            <div style={MONO_LABEL}>What each role can touch</div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.6fr) repeat(4,80px)",
              gap: "12px",
              padding: "12px 22px",
              background: "#F8F4EE",
              borderBottom: "1px solid #E6E0D8",
            }}
          >
            <div style={headCell}>Capability</div>
            {["Owner", "Chief", "Journalist", "Contributor"].map((h) => (
              <div key={h} style={{ ...headCell, textAlign: "center" }}>
                {h}
              </div>
            ))}
          </div>
          {ROLE_MATRIX.map((r, i) => (
            <div
              key={r.cap}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.6fr) repeat(4,80px)",
                gap: "12px",
                padding: "13px 22px",
                alignItems: "center",
                borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
              }}
            >
              <div style={{ fontSize: "13.5px", color: "#3E4650" }}>{r.cap}</div>
              {[r.c1, r.c2, r.c3, r.c4].map((c, j) => (
                <div
                  key={j}
                  style={{
                    textAlign: "center",
                    fontSize: c === "●" ? "13px" : "13px",
                    color: c === "●" ? "#2F6B4F" : "#C9C2B8",
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={CARD}>
          <div style={MONO_LABEL}>Security</div>
          {[
            { label: "Require a second factor for all staff", def: true },
            { label: "Sign out inactive sessions after 12 hours", def: true },
            { label: "Allow contributor access from outside Tunisia", def: false },
          ].map((c) => (
            <label
              key={c.label}
              style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px", color: "#3E4650" }}
            >
              <input type="checkbox" defaultChecked={c.def} style={{ width: "16px", height: "16px", accentColor: "#002D62" }} />
              {c.label}
            </label>
          ))}
          <div style={{ borderTop: "1px solid #EDE7DE", paddingTop: "12px", marginTop: "4px" }}>
            <div style={MONO_LABEL}>Recent sign-ins</div>
            <div style={{ fontSize: "12.5px", lineHeight: 1.9, color: "#5A6472", marginTop: "6px" }}>
              Assia Touati · Tunis · today, 09:12
              <br />
              Imen Bliwa · Tunis · yesterday, 18:40
              <br />
              Contributor · Marseille · 19 Aug, 11:02
            </div>
          </div>
          <NotWiredNote>
            Roles and 2FA are display-only. Real enforcement needs Firebase custom claims plus Identity
            Platform MFA — roadmap Phase 04.
          </NotWiredNote>
        </div>

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
          <div style={{ fontSize: "12.5px", lineHeight: 1.65, color: "#8A8378" }}>
            Changes to language visibility take effect at the next publish.
          </div>
        </div>
      </div>
    </div>
  );
}
