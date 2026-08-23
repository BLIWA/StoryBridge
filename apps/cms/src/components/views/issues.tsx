"use client";

import { useState } from "react";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { ISSUES, SUBSCRIBERS, BRIDGE_PICKS, pill } from "@/content/seed";

/** The Bridge — issues + subscribers, from "StoryBridge CMS.dc.html" (404–483). */

const headCell = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8A8378",
} as const;

const SUB_GRID = "minmax(0,1.4fr) 1fr 60px 130px 120px";

export function IssuesView() {
  const [tab, setTab] = useState<"issues" | "subs">("issues");
  const [subject, setSubject] = useState("The Bridge · No. 08 — What a brief is for");
  const [preheader, setPreheader] = useState("Plus: three Arabic headlines we argued about for an hour.");
  const [audience, setAudience] = useState("All subscribers · 1,904");
  const [sendAt, setSendAt] = useState("01 Sep 2026 · 09:00 CET");
  const [picks, setPicks] = useState(() => Object.fromEntries(BRIDGE_PICKS.map((p) => [p.id, p.on])));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "cms-fade .3s ease both" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        {(
          [
            ["issues", "Issues"],
            ["subs", "Subscribers"],
          ] as const
        ).map(([k, label]) => {
          const on = tab === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              style={{
                background: on ? "#002D62" : "#FDF8F1",
                color: on ? "#FDF8F1" : "#3E4650",
                border: `1px solid ${on ? "#002D62" : "#D8D1C7"}`,
                borderRadius: "4px",
                padding: "9px 16px",
                fontSize: "13.5px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {label}
              {k === "subs" && (
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "11px",
                    opacity: 0.75,
                    marginInlineStart: "6px",
                  }}
                >
                  1,904
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "issues" ? (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "20px", alignItems: "start" }}>
          {/* Archive */}
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
              <div style={MONO_LABEL}>The Bridge · archive</div>
              <div style={{ fontSize: "12.5px", color: "#8A8378" }}>Monthly since February</div>
            </div>
            {ISSUES.map((iss, i) => (
              <div
                key={iss.no}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px minmax(0,1fr) 92px 180px",
                  gap: "16px",
                  alignItems: "center",
                  padding: "16px 22px",
                  borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "22px",
                    color: "#B57D49",
                    fontWeight: 600,
                  }}
                >
                  {iss.no}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#002D62", lineHeight: 1.35 }}>
                    {iss.subject}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#5A6472", marginTop: "3px" }}>
                    {iss.date} · {iss.audience}
                  </div>
                </div>
                <Pill {...pill(iss.status)}>{iss.status}</Pill>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11.5px", color: "#5A6472" }}>
                  {iss.stats}
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ ...CARD, gap: "16px" }}>
              <div>
                <div style={MONO_LABEL}>Compose · No. 08</div>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#002D62",
                    marginTop: "6px",
                  }}
                >
                  September letter
                </div>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Subject line</span>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} style={INPUT} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Preview text</span>
                <input value={preheader} onChange={(e) => setPreheader(e.target.value)} style={INPUT} />
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={FIELD_LABEL}>Included pieces</span>
                {BRIDGE_PICKS.map((p) => (
                  <label
                    key={p.id}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      fontSize: "13.5px",
                      color: "#3E4650",
                      lineHeight: 1.5,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={picks[p.id]}
                      onChange={(e) => setPicks((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                      style={{ width: "16px", height: "16px", accentColor: "#002D62", marginTop: "2px", flex: "none" }}
                    />
                    {p.title}
                  </label>
                ))}
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Audience</span>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} style={INPUT}>
                  <option>All subscribers · 1,904</option>
                  <option>English · 1,048</option>
                  <option>Français · 512</option>
                  <option>العربية · 344</option>
                  <option>Clients only · 87</option>
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Send at</span>
                <input value={sendAt} onChange={(e) => setSendAt(e.target.value)} style={INPUT} />
              </label>

              <div style={{ display: "flex", gap: "10px" }}>
                <GhostButton>Send test</GhostButton>
                <PrimaryButton>Schedule</PrimaryButton>
              </div>
            </div>

            <NotWiredNote>
              No sending pipeline exists yet. Scheduling and delivery need Cloud Functions plus a transactional
              email provider — roadmap Phase 06. Nothing here reaches a subscriber.
            </NotWiredNote>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px" }}>
            {[
              ["Active", "1,904"],
              ["Open rate", "48.2%"],
              ["Unsubscribes", "6"],
              ["Growth in Aug", "+86"],
            ].map(([k, v]) => (
              <div key={k} style={CARD}>
                <div style={MONO_LABEL}>{k}</div>
                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "32px",
                    lineHeight: 1,
                    color: "#002D62",
                    fontWeight: 600,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "10px", marginInlineStart: "auto" }}>
              <GhostButton>Export CSV</GhostButton>
              <GhostButton>Add subscriber</GhostButton>
            </div>
          </div>

          <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: SUB_GRID,
                gap: "16px",
                padding: "14px 22px",
                borderBottom: "1px solid #E6E0D8",
                background: "#F8F4EE",
              }}
            >
              <div style={headCell}>Email</div>
              <div style={headCell}>Name</div>
              <div style={headCell}>Lang</div>
              <div style={headCell}>Source</div>
              <div style={headCell}>Joined</div>
            </div>
            {SUBSCRIBERS.map((s, i) => (
              <div
                key={s.email}
                data-hover="background:#F8F4EE"
                style={{
                  display: "grid",
                  gridTemplateColumns: SUB_GRID,
                  gap: "16px",
                  alignItems: "center",
                  padding: "14px 22px",
                  borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                  transition: "background .16s ease",
                }}
              >
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "12.5px", color: "#002D62" }}>
                  {s.email}
                </div>
                <div style={{ fontSize: "13.5px", color: "#3E4650" }}>{s.name}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "12px", color: "#5A6472" }}>
                  {s.lang}
                </div>
                <div style={{ fontSize: "13px", color: "#5A6472" }}>{s.source}</div>
                <div style={{ fontSize: "12.5px", color: "#5A6472" }}>{s.joined}</div>
              </div>
            ))}
          </div>

          <NotWiredNote>
            Sample subscribers from the design board. The real list lives in Firestore once the signup form is
            wired up — roadmap Phase 06.
          </NotWiredNote>
        </div>
      )}
    </div>
  );
}
