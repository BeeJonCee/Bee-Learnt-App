"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type AssessmentDetail = {
  assessment: {
    id: number;
    title: string;
    description?: string | null;
    type:
      | "quiz"
      | "test"
      | "exam"
      | "practice"
      | "nsc_simulation"
      | "diagnostic";
    status: "draft" | "published" | "archived";
    subjectId: number;
    grade?: number | null;
    moduleId?: number | null;
    timeLimitMinutes?: number | null;
    instructions?: string | null;
    showCorrectAnswers: boolean;
    showExplanations: boolean;
    showResultsImmediately: boolean;
  };
  sections: Array<{
    id: number;
    title?: string | null;
    instructions?: string | null;
    order: number;
    timeLimitMinutes?: number | null;
    questions: Array<{
      assessmentQuestionId: number;
      questionBankItemId: number;
      order: number;
      type: string;
      difficulty: string;
      questionText: string;
      options?: unknown;
      points: number;
    }>;
  }>;
};

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

function formatType(value: string) {
  return value.replaceAll("_", " ").toUpperCase();
}

export default function AssessmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assessmentId = Number(params?.id);
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error } = useApi<AssessmentDetail>(
    Number.isFinite(assessmentId) ? `/api/assessments/${assessmentId}` : null,
  );

  const questionCount = useMemo(() => {
    if (!data?.sections) return 0;
    return data.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0,
    );
  }, [data?.sections]);

  const handleStart = async () => {
    if (!Number.isFinite(assessmentId)) return;
    setActionError(null);
    setStarting(true);
    try {
      const payload = await apiFetch<StartAttemptPayload>(
        `/api/assessments/${assessmentId}/start`,
        {
          method: "POST",
        },
      );
      window.sessionStorage.setItem(
        `beelearn-attempt:${payload.attemptId}`,
        JSON.stringify(payload),
      );
      router.push(
        `/assessments/${assessmentId}/take?attemptId=${encodeURIComponent(payload.attemptId)}`,
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to start assessment.",
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}
      {actionError && <Alert severity="error">{actionError}</Alert>}

      {loading || !data ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Loading assessment...
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                alignItems="center"
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={formatType(data.assessment.type)}
                />
                {data.assessment.grade ? (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Grade ${data.assessment.grade}`}
                  />
                ) : null}
                {data.assessment.timeLimitMinutes ? (
                  <Chip
                    size="small"
                    color="primary"
                    label={`${data.assessment.timeLimitMinutes} min`}
                  />
                ) : (
                  <Chip size="small" color="primary" label="Untimed" />
                )}
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${questionCount} questions`}
                />
              </Stack>

              <Box>
                <Typography variant="h4">{data.assessment.title}</Typography>
                {data.assessment.description ? (
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {data.assessment.description}
                  </Typography>
                ) : null}
              </Box>

              {data.assessment.instructions ? (
                <>
                  <Divider />
                  <Typography variant="body2">
                    {data.assessment.instructions}
                  </Typography>
                </>
              ) : null}

              <Divider />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  onClick={handleStart}
                  disabled={starting}
                >
                  {starting ? "Starting..." : "Start"}
                </Button>
                <Button variant="outlined" href="/assessments">
                  Back to assessments
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
