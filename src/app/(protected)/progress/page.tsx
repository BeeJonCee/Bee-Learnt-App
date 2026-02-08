"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useApi } from "@/hooks/useApi";

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

type ProgressSummary = {
  lessonCompletions: number;
  timeSpentMinutes: number;
  averageScore: number;
  moduleProgress: Array<{
    moduleId: number;
    title: string;
    grade: string;
    completion: number;
  }>;
};

function masteryColor(percent: number) {
  if (percent >= 75) return "success";
  if (percent >= 50) return "warning";
  return "error";
}

export default function ProgressPage() {
  const { data: overallData } = useApi<{
    userId: string;
    overallMastery: number;
  }>("/api/progress/mastery/overall");
  const {
    data: masteryData,
    loading: masteryLoading,
    error: masteryError,
  } = useApi<{ userId: string; mastery: MasteryEntry[] }>(
    "/api/progress/mastery",
  );
  const { data: weakData } = useApi<{
    userId: string;
    weakTopics: WeakTopic[];
  }>("/api/progress/mastery/weak?limit=5");
  const { data: strongData } = useApi<{
    userId: string;
    weakTopics: WeakTopic[];
  }>("/api/progress/mastery/strong?limit=5");
  const { data: summary } = useApi<ProgressSummary>("/api/progress/summary");

  const mastery = masteryData?.mastery ?? [];
  const weakTopics = weakData?.weakTopics ?? [];
  const strongTopics = strongData?.weakTopics ?? [];
  const overallMastery = overallData?.overallMastery ?? 0;

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">My Progress</Typography>
        <Typography color="text.secondary">
          Track your mastery across topics and identify areas to improve.
        </Typography>
      </Stack>

      {masteryError && <Alert severity="error">{masteryError}</Alert>}

      {/* Stats row */}
      <Grid container spacing={3}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="primary.main">
                {overallMastery}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Mastery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="primary.main">
                {mastery.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Topics Attempted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="primary.main">
                {summary?.lessonCompletions ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lessons Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" color="primary.main">
                {summary?.timeSpentMinutes
                  ? `${Math.round(summary.timeSpentMinutes / 60)}h`
                  : "0h"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Study Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weak / Strong topics side-by-side */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weakest Topics
              </Typography>
              {weakTopics.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Complete more assessments to see weak topics.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {weakTopics.map((t) => (
                    <Box key={t.topicId}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">{t.topicTitle}</Typography>
                        <Chip
                          size="small"
                          color={masteryColor(t.masteryPercent)}
                          label={`${t.masteryPercent}%`}
                        />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={t.masteryPercent}
                        color={masteryColor(t.masteryPercent)}
                        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {t.correctAnswers}/{t.totalQuestions} correct
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Strongest Topics
              </Typography>
              {strongTopics.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Complete more assessments to see strong topics.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {strongTopics.map((t) => (
                    <Box key={t.topicId}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">{t.topicTitle}</Typography>
                        <Chip
                          size="small"
                          color={masteryColor(t.masteryPercent)}
                          label={`${t.masteryPercent}%`}
                        />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={t.masteryPercent}
                        color={masteryColor(t.masteryPercent)}
                        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {t.correctAnswers}/{t.totalQuestions} correct
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Full mastery grid */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Topic Mastery Breakdown
          </Typography>
          {masteryLoading ? (
            <Typography color="text.secondary">
              Loading mastery data...
            </Typography>
          ) : mastery.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No mastery data yet. Complete some assessments to see your
              progress.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {mastery.map((m) => (
                <Grid item xs={12} sm={6} md={4} key={m.topicId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" noWrap>
                          {m.topicTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.subjectName}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={m.masteryPercent}
                          color={masteryColor(m.masteryPercent)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="caption" color="text.secondary">
                            {m.correctAnswers}/{m.totalQuestions} correct
                          </Typography>
                          <Chip
                            size="small"
                            color={masteryColor(m.masteryPercent)}
                            label={`${m.masteryPercent}%`}
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Module progress */}
      {summary?.moduleProgress && summary.moduleProgress.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Module Progress
            </Typography>
            <Stack spacing={2}>
              {summary.moduleProgress.map((mod) => (
                <Box key={mod.moduleId}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">{mod.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mod.completion}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={mod.completion}
                    sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
