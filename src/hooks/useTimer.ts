"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseTimerOptions = {
  durationSeconds: number;
  onExpire?: () => void;
  autoStart?: boolean;
};

export function useTimer({
  durationSeconds,
  onExpire,
  autoStart = true,
}: UseTimerOptions) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setRemaining(durationSeconds);
    setIsRunning(false);
  }, [durationSeconds]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isWarning = remaining > 0 && remaining <= 300; // last 5 minutes

  return {
    remaining,
    formatted,
    isRunning,
    isWarning,
    isExpired: remaining <= 0,
    start,
    pause,
    reset,
  };
}
