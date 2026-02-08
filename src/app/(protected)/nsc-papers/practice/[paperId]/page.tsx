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
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type NscPaperDetail = {
  id: number;
  subjectName?: string;
  year: number;
  session: string;
  paperNumber: number;
  totalMarks?: number | null;
  durationMinutes?: number | null;
  isProcessed: boolean;
};

type NscQuestion = {
  id: number;
  questionNumber: string;
  questionText: string;
  marks: number;
  sectionLabel?: string | null;
  memoText?: string | null;
};

const sessionLabels: Record<string, string> = {
  november: "November",
  may_june: "May/June",
  february_march: "Feb/March",
  supplementary: "Supplementary",
  exemplar: "Exemplar",
};

export default function NscPaperPracticePage() {
  const params = useParams<{ paperId: string }>();
  const router = useRouter();
  const paperId = Number(params?.paperId);

  const [showMemo, setShowMemo] = useState<Record<number, boolean>>({});
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: paper,
    loading: paperLoading,
    error: paperError,
  } = useApi<NscPaperDetail>(
    Number.isFinite(paperId) ? `/api/nsc-papers/${paperId}` : null,
  );

  const {
    data: questions,
    loading: questionsLoading,
    error: questionsError,
  } = useApi<NscQuestion[]>(
    Number.isFinite(paperId) ? `/api/nsc-papers/${paperId}/questions` : null,
  );

  const loading = paperLoading || questionsLoading;
  const error = paperError || questionsError;

  const title = paper
    ? `${paper.subjectName ?? "Subject"} P${paper.paperNumber} — ${
        sessionLabels[paper.session] ?? paper.session
      } ${paper.year}`
    : "NSC Paper Practice";

  const handleStartAssessment = async () => {
    setActionError(null);
    setCreating(true);
    try {
      const result = await apiFetch<{ assessmentId: number }>(
        `/api/nsc-papers/${paperId}/import-to-bank`,
        { method: "POST", body: JSON.stringify({}) },
      );
      // If a linked assessment exists, navigate to it
      if (result?.assessmentId) {
        router.push(`/assessments/${result.assessmentId}`);
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to create practice assessment.",
      );
    } finally {
      setCreating(false);
    }
  };

  const toggleMemo = (questionId: number) => {
    setShowMemo((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}
      {actionError && <Alert severity="error">{actionError}</Alert>}

      {loading || !paper ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading paper...</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h4">{title}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {paper.totalMarks && (
                    <Chip
                      size="small"
                      color="primary"
                      label={`${paper.totalMarks} marks`}
                    />
                  )}
                  {paper.durationMinutes && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${paper.durationMinutes} min`}
                    />
                  )}
                </Stack>

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={handleStartAssessment}
                    disabled={creating}
                  >
                    {creating ? "Setting up..." : "Start timed practice"}
                  </Button>
                  <Button variant="outlined" href={`/nsc-papers/${paperId}`}>
                    Back to paper
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {!questions || questions.length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  No extracted questions available for this paper yet. You can
                  still download the PDF from the paper detail page.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              <Typography variant="h6">
                Questions ({questions.length})
              </Typography>
              {questions.map((q) => (
                <Card key={q.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Q${q.questionNumber}`}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${q.marks} marks`}
                        />
                        {q.sectionLabel && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={q.sectionLabel}
                          />
                        )}
                      </Stack>

                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {q.questionText}
                      </Typography>

                      {q.memoText && (
                        <Box>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => toggleMemo(q.id)}
                          >
                            {showMemo[q.id] ? "Hide memo" : "Show memo"}
                          </Button>
                          {showMemo[q.id] && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: 1,
                                bgcolor: "action.hover",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: "pre-wrap" }}
                              >
                                {q.memoText}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
