"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * Signed in to Firebase, but not on the StoryBridge team. Reached by anyone who
 * authenticates without a `staff/{email}` record — a stale ex-contributor, or
 * someone who signed up with Google out of curiosity. Says so plainly rather
 * than dumping them back on the sign-in screen, which reads as a broken login.
 */
export function NoAccess() {
  const { user, signOut, refreshStaff } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EDE7DE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FDF8F1",
          border: "1px solid #E6E0D8",
          borderRadius: "8px",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          animation: "cms-rise .5s cubic-bezier(.2,.7,.2,1) both",
        }}
      >
        <div style={{ height: "4px", width: "120px", background: "#B57D49" }} />
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#8F6135",
          }}
        >
          No desk here yet
        </div>
        <h1
          style={{
            fontFamily: "'Source Serif 4',serif",
            fontWeight: 600,
            fontSize: "30px",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "#002D62",
            margin: 0,
          }}
        >
          You&rsquo;re signed in, but not on the team.
        </h1>
        <p style={{ fontSize: "14.5px", lineHeight: 1.7, color: "#5A6472", margin: 0 }}>
          Studio is limited to StoryBridge staff and named contributors.{" "}
          <strong style={{ color: "#3E4650" }}>{user?.email}</strong> hasn&rsquo;t been added yet. Ask
          an owner to add you under Settings &rarr; People, then reload.
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
          <button
            type="button"
            onClick={() => void refreshStaff()}
            data-hover="background:#001838"
            style={{
              background: "#002D62",
              color: "#FDF8F1",
              border: "none",
              borderRadius: "4px",
              padding: "12px 18px",
              fontWeight: 600,
              fontSize: "13.5px",
              cursor: "pointer",
              transition: "all .16s ease",
            }}
          >
            Check again
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            data-hover="background:#F1EBE3"
            style={{
              background: "#FDF8F1",
              border: "1px solid #D8D1C7",
              borderRadius: "4px",
              padding: "12px 18px",
              fontWeight: 600,
              fontSize: "13.5px",
              color: "#3E4650",
              cursor: "pointer",
              transition: "all .16s ease",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
