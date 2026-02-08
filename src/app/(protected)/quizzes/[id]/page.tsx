"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

export default function QuizPage() {
  const params = useParams();
  const idParam = params?.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const { data: quizPayload, loading } = useApi<{
    quiz: {
      id: number;
      moduleId: number;
      title: string;
      description?: string | null;
    };
    questions: {
      id: number;
      type: "multiple_choice" | "short_answer" | "essay";
      questionText: string;
      options: string[] | null;
      points: number;
    }[];
  }>(Number.isNaN(id) ? null : `/api/quizzes/${id}`);
  const quiz = quizPayload?.quiz;
  const questions = quizPayload?.questions ?? [];
  const { data: moduleData } = useApi<{ id: number }>(
    quiz ? `/api/modules/${quiz.moduleId}` : null,
  );
  const moduleHref = moduleData ? `/modules/${moduleData.id}` : "/subjects";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    feedback: string;
    recommendedDifficulty?: "easy" | "medium" | "hard";
  } | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<
    Record<
      number,
      { isCorrect: boolean; hint: string; explanation: string | null }
    >
  >({});
  const [checkingQuestionId, setCheckingQuestionId] = useState<number | null>(
    null,
  );

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round(((currentQuestion + 1) / questions.length) * 100);
  }, [currentQuestion, questions.length]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Loading quiz...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Quiz not found</Typography>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">No questions available</Typography>
          <Typography color="text.secondary">
            This quiz does not have any questions yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    const payload = {
      quizId: quiz.id,
      answers: questions.map((question) => ({
        questionId: question.id,
        answer: (answers[question.id] ?? "").trim(),
      })),
    };

    const response = await apiFetch<{
      score: number;
      maxScore: number;
      feedback: string;
      recommendedDifficulty?: "easy" | "medium" | "hard";
    }>("/api/quizzes/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setResult(response);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
  };

  if (result) {
    return (
      <Card sx={{ maxWidth: 520, mx: "auto" }}>
        <CardContent>
          <Stack spacing={3} textAlign="center">
            <CheckCircleIcon
              sx={{ fontSize: 64, color: "primary.main", mx: "auto" }}
            />
            <Typography variant="h4">Quiz completed</Typography>
            <Typography variant="h2" sx={{ color: "primary.main" }}>
              {Math.round((result.score / result.maxScore) * 100)}%
            </Typography>
            <Typography color="text.secondary">{result.feedback}</Typography>
            {result.recommendedDifficulty && (
              <Typography variant="body2" color="text.secondary">
                Next suggested difficulty: {result.recommendedDifficulty}
              </Typography>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                component={Link}
                href={moduleHref}
                variant="contained"
                fullWidth
              >
                Back to module
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                fullWidth
              >
                Retake
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const feedback = feedbackMap[question.id];

  return (
    <Stack spacing={3} sx={{ maxWidth: 820, mx: "auto" }}>
      <Box>
        <Typography variant="h4">{quiz.title}</Typography>
        <Typography color="text.secondary">{quiz.description}</Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8 }}
      />

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <Typography variant="h5">{question.questionText}</Typography>

            <Stack spacing={1.5}>
              {question.type === "multiple_choice" &&
                question.options?.map((option) => (
                  <Button
                    key={option}
                    variant={
                      answers[question.id] === option ? "contained" : "outlined"
                    }
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: option,
                      }))
                    }
                  >
                    {option}
                  </Button>
                ))}

              {question.type !== "multiple_choice" && (
                <TextField
                  placeholder="Type your answer"
                  multiline
                  minRows={3}
                  value={answers[question.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: event.target.value,
                    }))
                  }
                />
              )}
            </Stack>

            {feedback && (
              <Alert severity={feedback.isCorrect ? "success" : "info"}>
                {feedback.isCorrect
                  ? feedback.explanation || "Great job! You got it right."
                  : feedback.hint}
              </Alert>
            )}

            <Box textAlign="right">
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  onClick={async () => {
                    if (!answers[question.id]) return;
                    setCheckingQuestionId(question.id);
                    try {
                      const response = await apiFetch<{
                        questionId: number;
                        isCorrect: boolean;
                        hint: string;
                        explanation: string | null;
                      }>("/api/quizzes/check", {
                        method: "POST",
                        body: JSON.stringify({
                          questionId: question.id,
                          answer: answers[question.id],
                        }),
                      });
                      setFeedbackMap((prev) => ({
                        ...prev,
                        [question.id]: response,
                      }));
                    } finally {
                      setCheckingQuestionId(null);
                    }
                  }}
                  disabled={
                    !answers[question.id] || checkingQuestionId === question.id
                  }
                >
                  {checkingQuestionId === question.id
                    ? "Checking..."
                    : "Check answer"}
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  disabled={!answers[question.id]}
                >
                  {currentQuestion === questions.length - 1
                    ? "Submit quiz"
                    : "Next question"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
