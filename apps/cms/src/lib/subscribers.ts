/**
 * Newsletter subscribers, read side — the website writes these directly
 * (apps/website/src/lib/subscribers.ts). No send pipeline reads this yet;
 * it exists so the CMS can show who's actually on the list instead of the
 * design board's sample data.
 */

import { collection, query, orderBy, onSnapshot, type Firestore, type Timestamp } from "firebase/firestore";

export type Subscriber = {
  email: string;
  status: string;
  lang: string;
  source: string;
  joined: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatJoined(ts: unknown): string {
  const d = (ts as Timestamp | undefined)?.toDate?.();
  if (!d) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function watchSubscribers(
  db: Firestore,
  onChange: (subscribers: Subscriber[]) => void,
  onError: (error: unknown) => void,
) {
  return onSnapshot(
    query(collection(db, "subscribers"), orderBy("subscribedAt", "desc")),
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            email: d.id,
            status: typeof data.status === "string" ? data.status : "Subscribed",
            lang: typeof data.lang === "string" ? data.lang : "",
            source: typeof data.source === "string" ? data.source : "",
            joined: formatJoined(data.subscribedAt),
          };
        }),
      ),
    onError,
  );
}
