"use client";

import { useEffect, useRef, useState } from "react";

/** Matches the (until now, display-only) copy in Settings → Security. */
const IDLE_LIMIT_MS = 12 * 60 * 60 * 1000;
const WARNING_LEAD_MS = 60 * 1000;

// A stream of mousemove events shouldn't mean a stream of timer resets —
// only the first one in any window this size does. Doesn't affect when the
// 12-hour clock actually runs out, only how often it gets rearmed while
// someone is actively working.
const THROTTLE_MS = 30 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "keydown", "mousedown", "wheel", "touchstart"] as const;

/**
 * Signs the CMS session out after IDLE_LIMIT_MS with no user activity,
 * warning WARNING_LEAD_MS before it happens. Mounted once in Studio (see
 * shell/studio.tsx) — signed-out screens have no session to expire.
 */
export function useIdleSignOut(onTimeout: () => void): { warning: boolean; stayActive: () => void } {
  const [warning, setWarning] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const warnTimerRef = useRef<number | null>(null);
  const lastResetRef = useRef(0);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // A ref rather than a plain function so both the DOM listener installed
  // below and the `stayActive` escape hatch returned to the caller can
  // reach the same reschedule logic without re-subscribing on every render.
  const rearmRef = useRef<() => void>(() => {});

  useEffect(() => {
    function clear() {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      if (warnTimerRef.current !== null) window.clearTimeout(warnTimerRef.current);
    }

    function rearm() {
      clear();
      lastResetRef.current = Date.now();
      setWarning(false);
      warnTimerRef.current = window.setTimeout(() => setWarning(true), IDLE_LIMIT_MS - WARNING_LEAD_MS);
      timeoutRef.current = window.setTimeout(() => onTimeoutRef.current(), IDLE_LIMIT_MS);
    }
    rearmRef.current = rearm;

    function onActivity() {
      if (Date.now() - lastResetRef.current < THROTTLE_MS) return;
      rearm();
    }

    rearm();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      clear();
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, []);

  return {
    warning,
    // The explicit "Stay signed in" button — always rearms, ignoring the
    // throttle above (that's for ambient activity, this is a deliberate click).
    stayActive: () => rearmRef.current(),
  };
}
