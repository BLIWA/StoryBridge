"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { pill, type Message } from "@/content/seed";
import { watchSubmissions, setSubmissionStatus } from "@/lib/submissions";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { watchStaff, type StaffMember } from "@/lib/staff";
import {
  watchContactFormSettings,
  saveContactFormSettings,
  DEFAULT_CONTACT_FORM_SETTINGS,
  type ContactFormSettings,
} from "@/lib/contact-form-settings";

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

  const { can } = useAuth();
  const manages = can("editPages");

  const [staff, setStaff] = useState<StaffMember[]>([]);
  useEffect(() => {
    const { db } = getFirebase();
    return watchStaff(
      db,
      (list) => setStaff(list),
      () => setStaff([]),
    );
  }, []);
  const activeStaff = useMemo(() => staff.filter((s) => s.active), [staff]);
  const nameFor = (email: string) => staff.find((s) => s.email === email)?.name ?? email;

  // Real config for the public form — see lib/contact-form-settings.ts.
  // `formDraft` is what the CMS screen below edits, seeded from whatever's
  // actually saved and kept in sync with it unless the person has unsaved
  // edits in progress (formDirtyRef), so a change from another tab doesn't
  // clobber something half-typed here.
  const [formDraft, setFormDraft] = useState<ContactFormSettings>(DEFAULT_CONTACT_FORM_SETTINGS);
  const [formDirty, setFormDirty] = useState(false);
  const formDirtyRef = useRef(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formSaved, setFormSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const { db } = getFirebase();
    return watchContactFormSettings(
      db,
      (s) => {
        if (!formDirtyRef.current) setFormDraft(s);
      },
      () => {},
    );
  }, []);

  function editDraft(patch: (d: ContactFormSettings) => ContactFormSettings) {
    formDirtyRef.current = true;
    setFormDirty(true);
    setFormSaved(false);
    setFormDraft(patch);
  }

  async function saveForm() {
    if (!manages) return;
    setFormSaving(true);
    setFormError(null);
    try {
      await saveContactFormSettings(getFirebase().db, formDraft);
      formDirtyRef.current = false;
      setFormDirty(false);
      setFormSaved(true);
    } catch {
      setFormError("Couldn't save that. Check your connection and try again.");
    } finally {
      setFormSaving(false);
    }
  }

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
      const call = httpsCallable<
        { to: string; name: string; subject: string; body: string; originalMessage: string; submittedDate: string },
        { ok: true }
      >(getFirebase().functions, "sendReply");
      await call({
        to: sel.email,
        name: sel.name,
        subject: `Re: ${sel.subject}`,
        body: reply.trim(),
        originalMessage: sel.body,
        submittedDate: sel.when,
      });
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

                <div className="grid grid-cols-1 md:grid-cols-4"
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
                    ["Assigned to", sel.assignedTo ? nameFor(sel.assignedTo) : "Unassigned"],
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
                    Reply-to: contact@storybridge.news
                  </div>
                </div>
                <NotWiredNote>
                  &ldquo;Send reply&rdquo; is real — it calls the sendReply Cloud Function (functions/src/index.ts)
                  via Resend, sending as contact@storybridge.news now that the domain is verified (see
                  functions/src/resend.ts). A send failure surfaces here as an error rather than failing silently.
                  &ldquo;Mark replied&rdquo; and &ldquo;Archive&rdquo; were already real, saved to Firestore.
                </NotWiredNote>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]" style={{ gap: "20px", alignItems: "start" }}>
          <div style={{ ...CARD, gap: "14px" }}>
            <div style={MONO_LABEL}>Contact form fields</div>
            {(
              [
                { label: "Full name", type: "Text", key: null },
                { label: "Work email", type: "Email", key: null },
                { label: "Organisation", type: "Text", key: "organisation" },
                { label: "What do you need?", type: "Select", key: "need" },
                { label: "Languages", type: "Text", key: "languages" },
                { label: "Deadline", type: "Date", key: "deadline" },
                { label: "The brief", type: "Long text", key: null },
              ] as const
            ).map((f, i) => (
              <div
                key={f.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) 110px 130px",
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
                {f.key === null ? (
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", color: "#8F6135" }}>
                    Always required
                  </div>
                ) : (
                  <label
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: "11px",
                      color: "#8F6135",
                      opacity: manages ? 1 : 0.6,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formDraft.fields[f.key].required}
                      disabled={!manages}
                      onChange={(e) =>
                        editDraft((d) => ({
                          ...d,
                          fields: { ...d.fields, [f.key]: { required: e.target.checked } },
                        }))
                      }
                      style={{ width: "14px", height: "14px", accentColor: "#002D62" }}
                    />
                    Required
                  </label>
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "6px" }}>
              <PrimaryButton
                style={{ alignSelf: "flex-start" }}
                onClick={() => void saveForm()}
                disabled={!manages || !formDirty || formSaving}
              >
                {formSaving ? "Saving…" : "Save form"}
              </PrimaryButton>
              {formSaved && (
                <span role="status" style={{ fontSize: "12.5px", color: "#2F6B4F" }}>
                  Saved.
                </span>
              )}
              {formError && (
                <span role="alert" style={{ fontSize: "12.5px", color: "#A5342E" }}>
                  {formError}
                </span>
              )}
            </div>
            {!manages && (
              <div style={{ fontSize: "12.5px", color: "#8A8378" }}>Only an owner or chief can edit the contact form.</div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={CARD}>
              <div style={MONO_LABEL}>Routing</div>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Send submissions to</span>
                <input
                  value={formDraft.routing.sendTo}
                  disabled={!manages}
                  placeholder="Active owners & chiefs (default)"
                  onChange={(e) =>
                    editDraft((d) => ({ ...d, routing: { ...d.routing, sendTo: e.target.value } }))
                  }
                  style={INPUT}
                />
                {!formDraft.routing.sendTo && (
                  <span style={{ fontSize: "11.5px", color: "#8A8378" }}>
                    Blank means every active owner/chief gets notified (contact@storybridge.news if that list is
                    ever empty).
                  </span>
                )}
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Assign new enquiries to</span>
                <select
                  value={formDraft.routing.assignMode}
                  disabled={!manages}
                  onChange={(e) =>
                    editDraft((d) => ({ ...d, routing: { ...d.routing, assignMode: e.target.value } }))
                  }
                  style={INPUT}
                >
                  <option value="roundRobin">Round robin</option>
                  {activeStaff.map((s) => (
                    <option key={s.email} value={s.email}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={CARD}>
              <div style={MONO_LABEL}>Protection &amp; consent</div>
              <label
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  fontSize: "13.5px",
                  color: "#3E4650",
                  opacity: manages ? 1 : 0.6,
                }}
              >
                <input
                  type="checkbox"
                  checked={formDraft.protection.honeypotEnabled}
                  disabled={!manages}
                  onChange={(e) =>
                    editDraft((d) => ({ ...d, protection: { ...d.protection, honeypotEnabled: e.target.checked } }))
                  }
                  style={{ width: "16px", height: "16px", accentColor: "#002D62" }}
                />
                Honeypot
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Consent line before submit</span>
                <textarea
                  rows={3}
                  value={formDraft.protection.consentLine}
                  disabled={!manages}
                  onChange={(e) =>
                    editDraft((d) => ({ ...d, protection: { ...d.protection, consentLine: e.target.value } }))
                  }
                  style={INPUT}
                />
              </label>
            </div>

            <NotWiredNote>
              This screen is real now — everything on it lives in `settings/contactForm` (one document,
              public-read/staff-write per firestore.rules) and the live contact form, submitContact and
              onSubmissionCreated (functions/src/index.ts) all read it. Not editable here, by design: the field
              list itself (adding/removing/reordering, or changing a field&apos;s type) — that would mean the
              website form renders from an open-ended schema instead of fixed JSX, a bigger rewrite than this
              pass. There&apos;s also no real rate limiting anywhere in this project yet — the old &ldquo;Honeypot
              and rate limiting&rdquo; checkbox overstated what exists, so it&apos;s just &ldquo;Honeypot&rdquo; now.
            </NotWiredNote>
          </div>
        </div>
      )}
    </div>
  );
}
