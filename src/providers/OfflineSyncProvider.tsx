"use client";

import { type ReactNode, useEffect } from "react";
import { flushOfflineQueue } from "@/lib/offline/queue";

export default function OfflineSyncProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    flushOfflineQueue();
    const handleOnline = () => {
      flushOfflineQueue();
    };
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return <>{children}</>;
}
