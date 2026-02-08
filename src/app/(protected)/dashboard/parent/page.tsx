"use client";

import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AnnouncementsPanel from "@/components/AnnouncementsPanel";
import AttendanceSummaryPanel from "@/components/AttendanceSummaryPanel";
import EventsCalendarPanel from "@/components/EventsCalendarPanel";
import ParentProgressPanel from "@/components/ParentProgressPanel";
import WeeklySchedulePanel from "@/components/WeeklySchedulePanel";
import { useApi } from "@/hooks/useApi";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    data: overview,
    loading,
    error,
  } = useApi<
    {
      studentId: string;
      studentName: string;
      completedLessons: number;
      quizAverage: number;
    }[]
  >("/api/parent/overview");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "PARENT") {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);

  if (!user || user.role !== "PARENT") {
    return null;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h3">Parent overview</Typography>
      {loading ? (
        <Typography color="text.secondary">
          Loading learner overview...
        </Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (overview ?? []).length === 0 ? (
        <Typography color="text.secondary">
          No linked learners yet. Ask an admin to connect your parent account.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Grid container spacing={3}>
                {(overview ?? []).map((child) => (
                  <Grid item xs={12} md={6} key={child.studentId}>
                    <Card>
                      <CardContent>
                        <Stack spacing={2.5}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Stack spacing={0.5}>
                              <Typography variant="h6">
                                {child.studentName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Student ID: {child.studentId}
                              </Typography>
                            </Stack>
                            <Chip label="Active" color="primary" size="small" />
                          </Stack>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                              sx={{
                                flex: 1,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: "rgba(255,255,255,0.05)",
                              }}
                            >
                              <SchoolIcon color="primary" />
                              <Stack>
                                <Typography variant="subtitle2">
                                  Lessons completed
                                </Typography>
                                <Typography variant="h6">
                                  {child.completedLessons}
                                </Typography>
                              </Stack>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                              sx={{
                                flex: 1,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: "rgba(255,255,255,0.05)",
                              }}
                            >
                              <TrendingUpIcon
                                sx={{ color: "secondary.main" }}
                              />
                              <Stack>
                                <Typography variant="subtitle2">
                                  Quiz average
                                </Typography>
                                <Typography variant="h6">
                                  {child.quizAverage}%
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Stack spacing={3}>
                <WeeklySchedulePanel />
                <AttendanceSummaryPanel />
                <AnnouncementsPanel />
                <EventsCalendarPanel />
              </Stack>
            </Grid>
          </Grid>

          {/* Parent Progress Analytics */}
          <Stack spacing={3}>
            <Typography variant="h5">Progress Analytics</Typography>
            <ParentProgressPanel />
          </Stack>
        </>
      )}
    </Stack>
  );
}
