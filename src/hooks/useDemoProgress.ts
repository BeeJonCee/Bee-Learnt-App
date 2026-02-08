"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLessonById, type Lesson } from "@/lib/demo-data";
import {
  getLessonProgress,
  type LessonProgress,
  upsertLessonProgress,
} from "@/lib/demo-storage";

export function useDemoProgress(userId?: string | null) {
  const [progress, setProgress] = useState<Record<number, LessonProgress>>({});

  useEffect(() => {
    if (!userId) return;
    setProgress(getLessonProgress(userId));
  }, [userId]);

  const touchLesson = useCallback(
    (lessonId: number) => {
      if (!userId) return;
      const entry = upsertLessonProgress(userId, lessonId, {
        lastAccessed: new Date().toISOString(),
      });
      setProgress((prev) => ({
        ...prev,
        [lessonId]: entry,
      }));
    },
    [userId],
  );

  const markLessonComplete = useCallback(
    (lessonId: number) => {
      if (!userId) return;
      const entry = upsertLessonProgress(userId, lessonId, {
        completed: true,
        lastAccessed: new Date().toISOString(),
      });
      setProgress((prev) => ({
        ...prev,
        [lessonId]: entry,
      }));
    },
    [userId],
  );

  const recentProgress = useMemo(() => {
    return Object.values(progress)
      .sort((a, b) => {
        return (
          new Date(b.lastAccessed).getTime() -
          new Date(a.lastAccessed).getTime()
        );
      })
      .slice(0, 5)
      .map((entry) => ({
        ...entry,
        lesson: getLessonById(entry.lessonId),
      }))
      .filter((entry): entry is LessonProgress & { lesson: Lesson } =>
        Boolean(entry.lesson),
      );
  }, [progress]);

  const completedCount = useMemo(() => {
    return Object.values(progress).filter((entry) => entry.completed).length;
  }, [progress]);

  return {
    progress,
    recentProgress,
    completedCount,
    touchLesson,
    markLessonComplete,
  };
}
