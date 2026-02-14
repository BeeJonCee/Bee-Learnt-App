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

type QuestionOption = {
  id: string;
  text: string;
};

function parseOptions(raw: unknown): QuestionOption[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((entry, index) => {
    if (typeof entry === "string") return { id: String(index), text: entry };
    if (entry && typeof entry === "object") {
      const option = entry as Record<string, unknown>;
      return {
        id: String(option.id ?? index),
        text: String(option.text ?? option.label ?? option.value ?? ""),
      };
    }
    return { id: String(index), text: String(entry) };
  });
}

function extractAnswerValue(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const payload = value as Record<string, unknown>;
  if (payload.value !== undefined) return payload.value;
  if (payload.answer !== undefined) return payload.answer;
  if (payload.correctAnswer !== undefined) return payload.correctAnswer;
  return value;
}

function optionLabel(value: unknown, optionsRaw: unknown): string {
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "boolean"
  ) {
    return "";
  }

  if (typeof value === "boolean") return value ? "True" : "False";

  const token = String(value).trim();
  if (!token) return "";

  const options = parseOptions(optionsRaw);
  const tokenLower = token.toLowerCase();
  const byId = options.find(
    (option) => option.id.trim().toLowerCase() === tokenLower,
  );
  if (byId) return byId.text;
  const byText = options.find(
    (option) => option.text.trim().toLowerCase() === tokenLower,
  );
  if (byText) return byText.text;
  return token;
}

function formatAnswer(value: unknown, optionsRaw: unknown): string {
  const extracted = extractAnswerValue(value);
  if (extracted === null || extracted === undefined) return "-";

  if (typeof extracted === "string") {
    return extracted.trim().length > 0
      ? optionLabel(extracted, optionsRaw)
      : "-";
  }

  if (typeof extracted === "number" || typeof extracted === "boolean") {
    return optionLabel(extracted, optionsRaw);
  }

  if (Array.isArray(extracted)) {
    if (extracted.length === 0) return "-";

    const isPairs = extracted.every(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        "left" in entry &&
        "right" in entry,
    );
    if (isPairs) {
      return extracted
        .map((entry) => {
          const pair = entry as { left: unknown; right: unknown };
          return `${String(pair.left)} -> ${String(pair.right)}`;
        })
        .join(", ");
    }

    return extracted
      .map((entry) => optionLabel(entry, optionsRaw))
      .filter((entry) => entry.trim().length > 0)
      .join(", ");
  }

  if (typeof extracted === "object") {
    const entries = Object.entries(extracted as Record<string, unknown>);
    if (entries.length > 0) {
      return entries
        .map(([left, right]) => `${left} -> ${optionLabel(right, optionsRaw)}`)
        .join(", ");
    }
  }

  try {
    return JSON.stringify(extracted);
  } catch {
    return String(extracted);
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
                              Your answer: {formatAnswer(q.answer, q.options)}
                            </Typography>

                            {q.correctAnswer !== undefined ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Correct answer:{" "}
                                {formatAnswer(q.correctAnswer, q.options)}
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
