"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/login-screen";
import { Studio } from "@/components/shell/studio";
import { DesignFx } from "@/components/fx/design-fx";

export default function CmsRoot() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EDE7DE",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#8A8378",
          }}
        >
          Opening the desk…
        </div>
      </div>
    );
  }

  return (
    <>
      <DesignFx />
      {user ? <Studio /> : <LoginScreen />}
    </>
  );
}
