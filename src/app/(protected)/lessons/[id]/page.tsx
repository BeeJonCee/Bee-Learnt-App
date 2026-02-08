"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import LessonNotes from "@/components/LessonNotes";
import LessonResources from "@/components/LessonResources";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";
import { useAuth } from "@/providers/AuthProvider";

export default function LessonPage() {
  const params = useParams();
  const idParam = params?.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const { data: lesson, loading: lessonLoading } = useApi<{
    id: number;
    moduleId: number;
    title: string;
    content?: string | null;
    type: "text" | "video" | "diagram" | "pdf";
    videoUrl?: string | null;
    diagramUrl?: string | null;
    pdfUrl?: string | null;
  }>(Number.isNaN(id) ? null : `/api/lessons/${id}`);
  const { data: moduleData } = useApi<{
    id: number;
    title: string;
  }>(lesson ? `/api/modules/${lesson.moduleId}` : null);
  const { data: unlockedModules, loading: accessLoading } = useApi<
    { moduleId: number }[]
  >(lesson ? "/api/user-modules" : null);
  const { user } = useAuth();
  const { data: accessibility } = useApi<{
    textScale: number;
    enableNarration: boolean;
    language: string;
    translationEnabled: boolean;
  }>("/api/accessibility");
  const { data: progressEntries, refetch: refetchProgress } = useApi<
    { id: number; completed: boolean }[]
  >(Number.isNaN(id) ? null : `/api/progress?lessonId=${id}`);
  const moduleHref = moduleData ? `/modules/${moduleData.id}` : "/subjects";
  const [translatedContent, setTranslatedContent] = useState<string | null>(
    null,
  );
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    apiFetch("/api/progress", {
      method: "POST",
      body: JSON.stringify({
        lessonId: lesson.id,
        moduleId: lesson.moduleId,
        timeSpentMinutes: 0,
      }),
    }).catch(() => {});
  }, [lesson]);

  useEffect(() => {
    setTranslatedContent(null);
  }, []);

  const isCompleted = useMemo(() => {
    return progressEntries?.[0]?.completed ?? false;
  }, [progressEntries]);

  if (lessonLoading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Loading lesson...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!lesson) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Lesson not found</Typography>
        </CardContent>
      </Card>
    );
  }

  const isStudent = user?.role === "STUDENT";
  const isUnlocked =
    !isStudent ||
    (unlockedModules ?? []).some(
      (module) => module.moduleId === lesson.moduleId,
    );

  if (isStudent && accessLoading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Checking access...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (isStudent && !isUnlocked) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Unlock this module to continue</Typography>
            <Typography color="text.secondary">
              Your teacher can provide the access code for{" "}
              {moduleData?.title ?? "this module"}.
            </Typography>
            <Button component={Link} href="/onboarding" variant="contained">
              Unlock modules
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={4} sx={{ maxWidth: 960 }}>
      <Button
        component={Link}
        href={moduleHref}
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to module
      </Button>

      <Stack spacing={2}>
        <Typography variant="h3">{lesson.title}</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {accessibility?.enableNarration && (
            <Button
              variant="outlined"
              onClick={() => {
                if (!lesson.content) return;
                if (typeof window === "undefined" || !window.speechSynthesis)
                  return;
                const utterance = new SpeechSynthesisUtterance(lesson.content);
                utterance.lang = accessibility?.language || "en";
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
              }}
            >
              Listen to lesson
            </Button>
          )}
          {accessibility?.translationEnabled && lesson.content && (
            <Button
              variant="outlined"
              disabled={translating}
              onClick={async () => {
                setTranslating(true);
                try {
                  const response = await apiFetch<{ translatedText: string }>(
                    "/api/translate",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        text: lesson.content,
                        targetLanguage: accessibility?.language || "en",
                      }),
                    },
                  );
                  setTranslatedContent(response.translatedText);
                } finally {
                  setTranslating(false);
                }
              }}
            >
              {translating ? "Translating..." : "Translate lesson"}
            </Button>
          )}
        </Stack>
        {lesson.videoUrl && (
          <Box
            component="iframe"
            src={lesson.videoUrl}
            title={lesson.title}
            sx={{
              width: "100%",
              minHeight: { xs: 220, md: 420 },
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        )}
        {lesson.diagramUrl && (
          <Box
            component="img"
            src={lesson.diagramUrl}
            alt={`${lesson.title} diagram`}
            sx={{
              width: "100%",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        )}
        {lesson.pdfUrl && (
          <Button
            href={lesson.pdfUrl}
            target="_blank"
            rel="noopener"
            variant="outlined"
            sx={{ alignSelf: "flex-start" }}
          >
            Open lesson PDF
          </Button>
        )}
        <Card>
          <CardContent>
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <Typography variant="h4" gutterBottom>
                    {children}
                  </Typography>
                ),
                h2: ({ children }) => (
                  <Typography variant="h5" gutterBottom>
                    {children}
                  </Typography>
                ),
                p: ({ children }) => (
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {children}
                  </Typography>
                ),
                ul: ({ children }) => (
                  <Box
                    component="ul"
                    sx={{
                      pl: 3,
                      mb: 2,
                      color: "text.secondary",
                      listStyleType: "disc",
                    }}
                  >
                    {children}
                  </Box>
                ),
                li: ({ children }) => (
                  <Typography
                    component="li"
                    variant="body1"
                    color="text.secondary"
                  >
                    {children}
                  </Typography>
                ),
              }}
            >
              {translatedContent ?? lesson.content ?? ""}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </Stack>

      <LessonResources lessonId={lesson.id} />
      <LessonNotes lessonId={lesson.id} />

      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<CheckCircleIcon />}
          onClick={async () => {
            try {
              await apiFetch("/api/progress", {
                method: "POST",
                body: JSON.stringify({
                  lessonId: lesson.id,
                  moduleId: lesson.moduleId,
                  completed: true,
                }),
              });
              await refetchProgress();
            } catch {
              // Ignore for now; completion state remains unchanged.
            }
          }}
          disabled={isCompleted}
        >
          {isCompleted ? "Completed" : "Mark as complete"}
        </Button>
      </Box>
    </Stack>
  );
}
