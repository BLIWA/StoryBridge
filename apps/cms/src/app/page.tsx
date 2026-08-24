"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/login-screen";
import { Studio } from "@/components/shell/studio";
import { NoAccess } from "@/components/no-access";
import { DesignFx } from "@/components/fx/design-fx";

export default function CmsRoot() {
  const { user, staff, loading } = useAuth();

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
      {/* Three states, not two: signed out, signed in without a staff record,
          and actual staff. See lib/auth-context.tsx. */}
      {!user ? <LoginScreen /> : staff ? <Studio /> : <NoAccess />}
    </>
  );
}
