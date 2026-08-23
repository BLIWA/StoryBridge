"use client";

import { CARD, MONO_LABEL, Pill, PrimaryButton, GhostButton, NotWiredNote } from "@/components/ui";
import { ACTIVITY, pill, type Article } from "@/content/seed";
import type { View } from "@/lib/view";

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px" }}>
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
          <div style={statNumber}>1,904</div>
          <div style={{ fontSize: "13px", color: "#5A6472" }}>+86 in August</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "18px", alignItems: "start" }}>
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
          {/* Bridge progress */}
          <div style={{ ...CARD, background: "#002D62", border: "none", gap: "14px" }}>
            <div style={{ ...MONO_LABEL, color: "#B57D49" }}>The Bridge · No. 08</div>
            <div style={{ fontSize: "14.5px", lineHeight: 1.65, color: "rgba(253,248,241,0.82)" }}>
              Drafted, three of four sections written. Goes out on 1 September.
            </div>
            <div style={{ height: "6px", background: "rgba(253,248,241,0.18)", borderRadius: "999px" }}>
              <div style={{ width: "72%", height: "100%", background: "#B57D49", borderRadius: "999px" }} />
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
              <span>72% READY</span>
              <span>1,904 RECIPIENTS</span>
            </div>
            <PrimaryButton
              onClick={() => setView("issues")}
              style={{ background: "#B57D49", color: "#001838", alignSelf: "flex-start" }}
            >
              Continue the issue
            </PrimaryButton>
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
            Figures and activity are sample data from the design board. Firestore-backed counts arrive with
            roadmap Phase 05.
          </NotWiredNote>
        </div>
      </div>
    </div>
  );
}
