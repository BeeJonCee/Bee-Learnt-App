"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EventIcon from "@mui/icons-material/Event";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SchoolIcon from "@mui/icons-material/School";
import TimerIcon from "@mui/icons-material/Timer";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AiTutorWidget from "@/components/AiTutorWidget";
import AnnouncementsPanel from "@/components/AnnouncementsPanel";
import AttendanceSummaryPanel from "@/components/AttendanceSummaryPanel";
import BadgeShelf from "@/components/BadgeShelf";
import EventsCalendarPanel from "@/components/EventsCalendarPanel";
import LearningPathPanel from "@/components/LearningPathPanel";
import PerformanceGauge from "@/components/PerformanceGauge";
import RecommendedResourcesPanel from "@/components/RecommendedResourcesPanel";
import StatCard from "@/components/StatCard";
import StudyGoalsPanel from "@/components/StudyGoalsPanel";
import StudyTimerCard from "@/components/StudyTimerCard";
import SubjectPerformancePanel from "@/components/SubjectPerformancePanel";
import WeeklySchedulePanel from "@/components/WeeklySchedulePanel";
import { useApi } from "@/hooks/useApi";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";

const chartData = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 70 },
  { day: "Wed", score: 78 },
  { day: "Thu", score: 84 },
  { day: "Fri", score: 92 },
];

type ModuleProgress = {
  moduleId: number;
  title: string;
  grade: number;
  completion: number;
};

type ProgressSummary = {
  lessonCompletions: number;
  timeSpentMinutes: number;
  averageScore: number;
  moduleProgress: ModuleProgress[];
};

type Assignment = {
  id: number;
  moduleId: number;
  lessonId: number | null;
  title: string;
  description?: string | null;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "submitted" | "graded";
  grade: number;
};

type UserModule = {
  moduleId: number;
  title: string;
  grade: number;
  subjectName: string;
};

type LearningPathItem = {
  id: number;
  title: string;
  reason: string | null;
  moduleId: number | null;
  lessonId: number | null;
};

type LeaderboardEntry = {
  userId: string;
  name: string;
  score: number;
  averageScore: number;
  minutes: number;
};

