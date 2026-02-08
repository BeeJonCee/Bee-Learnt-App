"use client";

import { useApi } from "./useApi";

type MasteryEntry = {
  topicId: number;
  topicTitle: string;
  subjectId: number;
  subjectName: string;
  totalQuestions: number;
  correctAnswers: number;
  masteryPercent: number;
  lastAttemptAt: string | null;
};

type WeakTopic = {
  topicId: number;
  topicTitle: string;
  masteryPercent: number;
  totalQuestions: number;
  correctAnswers: number;
};

type MasteryResponse = { userId: string; mastery: MasteryEntry[] };
type WeakTopicsResponse = { userId: string; weakTopics: WeakTopic[] };
type OverallResponse = { userId: string; overallMastery: number };

export function useMastery(options?: { subjectId?: number }) {
  const subjectParam = options?.subjectId
    ? `?subjectId=${options.subjectId}`
    : "";

  const {
    data: masteryData,
    loading: masteryLoading,
    error: masteryError,
    refetch: refetchMastery,
  } = useApi<MasteryResponse>(`/api/progress/mastery${subjectParam}`);

  const { data: weakData, loading: weakLoading } = useApi<WeakTopicsResponse>(
    "/api/progress/mastery/weak?limit=5",
  );

  const { data: strongData, loading: strongLoading } =
    useApi<WeakTopicsResponse>("/api/progress/mastery/strong?limit=5");

  const { data: overallData, loading: overallLoading } =
    useApi<OverallResponse>("/api/progress/mastery/overall");

  return {
    mastery: masteryData?.mastery ?? [],
    weakTopics: weakData?.weakTopics ?? [],
    strongTopics: strongData?.weakTopics ?? [],
    overallMastery: overallData?.overallMastery ?? 0,
    loading: masteryLoading || weakLoading || strongLoading || overallLoading,
    error: masteryError,
    refetch: refetchMastery,
  };
}
