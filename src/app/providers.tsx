"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { ReactNode } from "react";
import AccessibilityProvider from "@/providers/AccessibilityProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import OfflineSyncProvider from "@/providers/OfflineSyncProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { ThemeModeProvider } from "@/providers/ThemeModeProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <AuthProvider>
        <SocketProvider>
          <ThemeModeProvider>
            <AccessibilityProvider>
              <OfflineSyncProvider>{children}</OfflineSyncProvider>
            </AccessibilityProvider>
          </ThemeModeProvider>
        </SocketProvider>
      </AuthProvider>
    </AppRouterCacheProvider>
  );
}
