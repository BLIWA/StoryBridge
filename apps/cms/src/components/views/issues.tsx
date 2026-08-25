"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { httpsCallable } from "firebase/functions";
import { CARD, FIELD_LABEL, INPUT, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { getFirebase } from "@/lib/firebase";
import { watchSubscribers, type Subscriber } from "@/lib/subscribers";
import {
  AUDIENCES,
  BRIDGE_PICKS,
  ISSUES,
  SCHEDULE_LOG,
  audience,
  pill,
  type AudienceId,
  type Issue,
  type ScheduleAction,
  type ScheduleEvent,
} from "@/content/seed";
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
 * (404–483), with the composer widened to half the page and the board's inert
 * "Schedule" button turned into a working mechanism.
 *
 * Scheduling here is real bookkeeping and nothing more: a send window is
 * validated, held on the issue, and every change to it is appended to the
 * activity log the Schedule tab reads. What it is *not* is delivery — no
 * message leaves the browser, and the log says "Scheduled", never "Sent",
 * for anything this session did. Delivery is roadmap Phase 06.
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

const LOG_FILTERS: Array<{ key: string; label: string; actions: ScheduleAction[] }> = [
  { key: "all", label: "Everything", actions: [] },
  { key: "scheduled", label: "Scheduled", actions: ["Scheduled", "Rescheduled"] },
  { key: "canceled", label: "Canceled", actions: ["Canceled"] },
  { key: "sent", label: "Sent", actions: ["Sent"] },
  { key: "tests", label: "Tests & drafts", actions: ["Test sent", "Draft saved"] },
];

export function IssuesView() {
  const { user, staff, can } = useAuth();
  const actor = staff?.name || user?.displayName || user?.email || "Signed in";
  const canSend = can("sendNewsletter");

  const [tab, setTab] = useState<Tab>("issues");
  const [issues, setIssues] = useState<Issue[]>(ISSUES);
  const [log, setLog] = useState<ScheduleEvent[]>(SCHEDULE_LOG);
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

  function patch(no: string, next: Partial<Issue>) {
    setIssues((prev) => prev.map((i) => (i.no === no ? { ...i, ...next } : i)));
  }

  function record(issue: Issue, action: ScheduleAction, detail: string, by = actor) {
    setLog((prev) => [
      ...prev,
      {
        id: `e-${issue.no}-${prev.length + 1}`,
        at: new Date().toISOString(),
        issueNo: issue.no,
        subject: issue.subject,
        action,
        detail,
        actor: by,
      },
    ]);
  }

  /**
   * The letter on the desk. Defaults to the newest issue that has not gone out,
   * but the Schedule tab can point the composer at a specific queued issue — so
   * "Reschedule" on the third row in the queue edits that row, not whichever
   * issue happened to be first.
   */
  const [composingNo, setComposingNo] = useState<string | null>(null);
  const composing =
    (composingNo ? issues.find((i) => i.no === composingNo) : undefined) ??
    issues.find((i) => i.status !== "Sent") ??
    issues[0];
  const aud = audience(composing.audienceId);

  /** Holds the slot an issue had before "Reschedule" was pressed, for the diff and for undo. */
  const [rescheduling, setRescheduling] = useState<{ date: string | null; time: string | null; zone: string } | null>(
    null,
  );
  const locked = composing.status === "Scheduled" && !rescheduling;

  const problems = scheduleProblems({
    subject: composing.subject,
    preheader: composing.preheader,
    pickCount: composing.picks.length,
    recipients: aud.count,
    date: composing.date,
    time: composing.time,
    zoneId: composing.zone,
    nowMs: now,
  });

  const instant = toInstant(composing.date, composing.time, composing.zone);

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
    const rows = [...log].reverse();
    return chosen.actions.length === 0 ? rows : rows.filter((e) => chosen.actions.includes(e.action));
  }, [log, logFilter]);

  // ---- actions -------------------------------------------------------------

  function togglePick(id: string) {
    const has = composing.picks.includes(id);
    patch(composing.no, {
      picks: has ? composing.picks.filter((p) => p !== id) : [...composing.picks, id],
    });
  }

  function saveDraft() {
    record(
      composing,
      "Draft saved",
      `${composing.picks.length} piece${composing.picks.length === 1 ? "" : "s"} · ${aud.label}`,
    );
    say("Draft saved to this session.");
  }

  /**
   * The one real send in this whole view — everything else on this tab is
   * bookkeeping (see the NotWiredNote below). Calls sendBridgeTest
   * (functions/src/index.ts), which re-checks the sendNewsletter capability
   * server-side and emails one real copy to the caller's own address via
   * Resend.
   */
  async function sendTest() {
    setSendingTest(true);
    try {
      const send = httpsCallable<{ subject: string; preheader: string; picks: string[] }, { ok: true }>(
        getFirebase().functions,
        "sendBridgeTest",
      );
      await send({
        subject: composing.subject,
        preheader: composing.preheader,
        picks: composing.picks.map((id) => BRIDGE_PICKS.find((p) => p.id === id)?.title ?? id),
      });
      record(composing, "Test sent", `Test copy sent to ${user?.email ?? "the desk"}`);
      say(`Sent — check ${user?.email ?? "your inbox"}.`);
    } catch {
      say("Couldn't send that test. Check your connection and try again.");
    } finally {
      setSendingTest(false);
    }
  }

  function confirmSchedule() {
    if (problems.length > 0 || !canSend) return;
    const was = rescheduling;
    const slot = formatSlot(composing.date, composing.time, composing.zone);
    const moved = was && (was.date !== composing.date || was.time !== composing.time || was.zone !== composing.zone);

    patch(composing.no, { status: "Scheduled" });

    if (moved) {
      record(
        composing,
        "Rescheduled",
        `Moved from ${formatSlot(was.date, was.time, was.zone, "short")} to ${formatSlot(composing.date, composing.time, composing.zone, "short")}`,
      );
      say(`No. ${composing.no} moved to ${slot}.`);
    } else if (was) {
      record(composing, "Scheduled", `Re-confirmed for ${slot} · ${aud.label} · ${num(aud.count)} recipients`);
      say(`No. ${composing.no} kept at ${slot}.`);
    } else {
      record(composing, "Scheduled", `${slot} · ${aud.label} · ${num(aud.count)} recipients`);
      say(`No. ${composing.no} scheduled for ${slot}.`);
    }
    setRescheduling(null);
  }

  function startReschedule(issue: Issue) {
    setComposingNo(issue.no);
    setRescheduling({ date: issue.date, time: issue.time, zone: issue.zone });
    setTab("issues");
  }

  function keepCurrent() {
    if (!rescheduling) return;
    patch(composing.no, { date: rescheduling.date, time: rescheduling.time, zone: rescheduling.zone });
    setRescheduling(null);
  }

  function cancelSchedule(issue: Issue) {
    if (!canSend) return;
    patch(issue.no, { status: "Draft" });
    record(issue, "Canceled", `Was set for ${formatSlot(issue.date, issue.time, issue.zone, "short")} — back to draft`);
    setRescheduling(null);
    say(`No. ${issue.no} is a draft again. Nothing is queued for it.`);
  }

  // ---- render --------------------------------------------------------------

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "cms-fade .3s ease both" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {(
          [
            ["issues", "Issues", null],
            ["schedule", "Schedule", queue.length ? String(queue.length) : null],
            ["subs", "Subscribers", num(AUDIENCES[0].count)],
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

        {flash && (
          <div
            key={flash.n}
            role="status"
            style={{
              ...MONO,
              marginInlineStart: "auto",
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
              <div style={{ fontSize: "12.5px", color: "#8A8378" }}>Monthly since February</div>
            </div>
            {issues.map((iss, i) => {
              const recipients = iss.recipients ?? audience(iss.audienceId).count;
              return (
                <div
                  key={iss.no}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px minmax(0,1fr) auto",
                    gap: "14px",
                    alignItems: "start",
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
                      lineHeight: 1.2,
                    }}
                  >
                    {iss.no}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#002D62", lineHeight: 1.35 }}>
                      {iss.subject}
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
                </div>
              );
            })}
          </div>

          {/* Composer */}
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
                  onChange={(e) => patch(composing.no, { subject: e.target.value })}
                  style={INPUT}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={FIELD_LABEL}>Preview text</span>
                <input
                  value={composing.preheader}
                  onChange={(e) => patch(composing.no, { preheader: e.target.value })}
                  style={INPUT}
                />
              </label>

              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <span style={FIELD_LABEL}>
                    Included pieces
                    <span style={{ ...MONO, fontSize: "11px", color: "#8A8378", marginInlineStart: "8px" }}>
                      {composing.picks.length} of {BRIDGE_PICKS.length}
                    </span>
                  </span>
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
                        checked={composing.picks.includes(p.id)}
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
                      onChange={(e) => patch(composing.no, { audienceId: e.target.value as AudienceId })}
                      style={INPUT}
                    >
                      {AUDIENCES.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} · {num(a.count)}
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
                      {num(aud.count)}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#5A6472", marginTop: "2px" }}>
                      subscribers in {aud.label}
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
                      {aud.label} · {num(aud.count)} recipients · {composing.picks.length} pieces
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
                          onChange={(e) => patch(composing.no, { date: e.target.value || null })}
                          style={INPUT}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={FIELD_LABEL}>Time</span>
                        <input
                          type="time"
                          value={composing.time ?? ""}
                          onChange={(e) => patch(composing.no, { time: e.target.value || null })}
                          style={INPUT}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={FIELD_LABEL}>Read in</span>
                        <select
                          value={composing.zone}
                          onChange={(e) => patch(composing.no, { zone: e.target.value })}
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
                          to {num(aud.count)} subscribers.
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
                        onClick={() => cancelSchedule(composing)}
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
                      <GhostButton onClick={saveDraft}>Save draft</GhostButton>
                      {rescheduling && <GhostButton onClick={keepCurrent}>Keep current time</GhostButton>}
                      <PrimaryButton
                        onClick={confirmSchedule}
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
              &ldquo;Send test&rdquo; is real — it emails one copy of exactly what&apos;s in the composer to your own
              address via Resend (functions/src/index.ts). Everything else on this tab is still bookkeeping:
              scheduling holds a window on the issue and writes to the activity log, but nothing actually goes out at
              that time — sending to the real audience needs its own delivery pipeline (subscriber segmentation,
              unsubscribe links, batching), which this session&apos;s work didn&apos;t build. This session&apos;s
              other changes here are still gone on reload.
            </NotWiredNote>
          </div>
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
              <Empty>
                Nothing is queued. Set a send window on the September letter in the Issues tab, and it appears here.
              </Empty>
            ) : (
              queue.map(({ issue, at }, i) => (
                <div
                  key={issue.no}
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
                      {audience(issue.audienceId).label} · {num(audience(issue.audienceId).count)} recipients ·{" "}
                      {issue.picks.length} pieces
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
                      onClick={() => cancelSchedule(issue)}
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: LOG_GRID,
                gap: "16px",
                padding: "12px 22px",
                borderBottom: "1px solid #E6E0D8",
                background: "#F8F4EE",
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

          <NotWiredNote>
            The log is the record of what the desk decided, not of what a mail server did. Entries marked{" "}
            <strong>Sent</strong> are the archive&apos;s own history from the design board; anything this session adds
            is a scheduling decision held in memory until Firestore backs it — roadmap Phase 06.
          </NotWiredNote>
        </div>
      )}

      {tab === "subs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="grid grid-cols-2 xl:grid-cols-4" style={{ gap: "18px" }}>
            {[
              ["Active", num(subscribers.filter((s) => s.status === "Subscribed").length)],
              ["Open rate", "—"],
              ["Unsubscribes", "—"],
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

          <NotWiredNote>
            The list above is real — every signup on the site writes here directly (see
            lib/subscribers.ts), no Cloud Function in between. Open rate, unsubscribes and growth need an
            actual send to measure, so they stay blank until Phase 06&apos;s delivery pipeline exists. Name
            isn&apos;t collected by the signup form — only an email address is. &ldquo;Export CSV&rdquo; and
            &ldquo;Add subscriber&rdquo; aren&apos;t wired.
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
