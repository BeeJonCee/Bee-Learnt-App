"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MuiLink from "@mui/material/Link";

import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import AssignmentList from "@/components/AssignmentList";
import ModuleChecklist from "@/components/ModuleChecklist";
import { useApi } from "@/hooks/useApi";
import { prefetchModuleForOffline } from "@/lib/offline/prefetch";
import { apiFetch } from "@/lib/utils/api";
import { useAuth } from "@/providers/AuthProvider";

export default function ModulePage() {
  const params = useParams();
  const idParam = params?.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const { data: moduleData, loading: moduleLoading } = useApi<{
    id: number;
    subjectId: number;
    title: string;
    description?: string | null;
    grade: number;
    capsTags?: string[] | null;
  }>(Number.isNaN(id) ? null : `/api/modules/${id}`);
  const { data: userModules, loading: accessLoading } = useApi<
    { moduleId: number }[]
  >(moduleData ? "/api/user-modules" : null);
  const { user } = useAuth();
  const { data: lessons } = useApi<
    {
      id: number;
      moduleId: number;
      title: string;
      type: "text" | "video" | "diagram" | "pdf";
    }[]
  >(Number.isNaN(id) ? null : `/api/lessons?moduleId=${id}`);
  const { data: quizzes, refetch: refetchQuizzes } = useApi<
    {
      id: number;
      moduleId: number;
      title: string;
      description?: string | null;
      difficulty: "easy" | "medium" | "hard" | "adaptive";
      source: string;
    }[]
  >(Number.isNaN(id) ? null : `/api/quizzes?moduleId=${id}`);
  const { data: assignments, setData: setAssignments } = useApi<
    {
      id: number;
      moduleId: number;
      lessonId: number | null;
      title: string;
      description?: string | null;
      dueDate: string;
      priority: "low" | "medium" | "high";
      status: "todo" | "in_progress" | "submitted" | "graded";
      grade: number;
    }[]
  >(Number.isNaN(id) ? null : `/api/assignments?moduleId=${id}`);
  const { data: subject } = useApi<{
    id: number;
    name: string;
  }>(moduleData ? `/api/subjects/${moduleData.subjectId}` : null);
  const subjectHref = subject ? `/subjects/${subject.id}` : "/subjects";
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("AI quiz generated.");
  const [offlineLoading, setOfflineLoading] = useState(false);

  if (moduleLoading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Loading module...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!moduleData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Module not found</Typography>
        </CardContent>
      </Card>
    );
  }

  const isStudent = user?.role === "STUDENT";
  const hasAccess =
    !isStudent ||
    (userModules ?? []).some((module) => module.moduleId === moduleData.id);

  if (isStudent && accessLoading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Checking access...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (isStudent && !hasAccess) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Unlock this module to begin</Typography>
            <Typography color="text.secondary">
              Head to onboarding to enter the access code for {moduleData.title}
              .
            </Typography>
            <Button component={NextLink} href="/onboarding" variant="contained">
              Unlock modules
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={4}>
      <Breadcrumbs sx={{ color: "text.secondary" }}>
        <MuiLink
          component={NextLink}
          href={subjectHref}
          color="inherit"
          underline="hover"
        >
          {subject?.name ?? "Subject"}
        </MuiLink>
        <Typography color="text.primary">{moduleData.title}</Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h3">{moduleData.title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {moduleData.description}
          </Typography>
          {moduleData.capsTags && moduleData.capsTags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
              {moduleData.capsTags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          )}
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={async () => {
              try {
                await apiFetch("/api/quizzes/generate", {
                  method: "POST",
                  body: JSON.stringify({
                    subjectId: moduleData.subjectId,
                    moduleId: moduleData.id,
                    topic: moduleData.title,
                    grade: moduleData.grade,
                    capsTags: moduleData.capsTags ?? [],
                  }),
                });
                await refetchQuizzes();
                setToastMessage("AI quiz generated. Check the quizzes list.");
              } catch (error) {
                setToastMessage(
                  error instanceof Error
                    ? error.message
                    : "Unable to generate quiz.",
                );
              } finally {
                setToastOpen(true);
              }
            }}
          >
            Generate AI quiz
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            disabled={offlineLoading}
            onClick={async () => {
              setOfflineLoading(true);
              try {
                const count = await prefetchModuleForOffline(moduleData.id);
                setToastMessage(
                  count > 0
                    ? `Saved ${count} lessons for offline access.`
                    : "No lessons to cache yet.",
                );
              } catch (error) {
                setToastMessage(
                  error instanceof Error
                    ? error.message
                    : "Offline download failed.",
                );
              } finally {
                setToastOpen(true);
                setOfflineLoading(false);
              }
            }}
          >
            {offlineLoading ? "Saving..." : "Download for offline"}
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Typography variant="h5">Lessons</Typography>
        <Stack spacing={2}>
          {(lessons ?? []).map((lesson) => (
            <Card key={lesson.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PlayCircleOutlineIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {lesson.title}
                      </Typography>
                    </Stack>
                    <Chip
                      label={
                        lesson.type === "video" ? "Video lesson" : "Text lesson"
                      }
                      size="small"
                      sx={{ alignSelf: "flex-start" }}
                    />
                  </Stack>
                  <Button
                    component={NextLink}
                    href={`/lessons/${lesson.id}`}
                    variant="outlined"
                    endIcon={<ChevronRightIcon />}
                  >
                    Start lesson
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Typography variant="h5">Quizzes</Typography>
        <Stack spacing={2}>
          {(quizzes ?? []).map((quiz) => (
            <Card key={quiz.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <QuizIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {quiz.title}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Chip label={quiz.difficulty} size="small" />
                      {quiz.source === "ai" && (
                        <Chip label="AI" size="small" color="secondary" />
                      )}
                    </Stack>
                  </Stack>
                  <Button
                    component={NextLink}
                    href={`/quizzes/${quiz.id}`}
                    variant="outlined"
                  >
                    Start quiz
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Typography variant="h5">Assignments</Typography>
        <AssignmentList
          items={assignments ?? []}
          onToggle={async (assignmentId) => {
            const current = assignments?.find(
              (item) => item.id === assignmentId,
            );
            if (!current) return;
            const isCompleted = ["submitted", "graded"].includes(
              current.status,
            );
            const nextStatus = isCompleted ? "todo" : "submitted";

            setAssignments((prev) =>
              (prev ?? []).map((assignment) =>
                assignment.id === assignmentId
                  ? { ...assignment, status: nextStatus }
                  : assignment,
              ),
            );

            try {
              await apiFetch(`/api/assignments/${assignmentId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: nextStatus }),
              });
            } catch {
              setAssignments((prev) =>
                (prev ?? []).map((assignment) =>
                  assignment.id === assignmentId ? current : assignment,
                ),
              );
            }
          }}
        />
      </Stack>

      <ModuleChecklist moduleId={moduleData.id} />

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toastMessage.startsWith("AI quiz") ? "success" : "error"}
          variant="filled"
          onClose={() => setToastOpen(false)}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