type FeedResponse = {
  items: { title: string; source: string; url: string; publishedAt: string }[];
  source: string;
};

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: progressSummary } = useApi<ProgressSummary>(
    "/api/progress/summary",
  );
  const { data: assignments } = useApi<Assignment[]>("/api/assignments");
  const { data: userModules, loading: userModulesLoading } =
    useApi<UserModule[]>("/api/user-modules");
  const { data: learningPath, loading: learningPathLoading } =
    useApi<LearningPathItem[]>("/api/learning-path");
  const { data: leaderboard } = useApi<LeaderboardEntry[]>("/api/leaderboard");
  const { data: _feed } = useApi<FeedResponse>("/api/external/education-feed");
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "STUDENT") {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);

  const summary = useMemo(() => {
    const list = assignments ?? [];
    const completed = list.filter((assignment) =>
      ["submitted", "graded"].includes(assignment.status),
    );
    const now = new Date();
    const dueSoon = list.filter((assignment) => {
      const due = new Date(assignment.dueDate);
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      return diffDays >= 0 && diffDays <= 7 && !completed.includes(assignment);
    });
    const overdue = list.filter((assignment) => {
      const due = new Date(assignment.dueDate);
      return due < now && !completed.includes(assignment);
    });

    return {
      total: list.length,
      completed: completed.length,
      dueSoon: dueSoon.length,
      overdue: overdue.length,
    };
  }, [assignments]);

  const hoursLearned = useMemo(() => {
    const minutes = progressSummary?.timeSpentMinutes ?? 0;
    return (minutes / 60).toFixed(1);
  }, [progressSummary?.timeSpentMinutes]);

  const moduleProgress = progressSummary?.moduleProgress ?? [];
  const selectedModuleIds = useMemo(
    () => new Set((userModules ?? []).map((module) => module.moduleId)),
    [userModules],
  );
  const filteredProgress = useMemo(() => {
    if (!userModules) return moduleProgress;
    if (userModules.length === 0) return [];
    return moduleProgress.filter((module) =>
      selectedModuleIds.has(module.moduleId),
    );
  }, [moduleProgress, selectedModuleIds, userModules]);
  const _topModules = filteredProgress.slice(0, 3);

  if (!user || user.role !== "STUDENT") {
    return null;
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1600px",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Stack spacing={3}>
        {/* Header Section */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ py: 2 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Hello,{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                {user?.name ?? "Learner"}
              </Box>
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Ready to continue learning?
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              component={Link}
              href="/subjects"
              variant="contained"
              size="medium"
              endIcon={<ArrowForwardIcon />}
            >
              Explore subjects
            </Button>
            <Button
              component={Link}
              href="/assignments"
              variant="outlined"
              size="medium"
            >
              View assignments
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={async () => {
                const message = `I just studied with BeeLearnt and completed ${progressSummary?.lessonCompletions ?? 0} lessons!`;
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: "BeeLearnt progress",
                      text: message,
                      url: window.location.origin,
                    });
                  } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(message);
                    setShareMessage("Share message copied to clipboard.");
                  } else {
                    setShareMessage("Sharing not supported in this browser.");
                  }
                } catch {
                  setShareMessage("Unable to share right now.");
                }
              }}
            >
              Share progress
            </Button>
          </Stack>
        </Stack>

        {shareMessage && (
          <Alert severity="info" onClose={() => setShareMessage(null)}>
            {shareMessage}
          </Alert>
        )}

        {/* Quick Stats Section */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              label="Lessons completed"
              value={`${progressSummary?.lessonCompletions ?? 0}`}
              icon={SchoolIcon}
              accent="#f6c945"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              label="Quiz average"
              value={`${progressSummary?.averageScore ?? 0}%`}
              icon={QueryStatsIcon}
              accent="#5bc0eb"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              label="Hours learned"
              value={`${hoursLearned}`}
              icon={TimerIcon}
              accent="#f97316"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              label="Assignments due soon"
              value={`${summary.dueSoon}`}
              icon={EventIcon}
              accent="#ef5350"
            />
          </Grid>
        </Grid>

        {/* Your Modules Section */}
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h5" fontWeight={600}>
              Your modules
            </Typography>
            <Button
              component={Link}
              href="/onboarding"
              variant="outlined"
              size="small"
            >
              Manage modules
            </Button>
          </Stack>
          {userModulesLoading ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Loading modules...
                </Typography>
              </CardContent>
            </Card>
          ) : (userModules ?? []).length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Select modules in onboarding to personalize your dashboard.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ gap: 1 }}
                >
                  {(userModules ?? []).map((module) => (
                    <Chip
                      key={module.moduleId}
                      label={`${module.title} - Grade ${module.grade}`}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Main Content Grid - Learning & Engagement */}
        <Grid container spacing={2.5}>
          {/* Left Column - Learning Path & Goals */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={2.5}>
              {/* Personalized Learning Path */}
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
                  Personalized learning path
                </Typography>
                {learningPathLoading ? (
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary">
                        Building your path...
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (learningPath ?? []).length === 0 ? (
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary">
                        Your learning path will appear after you start a few
                        lessons.
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Stack spacing={1.5}>
                    {(learningPath ?? []).map((item) => (
                      <Card key={item.id}>
                        <CardContent>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            justifyContent="space-between"
                          >
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {item.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {item.reason ??
                                  "Focus here next to strengthen your skills."}
                              </Typography>
                            </Stack>
                            {item.moduleId && (
                              <Button
                                component={Link}
                                href={`/modules/${item.moduleId}`}
                                variant="outlined"
                                size="small"
                                sx={{ flexShrink: 0 }}
                              >
                                Open module
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Study Goals */}
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
                  Study Goals
                </Typography>
                <StudyGoalsPanel />
              </Box>
            </Stack>
          </Grid>

          {/* Right Column - Leaderboard & Performance */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={2.5}>
              {/* Leaderboard */}
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
                  Leaderboard
                </Typography>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      {(leaderboard ?? []).length === 0 ? (
                        <Typography color="text.secondary">
                          Leaderboard updates after quiz attempts.
                        </Typography>
                      ) : (
                        (leaderboard ?? []).slice(0, 5).map((entry, index) => (
                          <Stack
                            key={entry.userId}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography variant="subtitle2">
                              {index + 1}. {entry.name}
                            </Typography>
                            <Chip
                              label={`${entry.score} pts`}
                              size="small"
                              color="primary"
                            />
                          </Stack>
                        ))
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              {/* Performance Gauge */}
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
                  Performance
                </Typography>
                <PerformanceGauge
                  score={progressSummary?.averageScore ?? 0}
                  maxScore={100}
                  label="Average quiz score"
                />
              </Box>

              {/* Weekly Trend Chart */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label="This week" color="primary" size="small" />
                      <Typography variant="body2" color="text.secondary">
                        Average score trend
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 1.5,
                        height: 180,
                      }}
                    >
                      {chartData.map((item) => (
                        <Stack
                          key={item.day}
                          alignItems="center"
                          spacing={1}
                          flex={1}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              borderRadius: 2,
                              backgroundColor:
                                item.score > 85
                                  ? "primary.main"
                                  : "rgba(255,255,255,0.12)",
                              height: `${item.score * 1.6}px`,
                              transition: "height 0.4s ease",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {item.day}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Schedule & Attendance Section */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <WeeklySchedulePanel />
          </Grid>
          <Grid item xs={12} md={6}>
            <AttendanceSummaryPanel />
          </Grid>
          <Grid item xs={12} md={6}>
            <AnnouncementsPanel />
          </Grid>
          <Grid item xs={12} md={6}>
            <EventsCalendarPanel />
          </Grid>
        </Grid>

        {/* Subject Performance Analytics */}
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
            📊 Subject Performance Analytics
          </Typography>
          <SubjectPerformancePanel />
        </Box>

        {/* Learning Paths */}
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
            📚 Learning Paths
          </Typography>
          <LearningPathPanel />
        </Box>

        {/* Recommended Resources */}
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
            🎯 Recommended Resources
          </Typography>
          <RecommendedResourcesPanel />
        </Box>

        {/* Study Tools Section */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <StudyTimerCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <BadgeShelf />
          </Grid>
        </Grid>

        {/* AI Tutor Widget */}
        <Box sx={{ pb: 2 }}>
          <AiTutorWidget />
        </Box>
      </Stack>
    </Box>
  );
}
