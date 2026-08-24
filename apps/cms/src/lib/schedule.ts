/**
 * Send-time helpers for The Bridge.
 *
 * A scheduled send is stored as a wall-clock date, a wall-clock time and a zone
 * — that is what an editor actually picks ("the 1st, 09:00, Tunis time") — and
 * is only resolved to an instant when something has to compare it with now.
 *
 * Zones carry a fixed offset rather than an IANA rule. The CMS offers five, and
 * a fixed offset is honest about that approximation; the sending pipeline
 * (roadmap Phase 06) resolves the zone properly on the server, where the send
 * actually happens.
 *
 * Everything here formats from the stored parts rather than through
 * `toLocaleString`, so the string an editor in Tunis reads is the string an
 * editor in Paris reads, and so a static prerender matches what the browser
 * renders after hydration.
 */

export type Zone = { id: string; label: string; short: string; offsetMinutes: number };

export const ZONES: Zone[] = [
  { id: "tunis", label: "Tunis (UTC+1)", short: "UTC+1", offsetMinutes: 60 },
  { id: "paris", label: "Paris (UTC+2)", short: "UTC+2", offsetMinutes: 120 },
  { id: "london", label: "London (UTC+1)", short: "UTC+1", offsetMinutes: 60 },
  { id: "utc", label: "UTC", short: "UTC", offsetMinutes: 0 },
  { id: "newYork", label: "New York (UTC−4)", short: "UTC−4", offsetMinutes: -240 },
];

/** The desk's own zone: the default for new sends and the one log stamps read in. */
export const DEFAULT_ZONE = "tunis";

export function zone(id: string): Zone {
  return ZONES.find((z) => z.id === id) ?? ZONES[0];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const pad = (n: number) => String(n).padStart(2, "0");

function offsetSuffix(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Absolute instant in ms for a wall-clock slot, or null if a half is missing or unparseable. */
export function toInstant(date: string | null, time: string | null, zoneId: string): number | null {
  if (!date || !time) return null;
  const ms = Date.parse(`${date}T${time}:00${offsetSuffix(zone(zoneId).offsetMinutes)}`);
  return Number.isNaN(ms) ? null : ms;
}

/** "2026-09-01" → "Tuesday 1 September 2026" (long) or "01 Sep 2026" (short). */
export function formatDate(date: string | null, style: "long" | "short" = "long"): string {
  if (!date) return "—";
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  if (style === "short") return `${pad(d)} ${MONTHS_SHORT[m - 1]} ${y}`;
  return `${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
}

/** The whole slot as one line: "Tuesday 1 September 2026 at 09:00 (UTC+1)". */
export function formatSlot(
  date: string | null,
  time: string | null,
  zoneId: string,
  style: "long" | "short" = "long",
): string {
  if (!date || !time) return "No send time set";
  const z = zone(zoneId);
  if (style === "short") return `${formatDate(date, "short")} · ${time} ${z.short}`;
  return `${formatDate(date, "long")} at ${time} (${z.short})`;
}

/** "in 8 days" / "4 hours ago". Coarse on purpose — a send window is not a stopwatch. */
export function relative(instantMs: number, nowMs: number): string {
  const diffMs = instantMs - nowMs;
  const seconds = Math.abs(diffMs) / 1000;

  let label: string;
  if (seconds < 60) label = "less than a minute";
  else if (seconds < 3600) label = plural(Math.round(seconds / 60), "minute");
  else if (seconds < 172800) label = plural(Math.round(seconds / 3600), "hour");
  else label = plural(Math.round(seconds / 86400), "day");

  return diffMs < 0 ? `${label} ago` : `in ${label}`;
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/** "24 Aug 2026 · 14:32", read in `zoneId` so every editor sees the same stamp. */
export function formatStamp(iso: string, zoneId: string = DEFAULT_ZONE): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  const t = new Date(ms + zone(zoneId).offsetMinutes * 60_000);
  return `${pad(t.getUTCDate())} ${MONTHS_SHORT[t.getUTCMonth()]} ${t.getUTCFullYear()} · ${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`;
}

/** Today's date in `zoneId` as "YYYY-MM-DD" — the earliest date the picker should accept. */
export function todayIn(nowMs: number, zoneId: string = DEFAULT_ZONE): string {
  const t = new Date(nowMs + zone(zoneId).offsetMinutes * 60_000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/**
 * Everything standing between this draft and a scheduled send, in the order an
 * editor would fix them. An empty list is the only thing that enables Schedule.
 *
 * `nowMs` is null until the client has mounted (the prerender has no clock), and
 * the past-date check is skipped for that one render rather than guessed at.
 */
export function scheduleProblems(input: {
  subject: string;
  preheader: string;
  pickCount: number;
  recipients: number;
  date: string | null;
  time: string | null;
  zoneId: string;
  nowMs: number | null;
}): string[] {
  const problems: string[] = [];

  if (!input.subject.trim()) problems.push("The subject line is empty.");
  else if (input.subject.trim().length > 90) problems.push("The subject line is over 90 characters — inboxes will cut it.");

  if (!input.preheader.trim()) problems.push("The preview text is empty.");
  if (input.pickCount === 0) problems.push("No pieces are included in the letter.");
  if (input.recipients === 0) problems.push("The chosen audience has no subscribers in it.");

  if (!input.date) problems.push("Pick a send date.");
  if (!input.time) problems.push("Pick a send time.");

  const instant = toInstant(input.date, input.time, input.zoneId);
  if (instant !== null && input.nowMs !== null && instant <= input.nowMs) {
    problems.push("That send time has already passed.");
  }

  return problems;
}
