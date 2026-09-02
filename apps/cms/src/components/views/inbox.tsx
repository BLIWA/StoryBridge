"use client";

import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { pill, type Message } from "@/content/seed";
import { watchSubmissions, setSubmissionStatus } from "@/lib/submissions";
import { getFirebase } from "@/lib/firebase";

/** Contact inbox + form settings, from "StoryBridge CMS.dc.html" (484–577). */

const FILTERS = ["New", "Replied", "Archived", "All"] as const;

export function InboxView({ initialSelectedId }: { initialSelectedId?: string } = {}) {
  const [tab, setTab] = useState<"messages" | "form">("messages");
  // "All" rather than the usual default "New" when arriving with a specific
  // message already picked (from a search result) — otherwise a Replied or
  // Archived match would be shown in the detail pane but invisible, filtered
  // out, in the list beside it.
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>(initialSelectedId ? "All" : "New");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selId, setSelId] = useState<string | null>(initialSelectedId ?? null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySent, setReplySent] = useState(false);

  useEffect(() => {
    const { db } = getFirebase();
    return watchSubmissions(
      db,
      (list) => setMessages(list),
      () => setMessages([]),
    );
  }, []);

  const visible = messages.filter((m) => filter === "All" || m.status === filter);
  const sel = messages.find((m) => m.id === selId) ?? visible[0] ?? messages[0];

  async function sendReply() {
    if (!sel || !reply.trim()) return;
    setSending(true);
    setReplyError(null);
    setReplySent(false);
    try {
      const call = httpsCallable<{ to: string; name: string; subject: string; body: string }, { ok: true }>(
        getFirebase().functions,
        "sendReply",
      );
      await call({ to: sel.email, name: sel.name, subject: `Re: ${sel.subject}`, body: reply.trim() });
      await setSubmissionStatus(getFirebase().db, sel.id, "Replied");
      setReply("");
      setReplySent(true);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      setReplyError(message || "Couldn't send that. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

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
        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]" style={{ gap: "20px", alignItems: "start" }}>
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

                <div className="grid grid-cols-1 md:grid-cols-3"
                  style={{
                    display: "grid",
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
                  onChange={(e) => {
                    setReply(e.target.value);
                    setReplySent(false);
                  }}
                  placeholder={`Reply to ${sel.name}…`}
                  style={INPUT}
                />
                {replyError && (
                  <div role="alert" style={{ fontSize: "13px", color: "#A5342E", lineHeight: 1.6 }}>
                    {replyError}
                  </div>
                )}
                {replySent && (
                  <div role="status" style={{ fontSize: "13px", color: "#2F6B4F" }}>
                    Sent to {sel.email}.
                  </div>
                )}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <PrimaryButton onClick={() => void sendReply()} disabled={sending || !reply.trim()}>
                    {sending ? "Sending…" : "Send reply"}
                  </PrimaryButton>
                  <GhostButton onClick={() => void setSubmissionStatus(getFirebase().db, sel.id, "Replied")}>
                    Mark replied
                  </GhostButton>
                  <GhostButton onClick={() => void setSubmissionStatus(getFirebase().db, sel.id, "Archived")}>
                    Archive
                  </GhostButton>
                  <div style={{ fontSize: "12.5px", color: "#8A8378", marginInlineStart: "auto" }}>
                    Reply-to: hello@storybridge.news
                  </div>
                </div>
                <NotWiredNote>
                  &ldquo;Send reply&rdquo; is real now — it calls the sendReply Cloud Function (functions/src/index.ts)
                  via Resend. Until storybridge.news is a verified Resend sending domain, it can only actually deliver to
                  the Resend account owner&apos;s own address (see functions/src/resend.ts) — every other recipient
                  will show an error here rather than fail silently. &ldquo;Mark replied&rdquo; and
                  &ldquo;Archive&rdquo; were already real, saved to Firestore.
                </NotWiredNote>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]" style={{ gap: "20px", alignItems: "start" }}>
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
                <input defaultValue="hello@storybridge.news" style={INPUT} />
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
              The live contact form now goes through the submitContact Cloud Function (functions/src/index.ts):
              it checks a reCAPTCHA v3 token — once one is registered, see .env.production — before writing to
              Firestore, and every new submission emails the active owner/chief roster via Resend. What&apos;s
              still the board&apos;s static presentation: the fields list, the routing address (in practice it&apos;s
              &ldquo;every active owner and chief,&rdquo; with hello@storybridge.news as the fallback if that list
              is ever empty) and the consent line below.
            </NotWiredNote>
          </div>
        </div>
      )}
    </div>
  );
}
