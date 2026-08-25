"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { httpsCallable } from "firebase/functions";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { getFirebase } from "@/lib/firebase";
import { watchSubscribers, type Subscriber } from "@/lib/subscribers";
import { pill, type Article } from "@/content/seed";
import {
  AUDIENCE_LABEL,
  watchIssues,
  nextIssueNo,
  newIssueId,
  createIssue,
  saveIssue,
  watchBridgeLog,
  appendLogEntry,
  type AudienceId,
  type Issue,
  type ScheduleAction,
  type ScheduleEvent,
} from "@/lib/bridge-issues";
import {
  DEFAULT_ZONE,
  ZONES,
  formatDate,
  formatSlot,
  formatStamp,
  relative,
  scheduleProblems,
  toInstant,
  todayIn,
  zone,
} from "@/lib/schedule";

/**
 * The Bridge — compose, schedule and subscribers, from "StoryBridge CMS.dc.html"
 * (404–483). Issues and their activity log are real Firestore documents
 * (lib/bridge-issues.ts) and a real send actually happens: a Scheduled
 * issue is picked up by sendScheduledBridgeIssues (functions/src/index.ts),
 * which runs every 5 minutes. What's composed here is exactly what a
 * subscriber gets — "Included pieces" is real published articles, and
 * "Audience" is a real count of real subscribers by language, not a
 * fabricated segment.
 */

const headCell: CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8A8378",
};

const MONO: CSSProperties = { fontFamily: "'IBM Plex Mono',monospace" };

const SUB_GRID = "minmax(0,1.4fr) 1fr 60px 130px 120px";
const LOG_GRID = "148px 104px minmax(0,1fr) 132px";

const num = (n: number) => n.toLocaleString("en-US");

type Tab = "issues" | "schedule" | "subs";

const AUDIENCE_IDS: readonly AudienceId[] = ["all", "en", "fr", "ar"];

const LOG_FILTERS: Array<{ key: string; label: string; actions: ScheduleAction[] }> = [
  { key: "all", label: "Everything", actions: [] },
  { key: "scheduled", label: "Scheduled", actions: ["Scheduled", "Rescheduled"] },
  { key: "canceled", label: "Canceled", actions: ["Canceled"] },
  { key: "sent", label: "Sent", actions: ["Sent"] },
  { key: "tests", label: "Tests & drafts", actions: ["Test sent", "Draft saved"] },
];

