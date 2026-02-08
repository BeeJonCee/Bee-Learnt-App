"use client";

import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";

type AttemptReviewPayload = {
  attempt: {
    id: string;
    assessmentId: number;
    userId: string;
    status: string;
    startedAt: string;
    submittedAt?: string | null;
    totalScore?: number | null;
    maxScore?: number | null;
    percentage?: number | null;
  };
  assessment: {
    id: number;
    title: string;
    type: string;
    instructions?: string | null;
    showCorrectAnswers: boolean;
    showExplanations: boolean;
  };
  sections: Array<{
    id: number;
    title?: string | null;
    order: number;
    instructions?: string | null;
    questions: Array<{
      assessmentQuestionId: number;
      order: number;
      type: string;
      difficulty: string;
      questionText: string;
      options?: unknown;
      points: number;
      answer: unknown;
      isCorrect: boolean | null;
      score: number | null;
      maxScore: number | null;
      correctAnswer?: unknown;
      explanation?: string | null;
    }>;
  }>;
};

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function AttemptResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params?.attemptId ?? "";

  const { data, loading, error } = useApi<AttemptReviewPayload>(
    attemptId ? `/api/attempts/${encodeURIComponent(attemptId)}/review` : null,
  );

  const scoreLabel = useMemo(() => {
    if (!data) return "";
    const total = data.attempt.totalScore ?? 0;
    const max = data.attempt.maxScore ?? 0;
    if (!max) return `${total} pts`;
    return `${total} / ${max}`;
  }, [data]);

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}

      {loading || !data ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading results...</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h4">{data.assessment.title}</Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    label={data.attempt.status.replaceAll("_", " ")}
                  />
                  <Chip size="small" color="primary" label={scoreLabel} />
                  {typeof data.attempt.percentage === "number" ? (
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`${data.attempt.percentage}%`}
                    />
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {data.sections.map((section) => (
            <Card key={section.id}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6">
                      {section.title ?? `Section ${section.order}`}
                    </Typography>
                    {section.instructions ? (
                      <Typography variant="body2" color="text.secondary">
                        {section.instructions}
                      </Typography>
                    ) : null}
                  </Stack>

                  <Divider />

                  <Stack spacing={2}>
                    {section.questions.map((q) => (
                      <Card key={q.assessmentQuestionId} variant="outlined">
                        <CardContent>
                          <Stack spacing={1}>
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              alignItems="center"
                            >
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`Q${q.order}`}
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`${q.points} pts`}
                              />
                              {typeof q.isCorrect === "boolean" ? (
                                <Chip
                                  size="small"
                                  color={q.isCorrect ? "success" : "error"}
                                  label={q.isCorrect ? "Correct" : "Incorrect"}
                                />
                              ) : null}
                            </Stack>

                            <Typography variant="subtitle1">
                              {q.questionText}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              Your answer: {formatValue(q.answer)}
                            </Typography>

                            {q.correctAnswer !== undefined ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Correct answer: {formatValue(q.correctAnswer)}
                              </Typography>
                            ) : null}

                            {q.explanation ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Explanation: {q.explanation}
                              </Typography>
                            ) : null}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Stack>
  );
}
