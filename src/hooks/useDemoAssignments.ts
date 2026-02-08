"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Assignment,
  getAssignments,
  getAssignmentsByModuleId,
} from "@/lib/demo-data";
import {
  type AssignmentProgress,
  getAssignmentProgress,
  upsertAssignmentProgress,
} from "@/lib/demo-storage";

export type AssignmentWithStatus = Assignment & {
  completed: boolean;
  completedAt?: string | null;
};

function getDaysUntil(date: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(date);
  const diff = due.getTime() - startOfDay.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function useDemoAssignments(userId?: string | null) {
  const [progress, setProgress] = useState<Record<number, AssignmentProgress>>(
    {},
  );

  useEffect(() => {
    if (!userId) {
      setProgress({});
      return;
    }
    setProgress(getAssignmentProgress(userId));
  }, [userId]);

  const toggleAssignment = useCallback(
    (assignmentId: number) => {
      if (!userId) return;
      setProgress((prev) => {
        const current = prev[assignmentId];
        const nextCompleted = !current?.completed;
        const entry = upsertAssignmentProgress(userId, assignmentId, {
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        });
        return {
          ...prev,
          [assignmentId]: entry,
        };
      });
    },
    [userId],
  );

  const assignments = useMemo<AssignmentWithStatus[]>(() => {
    return getAssignments().map((assignment) => ({
      ...assignment,
      completed: Boolean(progress[assignment.id]?.completed),
      completedAt: progress[assignment.id]?.completedAt ?? null,
    }));
  }, [progress]);

  const getAssignmentsForModule = useCallback(
    (moduleId: number) => {
      const moduleAssignments = getAssignmentsByModuleId(moduleId);
      return moduleAssignments.map((assignment) => ({
        ...assignment,
        completed: Boolean(progress[assignment.id]?.completed),
        completedAt: progress[assignment.id]?.completedAt ?? null,
      }));
    },
    [progress],
  );

  const summary = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter(
      (assignment) => assignment.completed,
    ).length;
    const pending = total - completed;
    const dueSoon = assignments.filter((assignment) => {
      if (assignment.completed) return false;
      const days = getDaysUntil(assignment.dueDate);
      return days >= 0 && days <= 7;
    }).length;
    const overdue = assignments.filter((assignment) => {
      if (assignment.completed) return false;
      return getDaysUntil(assignment.dueDate) < 0;
    }).length;

    return {
      total,
      completed,
      pending,
      dueSoon,
      overdue,
    };
  }, [assignments]);

  return {
    assignments,
    progress,
    summary,
    toggleAssignment,
    getAssignmentsForModule,
  };
}
