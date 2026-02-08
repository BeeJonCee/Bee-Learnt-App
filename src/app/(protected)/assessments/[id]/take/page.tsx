"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import QuestionRenderer from "@/components/assessments/QuestionRenderer";
import { useTimer } from "@/hooks/useTimer";
import { apiFetch } from "@/lib/utils/api";

type StartAttemptPayload = {
  attemptId: string;
  assessment: {
    id: number;
    title: string;
    type: string;
    timeLimitMinutes?: number | null;
    instructions?: string | null;
  };
  sections: Array<{
    id: number;
    title?: string | null;
    order: number;
    instructions?: string | null;
    questions: Array<{
      assessmentQuestionId: number;
      questionBankItemId: number;
      order: number;
      type: string;
      difficulty: string;
      questionText: string;
      questionHtml?: string | null;
      imageUrl?: string | null;
      options?: unknown;
      points: number;
    }>;
  }>;
};

export default function TakeAssessmentPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const assessmentId = Number(params?.id);
  const attemptIdFromQuery = searchParams.get("attemptId") ?? "";

  const [payload, setPayload] = useState<StartAttemptPayload | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingQuestionId, setSavingQuestionId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});

  const attemptId = payload?.attemptId ?? attemptIdFromQuery;
  const timeLimitSeconds = (payload?.assessment.timeLimitMinutes ?? 0) * 60;

  const handleAutoSubmit = useCallback(async () => {
    if (!attemptId) return;
    try {
      await apiFetch(`/api/attempts/${attemptId}/submit`, { method: "POST" });
      router.push(`/assessments/results/${encodeURIComponent(attemptId)}`);
    } catch {
      // if auto-submit fails, the user can still manually submit
    }
  }, [attemptId, router]);

  const timer = useTimer({
    durationSeconds: timeLimitSeconds || 999999,
    onExpire: timeLimitSeconds ? handleAutoSubmit : undefined,
    autoStart: !!timeLimitSeconds && !!payload,
  });

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      setError(null);
      setHydrating(true);

      try {
        if (!Number.isFinite(assessmentId)) {
          throw new Error("Invalid assessment id.");
        }

        if (attemptIdFromQuery) {
          const cached = window.sessionStorage.getItem(
            `beelearn-attempt:${attemptIdFromQuery}`,
          );
          if (cached) {
            const parsed = JSON.parse(cached) as StartAttemptPayload;
            if (active) setPayload(parsed);
            return;
          }
        }

        const started = await apiFetch<StartAttemptPayload>(
          `/api/assessments/${assessmentId}/start`,
          {
            method: "POST",
          },
        );
        window.sessionStorage.setItem(
          `beelearn-attempt:${started.attemptId}`,
          JSON.stringify(started),
        );

        if (!active) return;
        setPayload(started);

        router.replace(
          `/assessments/${assessmentId}/take?attemptId=${encodeURIComponent(started.attemptId)}`,
        );
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assessment attempt.",
        );
      } finally {
        if (active) setHydrating(false);
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, [assessmentId, attemptIdFromQuery, router]);

  const flatQuestions = useMemo(() => {
    if (!payload) return [];
    return payload.sections.flatMap((section) =>
      section.questions.map((q) => ({
        ...q,
        sectionTitle: section.title ?? `Section ${section.order}`,
      })),
    );
  }, [payload]);

  const current = flatQuestions[currentIndex] ?? null;
  const progress =
    flatQuestions.length > 0
      ? Math.round(((currentIndex + 1) / flatQuestions.length) * 100)
      : 0;

  const saveAnswer = async (assessmentQuestionId: number, value: unknown) => {
    if (!attemptId) return;
    setError(null);
    setSavingQuestionId(assessmentQuestionId);
    try {
      await apiFetch(`/api/attempts/${attemptId}/answer`, {
        method: "PUT",
        body: JSON.stringify({ assessmentQuestionId, answer: value }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save answer.");
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleChange = useCallback(
    (questionId: number, value: unknown) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      void saveAnswer(questionId, value);
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: setAnswers is stable
    [saveAnswer],
  );

  const handleSubmit = async () => {
    if (!attemptId) return;
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/api/attempts/${attemptId}/submit`, { method: "POST" });
      router.push(`/assessments/results/${encodeURIComponent(attemptId)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit attempt.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (hydrating || !payload) {
    return (
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Preparing assessment...
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  if (!current) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">This assessment has no questions.</Alert>
        <Button variant="outlined" href={`/assessments/${assessmentId}`}>
          Back
        </Button>
      </Stack>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Stack spacing={0.5}>
                <Typography variant="h5">{payload.assessment.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Question {currentIndex + 1} of {flatQuestions.length} •{" "}
                  {current.points} pts • {current.sectionTitle}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                {timeLimitSeconds > 0 && (
                  <Chip
                    label={timer.formatted}
                    color={timer.isWarning ? "error" : "default"}
                    variant={timer.isWarning ? "filled" : "outlined"}
                  />
                )}
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${answeredCount}/${flatQuestions.length} answered`}
                />
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 6 }}
            />

            {payload.assessment.instructions ? (
              <>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  {payload.assessment.instructions}
                </Typography>
              </>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {/* Question navigation chips */}
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {flatQuestions.map((q, i) => (
          <Chip
            key={q.assessmentQuestionId}
            label={i + 1}
            size="small"
            color={
              i === currentIndex
                ? "primary"
                : answers[q.assessmentQuestionId] !== undefined
                  ? "success"
                  : "default"
            }
            variant={i === currentIndex ? "filled" : "outlined"}
            onClick={() => setCurrentIndex(i)}
            sx={{ minWidth: 32 }}
          />
        ))}
      </Stack>

      <Card>
        <CardContent>
          <QuestionRenderer
            question={current}
            answer={answers[current.assessmentQuestionId]}
            onChange={handleChange}
          />
          {savingQuestionId === current.assessmentQuestionId ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Saving...
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              disabled={currentIndex >= flatQuestions.length - 1}
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(prev + 1, flatQuestions.length - 1),
                )
              }
            >
              Next
            </Button>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
