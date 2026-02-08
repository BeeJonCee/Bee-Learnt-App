"use client";

import "@neondatabase/neon-js/ui/css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { ReactNode } from "react";
import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react";
import AccessibilityProvider from "@/providers/AccessibilityProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import OfflineSyncProvider from "@/providers/OfflineSyncProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { ThemeModeProvider } from "@/providers/ThemeModeProvider";
import { authClient } from "@/lib/auth/client";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <NeonAuthUIProvider emailOTP authClient={authClient}>
        <AuthProvider>
          <SocketProvider>
            <ThemeModeProvider>
              <AccessibilityProvider>
                <OfflineSyncProvider>{children}</OfflineSyncProvider>
              </AccessibilityProvider>
            </ThemeModeProvider>
          </SocketProvider>
        </AuthProvider>
      </NeonAuthUIProvider>
    </AppRouterCacheProvider>
  );
}
