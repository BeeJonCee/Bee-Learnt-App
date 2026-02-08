"use client";

import { type ReactNode, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/providers/AuthProvider";

type AccessibilityPrefs = {
  textScale: number;
  enableNarration: boolean;
  highContrast: boolean;
  language: string;
  translationEnabled: boolean;
};

export default function AccessibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const { data } = useApi<AccessibilityPrefs>(
    user ? "/api/accessibility" : null,
  );

  useEffect(() => {
    if (!data) return;
    const scale = Math.min(Math.max(data.textScale / 100, 0.8), 1.5);
    document.documentElement.style.fontSize = `${16 * scale}px`;
    document.documentElement.dataset.contrast = data.highContrast
      ? "high"
      : "normal";
    document.documentElement.lang = data.language || "en";
  }, [data]);

  return <>{children}</>;
}
