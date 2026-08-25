"use client";

import { useEffect, useMemo, useState } from "react";
import { CARD, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { ACTIVITY, pill, type Article } from "@/content/seed";
import type { View } from "@/lib/view";
import { getFirebase } from "@/lib/firebase";
import { watchSubscribers, type Subscriber } from "@/lib/subscribers";
import { watchIssues, type Issue } from "@/lib/bridge-issues";
import { formatDate } from "@/lib/schedule";

/** Overview from "StoryBridge CMS.dc.html" (lines 161–223). */

const statNumber = {
  fontFamily: "'Source Serif 4',serif",
  fontSize: "40px",
  lineHeight: 1,
  color: "#002D62",
  fontWeight: 600,
} as const;

export function Dashboard({
  articles,
  openCount,
  newCount,
  setView,
  openArticle,
}: {
  articles: Article[];
  openCount: number;
  newCount: number;
  setView: (v: View) => void;
  openArticle: (id: string) => void;
}) {
  const published = articles.filter((a) => a.status === "Published").length;
  const drafts = articles.filter((a) => a.status === "Draft").length;
  const inReview = articles.filter((a) => a.status === "In review").length;
  const scheduled = articles.filter((a) => a.status === "Scheduled").length;

  // Real Bridge subscriber/issue data — replaces the board's fixed "1,904"
  // and its fabricated "No. 08, 72% ready" progress card. Subscribed here so
  // the dashboard doesn't depend on the Bridge view having mounted first.
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
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
    return () => {
      unsubA();
      unsubB();
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

  const queue = [
    {
      kind: "Review",
      title: "Le brief, ce document qu'on saute trop souvent",
      meta: "Imen Bliwa · submitted 20 Aug · FR · 980 words",
      cta: "Read and decide",
      act: () => openArticle("a3"),
    },
    {
      kind: "Enquiry",
      title: "MedTech Tunisie — three-language relaunch",
      meta: "Unanswered for two days · FR → AR, EN · deadline 15 Sep",
      cta: "Reply",
      act: () => setView("inbox"),
    },
    {
      kind: "Letter",
      title: "The Bridge No. 08 — one section still missing",
      meta: "Scheduled for 01 Sep · 1,904 recipients",
      cta: "Continue",
      act: () => setView("issues"),
    },
    {
      kind: "Page",
      title: "Packages — price bands still hidden",
      meta: "Section off since 15 Jul · waiting on the autumn rate card",
      cta: "Open page",
      act: () => setView("pages"),
    },
  ];

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
          {queue.map((q, i) => (
            <div
              key={q.title}
              style={{
                display: "grid",
                gridTemplateColumns: "92px 1fr auto",
                gap: "16px",
                alignItems: "center",
                padding: "16px 22px",
                borderTop: i === 0 ? undefined : "1px solid #EDE7DE",
              }}
            >
              <Pill {...pill(q.kind === "Letter" ? "Scheduled" : q.kind === "Page" ? "Draft" : "In review")}>
                {q.kind}
              </Pill>
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
          {/* Bridge progress — real (see currentIssue above), no fake readiness % */}
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
              {ACTIVITY.map((a, i) => (
                <div
                  key={a.text}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 1fr",
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

          <NotWiredNote>
            The stat row, Bridge subscribers/progress card above are real (Firestore-backed articles, submissions,
            subscribers, Bridge issues). &ldquo;Needs a decision&rdquo; and &ldquo;Recent activity&rdquo; below are
            still sample data from the design board — they&apos;d need a real cross-collection query this slice
            didn&apos;t build.
          </NotWiredNote>
        </div>
      </div>
    </div>
  );
}
