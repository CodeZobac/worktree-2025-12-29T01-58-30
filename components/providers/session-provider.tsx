"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";

// Component to handle session error detection and auto sign-out
function SessionErrorHandler({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // If there's a refresh token error, sign out immediately
    if (session?.error === "RefreshAccessTokenError") {
      console.log("Session has refresh token error, signing out...");
      signOut({ callbackUrl: "/login" });
    }
  }, [session?.error]);

  return <>{children}</>;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionErrorHandler>{children}</SessionErrorHandler>
    </SessionProvider>
  );
}
