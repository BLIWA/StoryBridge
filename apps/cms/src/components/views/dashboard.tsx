"use client";

import { useEffect, useMemo, useState } from "react";
import { CARD, MONO_LABEL, Pill, PrimaryButton, GhostButton } from "@/components/ui";
import { pill, type Article, type Message } from "@/content/seed";
import type { View } from "@/lib/view";
import { getFirebase } from "@/lib/firebase";
import { watchSubscribers, type Subscriber } from "@/lib/subscribers";
import { watchIssues, watchBridgeLog, type Issue, type ScheduleAction, type ScheduleEvent } from "@/lib/bridge-issues";
import { watchSubmissions } from "@/lib/submissions";
import { formatDate, formatStamp } from "@/lib/schedule";

/**
 * Overview from "StoryBridge CMS.dc.html" (lines 161–223) — every panel is a
 * real Firestore read now. The stat row and Bridge-progress card were the
 * first to go real; "Needs a decision" and "Recent activity" below them
 * (previously the board's fixed sample rows) are built the same way, from
 * live articles, submissions, subscribers and the Bridge scheduling log.
 */

const statNumber = {
  fontFamily: "'Source Serif 4',serif",
  fontSize: "40px",
  lineHeight: 1,
  color: "#002D62",
  fontWeight: 600,
} as const;

/** "20 Aug 2026" → a UTC ms value, for sorting only — the field itself stays a display string everywhere else. Unparseable dates sort last. */
const MONTH_INDEX: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};
function parseBoardDate(date: string): number {
  const m = /^(\d{1,2}) (\w{3}) (\d{4})$/.exec(date);
  if (!m) return Infinity;
  const month = MONTH_INDEX[m[2]];
  if (month === undefined) return Infinity;
  return Date.UTC(Number(m[3]), month, Number(m[1]));
}

const BRIDGE_LOG_VERB: Record<ScheduleAction, string> = {
  Scheduled: "scheduled",
  Rescheduled: "rescheduled",
  Canceled: "canceled",
  Sent: "sent",
  "Test sent": "sent a test of",
  "Draft saved": "saved a draft of",
};

type DecisionItem = {
  key: string;
  kind: "Review" | "Enquiry";
  title: string;
  meta: string;
  cta: string;
  act: () => void;
  sortAt: number;
};

type ActivityItem = { key: string; when: string; text: string; atMs: number };

