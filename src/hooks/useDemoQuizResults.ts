"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getQuizResults,
  type QuizResult,
  saveQuizResult,
} from "@/lib/demo-storage";

export function useDemoQuizResults(userId?: string | null) {
  const [results, setResults] = useState<Record<number, QuizResult>>({});

  useEffect(() => {
    if (!userId) return;
    setResults(getQuizResults(userId));
  }, [userId]);

  const recordResult = useCallback(
    (result: QuizResult) => {
      if (!userId) return;
      saveQuizResult(userId, result);
      setResults((prev) => ({
        ...prev,
        [result.quizId]: result,
      }));
    },
    [userId],
  );

  const stats = useMemo(() => {
    const entries = Object.values(results);
    if (entries.length === 0) {
      return { totalAttempts: 0, averageScore: 0 };
    }
    const averageScore = Math.round(
      entries.reduce((total, entry) => total + entry.score, 0) / entries.length,
    );
    return {
      totalAttempts: entries.length,
      averageScore,
    };
  }, [results]);

  return {
    results,
    stats,
    recordResult,
  };
}