export function IssuesView({ articles }: { articles: Article[] }) {
  const { user, staff, can } = useAuth();
  const actor = staff?.name || user?.displayName || user?.email || "Signed in";
  const canSend = can("sendNewsletter");

  const [tab, setTab] = useState<Tab>("issues");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [log, setLog] = useState<ScheduleEvent[]>([]);
  const [logFilter, setLogFilter] = useState("all");
  const [flash, setFlash] = useState<{ n: number; text: string } | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    const { db } = getFirebase();
    return watchSubscribers(
      db,
      (list) => setSubscribers(list),
      () => setSubscribers([]),
    );
  }, []);

  useEffect(() => {
    const { db } = getFirebase();
    return watchIssues(
      db,
      (list) => setIssues(list),
      () => setIssues([]),
    );
  }, []);

  useEffect(() => {
    const { db } = getFirebase();
    return watchBridgeLog(
      db,
      (list) => setLog(list),
      () => setLog([]),
    );
  }, []);

  /** Real published pieces a letter can feature — replaces the board's fixed BRIDGE_PICKS list. */
  const publishedPicks = useMemo(
    () => articles.filter((a) => a.status === "Published").map((a) => ({ id: a.id, title: a.title })),
    [articles],
  );

  /** Real subscriber counts per segment — replaces the board's fabricated AUDIENCES counts. */
  const audienceCounts = useMemo(() => {
    const subscribed = subscribers.filter((s) => s.status === "Subscribed");
    const counts: Record<AudienceId, number> = { all: subscribed.length, en: 0, fr: 0, ar: 0 };
    for (const s of subscribed) {
      const lang = s.lang.toLowerCase();
      if (lang === "en" || lang === "fr" || lang === "ar") counts[lang] += 1;
    }
    return counts;
  }, [subscribers]);

  /**
   * null until the browser has hydrated, then a timestamp that moves every half
   * minute. Every relative time below is null-guarded because of it — see the
   * clock at the bottom of this file for why it has to start empty.
   */
  const now = useSyncExternalStore(subscribeToClock, readClock, readClockOnPrerender);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  function say(text: string) {
    setFlash((prev) => ({ n: (prev?.n ?? 0) + 1, text }));
  }

  function patch(id: string, next: Partial<Issue>) {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, ...next } : i)));
  }

  async function logAction(issue: Issue, action: ScheduleAction, detail: string, by = actor) {
    try {
      await appendLogEntry(getFirebase().db, { issueNo: issue.no, subject: issue.subject, action, detail, actor: by });
    } catch {
      // The activity log is a record of what happened, not a gate on it — a
      // failed log write shouldn't undo (or even report as failed) the
      // action it was describing.
    }
  }

  /**
   * The letter on the desk. Defaults to the newest issue that has not gone out,
   * but the Schedule tab can point the composer at a specific queued issue — so
   * "Reschedule" on the third row in the queue edits that row, not whichever
   * issue happened to be first. Undefined only when there truly is nothing to
   * compose yet — a fresh project, before anyone has clicked "New letter."
   */
  const [composingId, setComposingId] = useState<string | null>(null);
  const composing =
    (composingId ? issues.find((i) => i.id === composingId) : undefined) ??
    issues.find((i) => i.status !== "Sent") ??
    issues[0];

  const audLabel = composing ? AUDIENCE_LABEL[composing.audienceId] : "";
  const audCount = composing ? audienceCounts[composing.audienceId] : 0;

  /** Holds the slot an issue had before "Reschedule" was pressed, for the diff and for undo. */
  const [rescheduling, setRescheduling] = useState<{ date: string | null; time: string | null; zone: string } | null>(
    null,
  );
  const locked = composing?.status === "Scheduled" && !rescheduling;

  const problems = composing
    ? scheduleProblems({
        subject: composing.subject,
        preheader: composing.preheader,
        pickCount: composing.pickArticleIds.length,
        recipients: audCount,
        date: composing.date,
        time: composing.time,
        zoneId: composing.zone,
        nowMs: now,
      })
    : [];

  const instant = composing ? toInstant(composing.date, composing.time, composing.zone) : null;

  const queue = useMemo(
    () =>
      issues
        .filter((i) => i.status === "Scheduled")
        .map((i) => ({ issue: i, at: toInstant(i.date, i.time, i.zone) }))
        .sort((a, b) => (a.at ?? Infinity) - (b.at ?? Infinity)),
    [issues],
  );

  const lastSent = issues.find((i) => i.status === "Sent") ?? null;

  const history = useMemo(() => {
    const chosen = LOG_FILTERS.find((f) => f.key === logFilter) ?? LOG_FILTERS[0];
    return chosen.actions.length === 0 ? log : log.filter((e) => chosen.actions.includes(e.action));
  }, [log, logFilter]);

  // ---- actions -------------------------------------------------------------

  async function newIssue() {
    const { db } = getFirebase();
    const blank: Issue = {
      id: newIssueId(db),
      no: nextIssueNo(issues),
      subject: "",
      preheader: "",
      date: null,
      time: null,
      zone: DEFAULT_ZONE,
      audienceId: "all",
      pickArticleIds: [],
      status: "Draft",
      sendAt: null,
      recipients: null,
      stats: "— · —",
    };
    setIssues((prev) => [blank, ...prev]);
    setComposingId(blank.id);
    setRescheduling(null);
    setTab("issues");
    try {
      await createIssue(db, blank);
    } catch {
      say("Couldn't create that draft — check your connection.");
    }
  }

  function togglePick(id: string) {
    if (!composing) return;
    const has = composing.pickArticleIds.includes(id);
    patch(composing.id, {
      pickArticleIds: has ? composing.pickArticleIds.filter((p) => p !== id) : [...composing.pickArticleIds, id],
    });
  }

  async function saveDraft() {
    if (!composing) return;
    try {
      await saveIssue(getFirebase().db, composing);
      await logAction(
        composing,
        "Draft saved",
        `${composing.pickArticleIds.length} piece${composing.pickArticleIds.length === 1 ? "" : "s"} · ${audLabel}`,
      );
      say("Draft saved.");
    } catch {
      say("Couldn't save — check your connection.");
    }
  }

  /**
   * Calls sendBridgeTest (functions/src/index.ts), which re-checks the
   * sendNewsletter capability server-side and emails one real copy to the
   * caller's own address via Resend.
   */
  async function sendTest() {
    if (!composing) return;
    setSendingTest(true);
    try {
      const send = httpsCallable<{ subject: string; preheader: string; picks: string[] }, { ok: true }>(
        getFirebase().functions,
        "sendBridgeTest",
      );
      await send({
        subject: composing.subject,
        preheader: composing.preheader,
        picks: composing.pickArticleIds.map((id) => publishedPicks.find((p) => p.id === id)?.title ?? id),
      });
      await logAction(composing, "Test sent", `Test copy sent to ${user?.email ?? "the desk"}`);
      say(`Sent — check ${user?.email ?? "your inbox"}.`);
    } catch {
      say("Couldn't send that test. Check your connection and try again.");
    } finally {
      setSendingTest(false);
    }
  }

  /**
   * Writes the issue's whole current draft state, not just the schedule
   * fields — "Schedule send" is also the point at which unsaved subject/
   * pick edits become real. sendAt is the instant sendScheduledBridgeIssues
   * actually watches for; date/time/zone stay too, so the composer has
   * something to show back.
   */
  async function confirmSchedule() {
    if (!composing || problems.length > 0 || !canSend) return;
    const was = rescheduling;
    const slot = formatSlot(composing.date, composing.time, composing.zone);
    const moved = was && (was.date !== composing.date || was.time !== composing.time || was.zone !== composing.zone);
    const sendAt = toInstant(composing.date, composing.time, composing.zone);
    const next: Issue = { ...composing, status: "Scheduled", sendAt };

    patch(composing.id, { status: "Scheduled", sendAt });
    setRescheduling(null);

    try {
      await saveIssue(getFirebase().db, next);
      if (moved) {
        await logAction(
          next,
          "Rescheduled",
          `Moved from ${formatSlot(was.date, was.time, was.zone, "short")} to ${formatSlot(composing.date, composing.time, composing.zone, "short")}`,
        );
        say(`No. ${composing.no} moved to ${slot}.`);
      } else if (was) {
        await logAction(next, "Scheduled", `Re-confirmed for ${slot} · ${audLabel} · ${num(audCount)} recipients`);
        say(`No. ${composing.no} kept at ${slot}.`);
      } else {
        await logAction(next, "Scheduled", `${slot} · ${audLabel} · ${num(audCount)} recipients`);
        say(`No. ${composing.no} scheduled for ${slot}. It sends automatically within 5 minutes of that time.`);
      }
    } catch {
      say("Couldn't schedule that — check your connection and try again.");
    }
  }

  function startReschedule(issue: Issue) {
    setComposingId(issue.id);
    setRescheduling({ date: issue.date, time: issue.time, zone: issue.zone });
    setTab("issues");
  }

  function keepCurrent() {
    if (!composing || !rescheduling) return;
    patch(composing.id, { date: rescheduling.date, time: rescheduling.time, zone: rescheduling.zone });
    setRescheduling(null);
  }

  async function cancelSchedule(issue: Issue) {
    if (!canSend) return;
    const next: Issue = { ...issue, status: "Draft", sendAt: null };
    patch(issue.id, { status: "Draft", sendAt: null });
    setRescheduling(null);
    try {
      await saveIssue(getFirebase().db, next);
      await logAction(next, "Canceled", `Was set for ${formatSlot(issue.date, issue.time, issue.zone, "short")} — back to draft`);
      say(`No. ${issue.no} is a draft again. Nothing is queued for it.`);
    } catch {
      say("Couldn't cancel that — check your connection and try again.");
    }
  }

  // ---- render --------------------------------------------------------------

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "cms-fade .3s ease both" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {(
          [
            ["issues", "Issues", null],
            ["schedule", "Schedule", queue.length ? String(queue.length) : null],
            ["subs", "Subscribers", num(audienceCounts.all)],
          ] as const
        ).map(([k, label, badge]) => {
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
              {badge && (
                <span style={{ ...MONO, fontSize: "11px", opacity: 0.75, marginInlineStart: "6px" }}>{badge}</span>
              )}
            </button>
          );
        })}

        <GhostButton onClick={() => void newIssue()} style={{ marginInlineStart: "auto" }}>
          New letter
        </GhostButton>

        {flash && (
          <div
            key={flash.n}
            role="status"
            style={{
              ...MONO,
              fontSize: "11px",
              letterSpacing: "0.06em",
              color: "#2F6B4F",
              background: "#E9F2EC",
              border: "1px solid #CBE0D3",
              borderRadius: "3px",
              padding: "8px 12px",
              animation: "cms-fade .3s ease both",
            }}
          >
            {flash.text}
          </div>
        )}
      </div>

      {tab === "issues" && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.85fr)_minmax(440px,1.15fr)]"
          style={{
            display: "grid",
            gap: "20px",
            alignItems: "start",
          }}
        >
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
              <div style={{ fontSize: "12.5px", color: "#8A8378" }}>{issues.length} letter{issues.length === 1 ? "" : "s"}</div>
            </div>
            {issues.length === 0 && <Empty>Nothing composed yet. &ldquo;New letter&rdquo; starts one.</Empty>}
            {issues.map((iss, i) => {
              const recipients = iss.recipients ?? audienceCounts[iss.audienceId];
              return (
                <button
                  key={iss.id}
                  type="button"
                  onClick={() => {
                    setComposingId(iss.id);
                    setRescheduling(null);
                  }}
                  data-hover={iss.id === composing?.id ? undefined : "background:#F8F4EE"}
                  style={{
                    display: "grid",
                    width: "100%",
                    textAlign: "start",
                    background: iss.id === composing?.id ? "#F8F4EE" : "transparent",
                    border: "none",
                    borderInlineStart: `3px solid ${iss.id === composing?.id ? "#B57D49" : "transparent"}`,
                    gridTemplateColumns: "40px minmax(0,1fr) auto",
                    gap: "14px",
                    alignItems: "start",
                    padding: "16px 22px",
                    borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                    cursor: "pointer",
                    transition: "background .16s ease",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Source Serif 4',serif",
                      fontSize: "22px",
                      color: "#B57D49",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {iss.no}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#002D62", lineHeight: 1.35 }}>
                      {iss.subject || "Untitled letter"}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#5A6472", marginTop: "4px" }}>
                      {iss.status === "Draft" && !iss.date
                        ? "No send time set"
                        : formatSlot(iss.date, iss.time, iss.zone, "short")}{" "}
                      · {num(recipients)} recipients
                    </div>
                    {iss.status === "Sent" && (
                      <div style={{ ...MONO, fontSize: "11.5px", color: "#5A6472", marginTop: "4px" }}>{iss.stats}</div>
                    )}
                  </div>
                  <Pill {...pill(iss.status)}>{iss.status}</Pill>
                </button>
              );
            })}
          </div>

          {/* Composer */}
          {!composing ? (
            <div style={{ ...CARD, alignItems: "flex-start", gap: "12px" }}>
              <div style={MONO_LABEL}>Compose</div>
              <p style={{ fontSize: "13.5px", color: "#5A6472", lineHeight: 1.6 }}>
                Nothing to compose yet — start The Bridge&apos;s first letter.
              </p>
              <PrimaryButton onClick={() => void newIssue()}>New letter</PrimaryButton>
            </div>
          ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ ...CARD, gap: "18px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <div style={MONO_LABEL}>Compose · No. {composing.no}</div>
                  <div
                    style={{
                      fontFamily: "'Source Serif 4',serif",
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "#002D62",
                      marginTop: "6px",
                    }}
                  >
                    {monthName(composing.date)} letter
                  </div>
                </div>
                <Pill {...pill(composing.status)}>{composing.status}</Pill>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>
                  Subject line
                  <span style={{ ...MONO, fontSize: "11px", color: "#8A8378", marginInlineStart: "8px" }}>
                    {composing.subject.length}/90
                  </span>
                </span>
                <input
                  value={composing.subject}
                  onChange={(e) => patch(composing.id, { subject: e.target.value })}
                  style={INPUT}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Preview text</span>
                <input
                  value={composing.preheader}
                  onChange={(e) => patch(composing.id, { preheader: e.target.value })}
                  style={INPUT}
                />
              </label>

              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <span style={FIELD_LABEL}>
                    Included pieces
                    <span style={{ ...MONO, fontSize: "11px", color: "#8A8378", marginInlineStart: "8px" }}>
                      {composing.pickArticleIds.length} of {publishedPicks.length}
                    </span>
                  </span>
                  {publishedPicks.length === 0 && (
                    <div style={{ fontSize: "12.5px", color: "#8A8378", lineHeight: 1.6 }}>
                      No published articles yet — publish something in the Journal to feature it here.
                    </div>
                  )}
                  {publishedPicks.map((p) => (
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
                        checked={composing.pickArticleIds.includes(p.id)}
                        onChange={() => togglePick(p.id)}
                        style={{ width: "16px", height: "16px", accentColor: "#002D62", marginTop: "2px", flex: "none" }}
                      />
                      {p.title}
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={FIELD_LABEL}>Audience</span>
                    <select
                      value={composing.audienceId}
                      onChange={(e) => patch(composing.id, { audienceId: e.target.value as AudienceId })}
                      style={INPUT}
                    >
                      {AUDIENCE_IDS.map((id) => (
                        <option key={id} value={id}>
                          {AUDIENCE_LABEL[id]} · {num(audienceCounts[id])}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div
                    style={{
                      border: "1px solid #E6E0D8",
                      borderRadius: "6px",
                      padding: "14px 16px",
                      background: "#FFFFFF",
                    }}
                  >
                    <div style={MONO_LABEL}>Goes to</div>
                    <div
                      style={{
                        fontFamily: "'Source Serif 4',serif",
                        fontSize: "30px",
                        lineHeight: 1.1,
                        color: "#002D62",
                        fontWeight: 600,
                        marginTop: "4px",
                      }}
                    >
                      {num(audCount)}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#5A6472", marginTop: "2px" }}>
                      subscribers in {audLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Send window */}
              <div
                style={{
                  border: `1px solid ${locked ? "#C9D6E6" : "#E6E0D8"}`,
                  background: locked ? "#EFF4FA" : "#F8F4EE",
                  borderRadius: "6px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={MONO_LABEL}>{locked ? "Queued to send" : rescheduling ? "Pick a new window" : "Send window"}</div>
                  {instant !== null && now !== null && (
                    <div style={{ ...MONO, fontSize: "11px", color: "#5A6472" }}>{relative(instant, now)}</div>
                  )}
                </div>

                {locked ? (
                  <>
                    <div
                      style={{
                        fontFamily: "'Source Serif 4',serif",
                        fontSize: "19px",
                        color: "#002D62",
                        fontWeight: 600,
                        lineHeight: 1.35,
                      }}
                    >
                      {formatSlot(composing.date, composing.time, composing.zone)}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#5A6472" }}>
                      {audLabel} · {num(audCount)} recipients · {composing.pickArticleIds.length} pieces
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 116px 160px", gap: "12px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={FIELD_LABEL}>Date</span>
                        <input
                          type="date"
                          value={composing.date ?? ""}
                          min={now !== null ? todayIn(now, composing.zone) : undefined}
                          onChange={(e) => patch(composing.id, { date: e.target.value || null })}
                          style={INPUT}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={FIELD_LABEL}>Time</span>
                        <input
                          type="time"
                          value={composing.time ?? ""}
                          onChange={(e) => patch(composing.id, { time: e.target.value || null })}
                          style={INPUT}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={FIELD_LABEL}>Read in</span>
                        <select
                          value={composing.zone}
                          onChange={(e) => patch(composing.id, { zone: e.target.value })}
                          style={INPUT}
                        >
                          {ZONES.map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div style={{ fontSize: "13px", color: "#3E4650", lineHeight: 1.55 }}>
                      {composing.date && composing.time ? (
                        <>
                          Sends <strong style={{ color: "#002D62" }}>{formatSlot(composing.date, composing.time, composing.zone)}</strong>{" "}
                          to {num(audCount)} subscribers.
                        </>
                      ) : (
                        "Pick a date and a time to see when this goes out."
                      )}
                    </div>

                    {problems.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div style={{ ...MONO_LABEL, color: "#8A3B3B" }}>Before this can be scheduled</div>
                        {problems.map((p) => (
                          <div key={p} style={{ fontSize: "12.5px", color: "#8A3B3B", lineHeight: 1.5 }}>
                            · {p}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  {locked ? (
                    <>
                      <GhostButton onClick={() => startReschedule(composing)} disabled={!canSend}>
                        Reschedule
                      </GhostButton>
                      <GhostButton
                        onClick={() => void cancelSchedule(composing)}
                        disabled={!canSend}
                        style={{ color: canSend ? "#8A3B3B" : undefined }}
                      >
                        Cancel schedule
                      </GhostButton>
                    </>
                  ) : (
                    <>
                      <GhostButton onClick={() => void sendTest()} disabled={sendingTest}>
                        {sendingTest ? "Sending…" : "Send test"}
                      </GhostButton>
                      <GhostButton onClick={() => void saveDraft()}>Save draft</GhostButton>
                      {rescheduling && <GhostButton onClick={keepCurrent}>Keep current time</GhostButton>}
                      <PrimaryButton
                        onClick={() => void confirmSchedule()}
                        disabled={!canSend || problems.length > 0}
                        title={
                          !canSend
                            ? "Your role cannot send The Bridge."
                            : problems.length > 0
                              ? problems[0]
                              : undefined
                        }
                        style={{ marginInlineStart: "auto" }}
                      >
                        {rescheduling ? "Confirm new time" : "Schedule send"}
                      </PrimaryButton>
                    </>
                  )}
                </div>

                {!canSend && (
                  <div style={{ ...MONO, fontSize: "10.5px", color: "#8F6135", letterSpacing: "0.06em" }}>
                    Scheduling The Bridge is an owner and chief capability. You can still edit and save the draft.
                  </div>
                )}
              </div>
            </div>

            <NotWiredNote>
              This is a real send pipeline: &ldquo;Schedule send&rdquo; saves the issue and sets its send instant;
              sendScheduledBridgeIssues (functions/src/index.ts) checks every 5 minutes for anything due and sends
              it via Resend to the real subscriber list for the chosen audience, with a working unsubscribe link.
              &ldquo;Send test&rdquo; sends one real copy to you. What&apos;s not built: open/click tracking (Resend
              doesn&apos;t report those back to this project), and a stuck send after a failure just stays
              Scheduled for the next tick to retry rather than surfacing an alert anywhere.
            </NotWiredNote>
          </div>
          )}
        </div>
      )}

      {tab === "schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "18px" }}>
            <Stat label="In the queue" value={String(queue.length)} note={queue.length === 1 ? "issue waiting" : "issues waiting"} />
            <Stat
              label="Next send"
              value={queue[0] ? formatDate(queue[0].issue.date, "short") : "—"}
              note={
                queue[0]
                  ? `No. ${queue[0].issue.no} · ${queue[0].at !== null && now !== null ? relative(queue[0].at, now) : `${queue[0].issue.time} ${zone(queue[0].issue.zone).short}`}`
                  : "Nothing queued"
              }
            />
            <Stat
              label="Last sent"
              value={lastSent ? formatDate(lastSent.date, "short") : "—"}
              note={lastSent ? `No. ${lastSent.no} · ${lastSent.stats}` : "No issue has gone out"}
            />
          </div>

          {/* Queue */}
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
              <div style={MONO_LABEL}>Send queue</div>
              <div style={{ fontSize: "12.5px", color: "#8A8378" }}>Soonest first</div>
            </div>

            {queue.length === 0 ? (
              <Empty>Nothing is queued. Set a send window on a letter in the Issues tab, and it appears here.</Empty>
            ) : (
              queue.map(({ issue, at }, i) => (
                <div
                  key={issue.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px minmax(0,1fr) 190px auto",
                    gap: "16px",
                    alignItems: "center",
                    padding: "16px 22px",
                    borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                  }}
                >
                  <div
                    style={{ fontFamily: "'Source Serif 4',serif", fontSize: "22px", color: "#B57D49", fontWeight: 600 }}
                  >
                    {issue.no}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#002D62", lineHeight: 1.35 }}>
                      {issue.subject}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#5A6472", marginTop: "3px" }}>
                      {AUDIENCE_LABEL[issue.audienceId]} · {num(audienceCounts[issue.audienceId])} recipients ·{" "}
                      {issue.pickArticleIds.length} pieces
                    </div>
                  </div>
                  <div>
                    <div style={{ ...MONO, fontSize: "12px", color: "#002D62" }}>
                      {formatSlot(issue.date, issue.time, issue.zone, "short")}
                    </div>
                    {at !== null && now !== null && (
                      <div style={{ ...MONO, fontSize: "11px", color: "#5A6472", marginTop: "3px" }}>
                        {relative(at, now)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <GhostButton
                      onClick={() => startReschedule(issue)}
                      disabled={!canSend}
                      style={{ padding: "8px 12px", fontSize: "12.5px" }}
                    >
                      Reschedule
                    </GhostButton>
                    <GhostButton
                      onClick={() => void cancelSchedule(issue)}
                      disabled={!canSend}
                      style={{ padding: "8px 12px", fontSize: "12.5px", color: canSend ? "#8A3B3B" : undefined }}
                    >
                      Cancel
                    </GhostButton>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* History */}
          <div style={{ ...CARD, padding: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                padding: "18px 22px",
                borderBottom: "1px solid #E6E0D8",
              }}
            >
              <div style={MONO_LABEL}>Scheduling activity · {history.length} entries</div>
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                {LOG_FILTERS.map((f) => {
                  const on = logFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setLogFilter(f.key)}
                      style={{
                        ...MONO,
                        fontSize: "10.5px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "6px 10px",
                        borderRadius: "3px",
                        cursor: "pointer",
                        background: on ? "#002D62" : "transparent",
                        color: on ? "#FDF8F1" : "#5A6472",
                        border: `1px solid ${on ? "#002D62" : "#D8D1C7"}`,
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LOG_GRID's fixed-width columns run past a phone's width — see
                the same fix in ArticlesView. */}
            <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: LOG_GRID,
                gap: "16px",
                padding: "12px 22px",
                borderBottom: "1px solid #E6E0D8",
                background: "#F8F4EE",
                minWidth: "560px",
              }}
            >
              <div style={headCell}>When · {zone(DEFAULT_ZONE).short}</div>
              <div style={headCell}>Action</div>
              <div style={headCell}>Issue</div>
              <div style={headCell}>By</div>
            </div>

            {history.length === 0 ? (
              <Empty>No activity of that kind yet.</Empty>
            ) : (
              history.map((e, i) => (
                <div
                  key={e.id}
                  data-hover="background:#F8F4EE"
                  style={{
                    display: "grid",
                    gridTemplateColumns: LOG_GRID,
                    gap: "16px",
                    alignItems: "start",
                    padding: "14px 22px",
                    minWidth: "560px",
                    borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                    transition: "background .16s ease",
                  }}
                >
                  <div style={{ ...MONO, fontSize: "11.5px", color: "#5A6472", lineHeight: 1.5 }}>
                    {formatStamp(e.at)}
                  </div>
                  <div>
                    <Pill {...pill(e.action)}>{e.action}</Pill>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#002D62", lineHeight: 1.4 }}>
                      {issueLabel(e.issueNo, e.subject)}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#5A6472", marginTop: "3px", lineHeight: 1.5 }}>
                      {e.detail}
                    </div>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#5A6472" }}>{e.actor}</div>
                </div>
              ))
            )}
            </div>
          </div>

          <NotWiredNote>
            This log is real (bridgeLog collection) — every entry above is something that actually happened, written
            either by whoever was composing or, for &ldquo;Sent&rdquo; entries, by sendScheduledBridgeIssues itself.
          </NotWiredNote>
        </div>
      )}

      {tab === "subs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="grid grid-cols-2 xl:grid-cols-4" style={{ gap: "18px" }}>
            {[
              ["Active", num(subscribers.filter((s) => s.status === "Subscribed").length)],
              ["Open rate", "—"],
              ["Unsubscribes", num(subscribers.filter((s) => s.status === "Unsubscribed").length)],
              ["Growth in Aug", "—"],
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
            <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: SUB_GRID,
                gap: "16px",
                padding: "14px 22px",
                borderBottom: "1px solid #E6E0D8",
                background: "#F8F4EE",
                minWidth: "600px",
              }}
            >
              <div style={headCell}>Email</div>
              <div style={headCell}>Name</div>
              <div style={headCell}>Lang</div>
              <div style={headCell}>Source</div>
              <div style={headCell}>Joined</div>
            </div>
            {subscribers.length === 0 && <Empty>Nobody&apos;s subscribed yet.</Empty>}
            {subscribers.map((s, i) => (
              <div
                key={s.email}
                data-hover="background:#F8F4EE"
                style={{
                  display: "grid",
                  gridTemplateColumns: SUB_GRID,
                  gap: "16px",
                  alignItems: "center",
                  padding: "14px 22px",
                  minWidth: "600px",
                  borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                  transition: "background .16s ease",
                }}
              >
                <div style={{ ...MONO, fontSize: "12.5px", color: "#002D62" }}>{s.email}</div>
                <div style={{ fontSize: "13.5px", color: "#3E4650" }}>—</div>
                <div style={{ ...MONO, fontSize: "12px", color: "#5A6472" }}>{s.lang}</div>
                <div style={{ fontSize: "13px", color: "#5A6472" }}>{s.source}</div>
                <div style={{ fontSize: "12.5px", color: "#5A6472" }}>{s.joined}</div>
              </div>
            ))}
            </div>
          </div>

          <NotWiredNote>
            The list is real (see lib/subscribers.ts), and so is Unsubscribes now — the link in every real send
            (functions/src/index.ts&apos;s unsubscribe endpoint) sets a subscriber&apos;s status to Unsubscribed rather
            than deleting them. Open rate and growth still need real measurement Resend doesn&apos;t hand back to
            this project, so they stay blank. Name isn&apos;t collected by the signup form — only an email address
            is. &ldquo;Export CSV&rdquo; and &ldquo;Add subscriber&rdquo; aren&apos;t wired.
          </NotWiredNote>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div style={CARD}>
      <div style={MONO_LABEL}>{label}</div>
      <div
        style={{
          fontFamily: "'Source Serif 4',serif",
          fontSize: "28px",
          lineHeight: 1.1,
          color: "#002D62",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "12.5px", color: "#5A6472" }}>{note}</div>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: "28px 22px", fontSize: "13.5px", color: "#5A6472", lineHeight: 1.6 }}>{children}</div>
  );
}

/** "No. 08 — Subject", unless the subject already says which issue it is. */
function issueLabel(no: string, subject: string): string {
  return subject.includes(`No. ${no}`) ? subject : `No. ${no} — ${subject}`;
}

/** "September" from "2026-09-01" — the composer's own heading, so it follows the send date. */
function monthName(date: string | null): string {
  if (!date) return "Next";
  return formatDate(date, "long").split(" ")[2] ?? "Next";
}

/**
 * A clock shared by everything in this view.
 *
 * The prerender has no clock of its own — the CMS is a static export — so the
 * server snapshot is null and countdowns simply do not render until the browser
 * takes over. Reading Date.now() during render instead would hand hydration a
 * value the HTML never had.
 *
 * getSnapshot has to return the same value between ticks or React re-renders
 * forever, which is why the timestamp is cached here and only ever moved by the
 * interval.
 */
const clock = {
  value: null as number | null,
  listeners: new Set<() => void>(),
  timer: null as ReturnType<typeof setInterval> | null,
};

function subscribeToClock(onChange: () => void): () => void {
  clock.listeners.add(onChange);
  if (clock.timer === null) {
    clock.value = Date.now();
    clock.timer = setInterval(() => {
      clock.value = Date.now();
      for (const listener of clock.listeners) listener();
    }, 30_000);
  }
  return () => {
    clock.listeners.delete(onChange);
    if (clock.listeners.size === 0 && clock.timer !== null) {
      clearInterval(clock.timer);
      clock.timer = null;
    }
  };
}

const readClock = () => clock.value;
const readClockOnPrerender = (): number | null => null;
