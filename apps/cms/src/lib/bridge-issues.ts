/**
 * The Bridge's issues — real Firestore documents now, replacing the
 * in-memory ISSUES/SCHEDULE_LOG seed arrays content/seed.ts still exports
 * for reference. See firestore.rules' `bridgeIssues`/`bridgeLog` match
 * blocks and functions/src/index.ts's sendScheduledBridgeIssues, which is
 * what actually reaches a subscriber's inbox — everything here is
 * composing and bookkeeping.
 */

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";

const COLLECTION = "bridgeIssues";

export type IssueStatus = "Draft" | "Scheduled" | "Sent" | "Canceled";

/** Real, data-backed segments — a lang value on file for an actual subscriber, or all of them. */
export type AudienceId = "all" | "en" | "fr" | "ar";

export const AUDIENCE_LABEL: Record<AudienceId, string> = {
  all: "All subscribers",
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export type Issue = {
  id: string;
  no: string;
  subject: string;
  preheader: string;
  date: string | null;
  time: string | null;
  zone: string;
  audienceId: AudienceId;
  /** Real article ids from the `articles` collection — see components/views/issues.tsx. */
  pickArticleIds: string[];
  status: IssueStatus;
  /** Epoch ms the scheduled-send function watches for — set alongside date/time/zone, kept in step by toInstant(). */
  sendAt: number | null;
  /** What was actually delivered to, once sent — null until then. */
  recipients: number | null;
  stats: string;
};

function toIssue(id: string, data: Record<string, unknown>): Issue {
  return {
    id,
    no: typeof data.no === "string" ? data.no : "—",
    subject: typeof data.subject === "string" ? data.subject : "",
    preheader: typeof data.preheader === "string" ? data.preheader : "",
    date: typeof data.date === "string" ? data.date : null,
    time: typeof data.time === "string" ? data.time : null,
    zone: typeof data.zone === "string" ? data.zone : "tunis",
    audienceId: (["all", "en", "fr", "ar"] as const).includes(data.audienceId as AudienceId)
      ? (data.audienceId as AudienceId)
      : "all",
    pickArticleIds: Array.isArray(data.pickArticleIds) ? data.pickArticleIds.filter((p) => typeof p === "string") : [],
    status: (["Draft", "Scheduled", "Sent", "Canceled"] as const).includes(data.status as IssueStatus)
      ? (data.status as IssueStatus)
      : "Draft",
    sendAt: typeof data.sendAt === "number" ? data.sendAt : null,
    recipients: typeof data.recipients === "number" ? data.recipients : null,
    stats: typeof data.stats === "string" ? data.stats : "— · —",
  };
}

export function watchIssues(db: Firestore, onChange: (issues: Issue[]) => void, onError: (error: unknown) => void) {
  return onSnapshot(
    query(collection(db, COLLECTION), orderBy("no", "desc")),
    (snap) => onChange(snap.docs.map((d) => toIssue(d.id, d.data()))),
    onError,
  );
}

/** Zero-padded, one higher than the highest existing issue number — "08" after "07". */
export function nextIssueNo(issues: Issue[]): string {
  const highest = issues.reduce((max, i) => Math.max(max, Number(i.no) || 0), 0);
  return String(highest + 1).padStart(2, "0");
}

/** A fresh, unused document id — generated client-side, no network round trip. Same pattern as lib/articles.ts's newArticleId(). */
export function newIssueId(db: Firestore): string {
  return doc(collection(db, COLLECTION)).id;
}

/** Creates a brand-new issue. `issue.id` must come from newIssueId(). */
export async function createIssue(db: Firestore, issue: Issue): Promise<void> {
  const { id, ...fields } = issue;
  await setDoc(doc(db, COLLECTION, id), { ...fields, createdAt: serverTimestamp() });
}

export async function saveIssue(db: Firestore, issue: Issue): Promise<void> {
  const { id, ...fields } = issue;
  await setDoc(doc(db, COLLECTION, id), { ...fields, updatedAt: serverTimestamp() }, { merge: true });
}

// ---------------------------------------------------------------------------

export type ScheduleAction = "Scheduled" | "Rescheduled" | "Canceled" | "Sent" | "Test sent" | "Draft saved";

export type ScheduleEvent = {
  id: string;
  at: string;
  issueNo: string;
  subject: string;
  action: ScheduleAction;
  detail: string;
  actor: string;
};

function toScheduleEvent(id: string, data: Record<string, unknown>): ScheduleEvent {
  const at = (data.at as Timestamp | undefined)?.toDate?.();
  return {
    id,
    at: at ? at.toISOString() : new Date(0).toISOString(),
    issueNo: typeof data.issueNo === "string" ? data.issueNo : "",
    subject: typeof data.subject === "string" ? data.subject : "",
    action: typeof data.action === "string" ? (data.action as ScheduleAction) : "Draft saved",
    detail: typeof data.detail === "string" ? data.detail : "",
    actor: typeof data.actor === "string" ? data.actor : "",
  };
}

export function watchBridgeLog(
  db: Firestore,
  onChange: (log: ScheduleEvent[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    query(collection(db, "bridgeLog"), orderBy("at", "desc")),
    (snap) => onChange(snap.docs.map((d) => toScheduleEvent(d.id, d.data()))),
    onError,
  );
}

export async function appendLogEntry(
  db: Firestore,
  entry: Omit<ScheduleEvent, "id" | "at">,
): Promise<void> {
  await addDoc(collection(db, "bridgeLog"), { ...entry, at: serverTimestamp() });
}
