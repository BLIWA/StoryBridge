"use client";

import { useState } from "react";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { MESSAGES, pill, type Message } from "@/content/seed";

/** Contact inbox + form settings, from "StoryBridge CMS.dc.html" (484–577). */

const FILTERS = ["New", "Replied", "Archived", "All"] as const;

export function InboxView() {
  const [tab, setTab] = useState<"messages" | "form">("messages");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("New");
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [selId, setSelId] = useState(MESSAGES[0].id);
  const [reply, setReply] = useState("");

  const visible = messages.filter((m) => filter === "All" || m.status === filter);
  const sel = messages.find((m) => m.id === selId) ?? visible[0] ?? messages[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "cms-fade .3s ease both" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {(
          [
            ["messages", "Submissions"],
            ["form", "Contact form fields"],
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
            </button>
          );
        })}

        {tab === "messages" && (
          <div style={{ display: "flex", gap: "8px", marginInlineStart: "auto" }}>
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: on ? 600 : 500,
                    color: on ? "#002D62" : "#8A8378",
                    borderBottom: `2px solid ${on ? "#B57D49" : "transparent"}`,
                    paddingBottom: "4px",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {tab === "messages" ? (
        <div style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "20px", alignItems: "start" }}>
          <div style={{ ...CARD, padding: 0 }}>
            {visible.map((m, i) => {
              const on = m.id === sel?.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelId(m.id)}
                  data-hover={on ? undefined : "background:#F8F4EE"}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "start",
                    background: on ? "#F8F4EE" : "transparent",
                    borderInlineStart: `3px solid ${on ? "#B57D49" : "transparent"}`,
                    borderTop: i === 0 ? "none" : "1px solid #EDE7DE",
                    border: i === 0 ? "none" : undefined,
                    padding: "16px 18px",
                    cursor: "pointer",
                    transition: "background .16s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#002D62" }}>{m.name}</div>
                    <Pill {...pill(m.status)}>{m.status}</Pill>
                  </div>
                  <div style={{ fontSize: "13px", color: "#3E4650", marginTop: "4px" }}>{m.subject}</div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: "10.5px",
                      color: "#8A8378",
                      marginTop: "5px",
                    }}
                  >
                    {m.org} · {m.when}
                  </div>
                </button>
              );
            })}
            {visible.length === 0 && (
              <div style={{ padding: "32px 18px", fontSize: "13.5px", color: "#8A8378", textAlign: "center" }}>
                Nothing here.
              </div>
            )}
          </div>

          {sel && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ ...CARD, gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Source Serif 4',serif",
                        fontSize: "24px",
                        fontWeight: 600,
                        color: "#002D62",
                      }}
                    >
                      {sel.subject}
                    </div>
                    <div style={{ fontSize: "13.5px", color: "#5A6472", marginTop: "4px" }}>
                      {sel.name} · {sel.org} ·{" "}
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "12.5px" }}>{sel.email}</span>
                    </div>
                  </div>
                  <Pill {...pill(sel.status)}>{sel.status}</Pill>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "12px",
                    borderBlock: "1px solid #EDE7DE",
                    padding: "14px 0",
                  }}
                >
                  {[
                    ["Service", sel.need],
                    ["Languages", sel.langs],
                    ["Deadline", sel.deadline],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={MONO_LABEL}>{k}</div>
                      <div style={{ fontSize: "13.5px", color: "#3E4650", marginTop: "5px" }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    fontFamily: "'Source Serif 4',serif",
                    fontSize: "16px",
                    lineHeight: 1.75,
                    color: "#111",
                  }}
                >
                  {sel.body}
                </div>
              </div>

              <div style={{ ...CARD, gap: "12px" }}>
                <div style={MONO_LABEL}>Reply</div>
                <textarea
                  rows={6}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={`Reply to ${sel.name}…`}
                  style={INPUT}
                />
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <PrimaryButton>Send reply</PrimaryButton>
                  <GhostButton
                    onClick={() =>
                      setMessages((prev) =>
                        prev.map((m) => (m.id === sel.id ? { ...m, status: "Replied" as const } : m)),
                      )
                    }
                  >
                    Mark replied
                  </GhostButton>
                  <GhostButton
                    onClick={() =>
                      setMessages((prev) =>
                        prev.map((m) => (m.id === sel.id ? { ...m, status: "Archived" as const } : m)),
                      )
                    }
                  >
                    Archive
                  </GhostButton>
                  <div style={{ fontSize: "12.5px", color: "#8A8378", marginInlineStart: "auto" }}>
                    Sends from hello@storybridge.tn
                  </div>
                </div>
                <NotWiredNote>
                  &ldquo;Send reply&rdquo; has no mail transport behind it yet — roadmap Phase 06. Status
                  changes are local to this session.
                </NotWiredNote>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "20px", alignItems: "start" }}>
          <div style={{ ...CARD, gap: "14px" }}>
            <div style={MONO_LABEL}>Contact form fields</div>
            {[
              { label: "Full name", type: "Text", req: "Required" },
              { label: "Work email", type: "Email", req: "Required" },
              { label: "Organisation", type: "Text", req: "Optional" },
              { label: "What do you need?", type: "Select", req: "Required" },
              { label: "Languages", type: "Text", req: "Optional" },
              { label: "Deadline", type: "Date", req: "Optional" },
              { label: "The brief", type: "Long text", req: "Required" },
            ].map((f, i) => (
              <div
                key={f.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) 110px 100px",
                  gap: "12px",
                  alignItems: "center",
                  paddingTop: i === 0 ? 0 : "12px",
                  borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#002D62" }}>{f.label}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#8A8378" }}>
                  {f.type}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#8F6135" }}>
                  {f.req}
                </div>
              </div>
            ))}
            <PrimaryButton style={{ alignSelf: "flex-start", marginTop: "6px" }}>Save form</PrimaryButton>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={CARD}>
              <div style={MONO_LABEL}>Routing</div>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Send submissions to</span>
                <input defaultValue="hello@storybridge.tn" style={INPUT} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Assign new enquiries to</span>
                <select style={INPUT} defaultValue="Round robin">
                  <option>Round robin</option>
                  <option>Assia Touati</option>
                  <option>Imen Bliwa</option>
                </select>
              </label>
            </div>

            <div style={CARD}>
              <div style={MONO_LABEL}>Protection &amp; consent</div>
              <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px", color: "#3E4650" }}>
                <input type="checkbox" defaultChecked style={{ width: "16px", height: "16px", accentColor: "#002D62" }} />
                Honeypot and rate limiting
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Consent line before submit</span>
                <textarea
                  rows={3}
                  defaultValue="We use what you send only to answer your enquiry. We never sell or share it."
                  style={INPUT}
                />
              </label>
            </div>

            <NotWiredNote>
              The live contact form does not post anywhere yet. Routing, spam checks and this inbox all depend
              on Cloud Functions — roadmap Phase 06.
            </NotWiredNote>
          </div>
        </div>
      )}
    </div>
  );
}