export function Dashboard({
  articles,
  openCount,
  newCount,
  setView,
  openArticle,
  goToMessage,
}: {
  articles: Article[];
  openCount: number;
  newCount: number;
  setView: (v: View) => void;
  openArticle: (id: string) => void;
  goToMessage: (id: string) => void;
}) {
  const published = articles.filter((a) => a.status === "Published").length;
  const drafts = articles.filter((a) => a.status === "Draft").length;
  const inReview = articles.filter((a) => a.status === "In review").length;
  const scheduled = articles.filter((a) => a.status === "Scheduled").length;

  // Subscribed here (not read off Studio's own state) so the dashboard
  // doesn't depend on the Bridge or Inbox view having mounted first.
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [log, setLog] = useState<ScheduleEvent[]>([]);
  useEffect(() => {
    const { db } = getFirebase();
    const unsubA = watchSubscribers(
      db,
      (list) => setSubscribers(list),
      () => setSubscribers([]),
    );
    const unsubB = watchIssues(
      db,
      (list) => setIssues(list),
      () => setIssues([]),
    );
    const unsubC = watchSubmissions(
      db,
      (list) => setMessages(list),
      () => setMessages([]),
    );
    const unsubD = watchBridgeLog(
      db,
      (list) => setLog(list),
      () => setLog([]),
    );
    return () => {
      unsubA();
      unsubB();
      unsubC();
      unsubD();
    };
  }, []);

  const activeSubscribers = useMemo(() => subscribers.filter((s) => s.status === "Subscribed"), [subscribers]);

  // The issue worth surfacing: the soonest-due Scheduled one, or failing
  // that the most recent Draft (issues arrive sorted by no, descending, so
  // the first Draft in the list is the highest-numbered one) — same
  // "what needs picking up" intent the board's fixed card had, with real
  // data behind it. No live equivalent of the board's "% ready" exists (no
  // section-completeness field on an issue), so that bar is dropped rather
  // than faked.
  const currentIssue = useMemo(() => {
    const scheduledDue = issues
      .filter((i) => i.status === "Scheduled" && i.sendAt != null)
      .sort((a, b) => (a.sendAt ?? 0) - (b.sendAt ?? 0))[0];
    if (scheduledDue) return scheduledDue;
    return issues.find((i) => i.status === "Draft");
  }, [issues]);

  const currentIssueRecipients = useMemo(() => {
    if (!currentIssue) return 0;
    if (currentIssue.audienceId === "all") return activeSubscribers.length;
    return activeSubscribers.filter((s) => s.lang.toLowerCase() === currentIssue.audienceId).length;
  }, [currentIssue, activeSubscribers]);

  /**
   * What actually needs a human decision, oldest first: articles waiting on
   * a publish/return call, and enquiries nobody has replied to yet. The
   * Bridge issue above already gets its own card, and the board's old
   * "Page" row had no real backing state (site copy has no per-section
   * "waiting on a decision" field) — dropped rather than faked.
   */
  const needsDecision = useMemo<DecisionItem[]>(() => {
    const fromArticles: DecisionItem[] = articles
      .filter((a) => a.status === "In review")
      .map((a) => ({
        key: `article:${a.id}`,
        kind: "Review",
        title: a.title || "Untitled piece",
        meta: `${a.author} · submitted ${a.date} · ${a.lang} · ${a.words} words`,
        cta: "Read and decide",
        act: () => openArticle(a.id),
        sortAt: parseBoardDate(a.date),
      }));

    const fromMessages: DecisionItem[] = messages
      .filter((m) => m.status === "New")
      .map((m) => ({
        key: `message:${m.id}`,
        kind: "Enquiry",
        title: m.org ? `${m.org} — ${m.subject}` : `${m.name || "Unknown sender"} — ${m.subject}`,
        meta: `Unanswered since ${m.when || "an unknown date"}${m.langs ? ` · ${m.langs}` : ""}${
          m.deadline ? ` · deadline ${m.deadline}` : ""
        }`,
        cta: "Reply",
        act: () => goToMessage(m.id),
        sortAt: m.createdAtMs ?? Infinity,
      }));

    return [...fromArticles, ...fromMessages].sort((a, b) => a.sortAt - b.sortAt).slice(0, 6);
  }, [articles, messages, openArticle, goToMessage]);

  /**
   * A real cross-collection feed: the Bridge scheduling log (every entry
   * already a record of something that happened, see issues.tsx), plus new
   * submissions and new subscribers as they land — merged and sorted by
   * their actual timestamps, not a fixed board list.
   */
  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    for (const e of log) {
      const atMs = Date.parse(e.at);
      if (Number.isNaN(atMs)) continue;
      items.push({
        key: `log:${e.id}`,
        atMs,
        when: formatStamp(e.at),
        text: `${e.actor} ${BRIDGE_LOG_VERB[e.action]} The Bridge No. ${e.issueNo} — ${e.detail}`,
      });
    }

    for (const m of messages) {
      if (!m.createdAtMs) continue;
      items.push({
        key: `message:${m.id}`,
        atMs: m.createdAtMs,
        when: formatStamp(new Date(m.createdAtMs).toISOString()),
        text: `${m.name || "Someone"}${m.org ? ` (${m.org})` : ""} submitted an enquiry — ${m.subject}.`,
      });
    }

    for (const s of subscribers) {
      if (!s.joinedAtMs) continue;
      items.push({
        key: `subscriber:${s.email}`,
        atMs: s.joinedAtMs,
        when: formatStamp(new Date(s.joinedAtMs).toISOString()),
        text: `${s.email} subscribed to The Bridge${s.source ? ` — ${s.source}` : ""}.`,
      });
    }

    return items.sort((a, b) => b.atMs - a.atMs).slice(0, 8);
  }, [log, messages, subscribers]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "26px", animation: "cms-fade .3s ease both" }}>
      <div className="grid grid-cols-2 xl:grid-cols-4" style={{ gap: "18px" }}>
        <div style={CARD}>
          <div style={MONO_LABEL}>Published pieces</div>
          <div style={statNumber}>{published}</div>
          <div style={{ fontSize: "13px", color: "#5A6472" }}>Across EN, AR and FR</div>
        </div>
        <div style={CARD}>
          <div style={MONO_LABEL}>In the pipeline</div>
          <div style={statNumber}>{openCount}</div>
          <div style={{ fontSize: "13px", color: "#5A6472" }}>
            {drafts} drafts · {inReview} in review · {scheduled} scheduled
          </div>
        </div>
        <div style={CARD}>
          <div style={MONO_LABEL}>Bridge subscribers</div>
          <div style={statNumber}>{activeSubscribers.length.toLocaleString()}</div>
          <div style={{ fontSize: "13px", color: "#5A6472" }}>Active, across EN/FR/AR</div>
        </div>
        <div style={CARD}>
          <div style={MONO_LABEL}>Unanswered enquiries</div>
          <div style={statNumber}>{newCount}</div>
          <button
            type="button"
            onClick={() => setView("inbox")}
            style={{
              fontSize: "13px",
              color: "#8F6135",
              fontWeight: 600,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "start",
            }}
          >
            Open the inbox →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]" style={{ gap: "18px", alignItems: "start" }}>
        {/* Needs a decision */}
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
            <div style={MONO_LABEL}>Needs a decision</div>
            <div style={{ fontSize: "12.5px", color: "#8A8378" }}>Oldest first</div>
          </div>
          {needsDecision.length === 0 && (
            <div style={{ padding: "28px 22px", fontSize: "13.5px", color: "#5A6472", lineHeight: 1.6 }}>
              Nothing waiting on a decision right now.
            </div>
          )}
          {needsDecision.map((q, i) => (
            <div
              key={q.key}
              style={{
                display: "grid",
                gridTemplateColumns: "92px 1fr auto",
                gap: "16px",
                alignItems: "center",
                padding: "16px 22px",
                borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
              }}
            >
              <Pill {...pill(q.kind === "Review" ? "In review" : "New")}>{q.kind}</Pill>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#002D62", lineHeight: 1.35 }}>
                  {q.title}
                </div>
                <div style={{ fontSize: "12.5px", color: "#5A6472", marginTop: "3px" }}>{q.meta}</div>
              </div>
              <GhostButton onClick={q.act}>{q.cta}</GhostButton>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Bridge progress */}
          <div style={{ ...CARD, background: "#002D62", border: "none", gap: "14px" }}>
            {currentIssue ? (
              <>
                <div style={{ ...MONO_LABEL, color: "#B57D49" }}>The Bridge · No. {currentIssue.no}</div>
                <div style={{ fontSize: "14.5px", lineHeight: 1.65, color: "rgba(253,248,241,0.82)" }}>
                  {currentIssue.subject || "Untitled issue"} —{" "}
                  {currentIssue.status === "Scheduled" && currentIssue.date
                    ? `scheduled for ${formatDate(currentIssue.date, "long")}.`
                    : "still a draft, not yet scheduled."}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "10.5px",
                    letterSpacing: "0.1em",
                    color: "rgba(253,248,241,0.6)",
                  }}
                >
                  <span>{currentIssue.status.toUpperCase()}</span>
                  <span>{currentIssueRecipients.toLocaleString()} RECIPIENTS</span>
                </div>
                <PrimaryButton
                  onClick={() => setView("issues")}
                  style={{ background: "#B57D49", color: "#001838", alignSelf: "flex-start" }}
                >
                  Continue the issue
                </PrimaryButton>
              </>
            ) : (
              <>
                <div style={{ ...MONO_LABEL, color: "#B57D49" }}>The Bridge</div>
                <div style={{ fontSize: "14.5px", lineHeight: 1.65, color: "rgba(253,248,241,0.82)" }}>
                  No issue in progress — nothing drafted or scheduled right now.
                </div>
                <PrimaryButton
                  onClick={() => setView("issues")}
                  style={{ background: "#B57D49", color: "#001838", alignSelf: "flex-start" }}
                >
                  Start an issue
                </PrimaryButton>
              </>
            )}
          </div>

          {/* Recent activity */}
          <div style={{ ...CARD, padding: 0 }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #E6E0D8" }}>
              <div style={MONO_LABEL}>Recent activity</div>
            </div>
            <div style={{ padding: "6px 22px 18px" }}>
              {activity.length === 0 && (
                <div style={{ padding: "12px 0", fontSize: "13.5px", color: "#5A6472", lineHeight: 1.6 }}>
                  Nothing yet — this fills in as issues get scheduled, enquiries arrive and people subscribe.
                </div>
              )}
              {activity.map((a, i) => (
                <div
                  key={a.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "108px 1fr",
                    gap: "12px",
                    padding: "12px 0",
                    borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: "11px",
                      color: "#8A8378",
                    }}
                  >
                    {a.when}
                  </div>
                  <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#3E4650" }}>{a.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
