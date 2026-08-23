"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

/**
 * "The Bridge" signup, from the board's navy CTA block.
 *
 * The board only flips a `subscribed` flag — there is no backend behind it yet.
 * Delivery is Cloud Functions + a transactional email provider in roadmap
 * Phase 06; until that exists this stores nothing, so it must not imply it did.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubscribed(true);
      }}
      style={{ display: "flex", flexDirection: "column", gap: "14px" }}
    >
      <div style={{ display: "flex", gap: "12px" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Your email address"
          style={{
            flex: 1,
            border: "1.5px solid rgba(253,248,241,0.24)",
            borderRadius: "2px",
            padding: "14px 15px",
            fontSize: "15px",
            color: "#FDF8F1",
            background: "#072448",
          }}
        />
        <button
          type="submit"
          data-hover="background:#C99D74"
          style={{
            background: "#B57D49",
            color: "#001838",
            border: "none",
            borderRadius: "4px",
            padding: "14px 26px",
            fontWeight: 600,
            fontSize: "15px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all .16s ease",
          }}
        >
          Subscribe
        </button>
      </div>
      {subscribed && (
        <div role="status" style={{ fontSize: "14px", color: "#B57D49", fontWeight: 500 }}>
          Not connected yet — subscriptions go live when The Bridge starts sending.
        </div>
      )}
      <div style={{ fontSize: "13px", lineHeight: "1.6", color: "rgba(253,248,241,0.55)" }}>
        Monthly. No pitches, no drip sequence.{" "}
        <Link href="/newsletter" style={{ color: "#B57D49", fontWeight: 500 }}>
          See past issues →
        </Link>
      </div>
    </form>
  );
}
