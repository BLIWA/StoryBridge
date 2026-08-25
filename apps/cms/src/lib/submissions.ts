/**
 * Contact-form submissions, read side. The website writes these directly
 * (apps/website/src/lib/submissions.ts) — no Cloud Function in between, see
 * that file's header for why. This is the CMS half: a live list for the
 * inbox, and the one write a staff member is allowed to make here — moving
 * a submission's own status along.
 */

import { collection, doc, updateDoc, query, orderBy, onSnapshot, type Firestore, type Timestamp } from "firebase/firestore";
import type { Message, MessageStatus } from "@/content/seed";

/** English labels for the website's NEEDS ids (apps/website/src/components/contact-form.tsx) — this is a staff tool, no i18n needed. */
const NEED_LABEL: Record<string, string> = {
  editorial: "Content & editorial",
  translation: "Translation & localization",
  editing: "Editing & writing",
  media: "Media & press",
  launch: "Launch package",
  unsure: "Not sure yet",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatWhen(ts: unknown): string {
  const d = (ts as Timestamp | undefined)?.toDate?.();
  if (!d) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function toMessage(id: string, data: Record<string, unknown>): Message {
  const need = typeof data.need === "string" ? data.need : "";
  const status = data.status;
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    org: typeof data.org === "string" ? data.org : "",
    email: typeof data.email === "string" ? data.email : "",
    subject: NEED_LABEL[need] ?? need,
    need,
    langs: typeof data.langs === "string" ? data.langs : "",
    deadline: typeof data.deadline === "string" ? data.deadline : "",
    when: formatWhen(data.createdAt),
    status: status === "Replied" || status === "Archived" ? status : "New",
    body: typeof data.body === "string" ? data.body : "",
  };
}

export function watchSubmissions(
  db: Firestore,
  onChange: (messages: Message[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    query(collection(db, "submissions"), orderBy("createdAt", "desc")),
    (snap) => onChange(snap.docs.map((d) => toMessage(d.id, d.data()))),
    onError,
  );
}

export async function setSubmissionStatus(db: Firestore, id: string, status: MessageStatus): Promise<void> {
  await updateDoc(doc(db, "submissions", id), { status });
}
