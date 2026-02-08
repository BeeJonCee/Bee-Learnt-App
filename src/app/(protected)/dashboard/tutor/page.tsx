"use client";

import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Avatar from "@mui/material/Avatar";
import alpha from "@mui/material/alpha";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AnnouncementsPanel from "@/components/AnnouncementsPanel";
import { PerformanceMeter, TutoringStatsChart } from "@/components/charts";
import StatCard from "@/components/StatCard";
import TutoringCalendar from "@/components/scheduling/TutoringCalendar";
import DataTable, {
  type ActionItem,
  type Column,
} from "@/components/ui/DataTable";
import { useApi } from "@/hooks/useApi";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";

interface TutorProfile {
  id: number;
  userId: string;
  bio: string | null;
  qualifications: string[];
  specializations: string[];
  hourlyRate: number | null;
  rating: number;
  totalSessions: number;
  isActive: boolean;
  userName: string;
  userEmail: string;
  expertise: {
    id: number;
    subjectId: number;
    subjectName: string;
    gradeMin: number;
    gradeMax: number;
    yearsExperience: number;
  }[];
}

interface TutoringSession {
  id: number;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  studentId: string;
  studentName: string;
  subjectId?: number;
  subjectName?: string;
  moduleId?: number;
  moduleTitle?: string;
  meetingLink?: string;
  location?: string;
}

interface Student {
  id: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  startedAt: string;
}

interface TutorAnalytics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  last30DaysSessions: number;
  last30DaysCompleted: number;
  upcomingSessions: number;
  activeStudents: number;
}

export default function TutorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [_createSessionDate, setCreateSessionDate] = useState<Date | null>(
    null,
  );

  const { data: profile, loading: _profileLoading } =
    useApi<TutorProfile>("/api/tutor/profile");
  const { data: sessions } = useApi<TutoringSession[]>(
    "/api/tutor/sessions?limit=50",
  );
  const { data: students } = useApi<Student[]>("/api/tutor/students");
  const { data: analytics } = useApi<TutorAnalytics>("/api/tutor/analytics");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "TUTOR") {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);

  const upcomingSessions = useMemo(() => {
    if (!sessions) return [];
    const now = new Date();
    return sessions
      .filter(
        (s) => s.status === "scheduled" && new Date(s.scheduledStart) > now,
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledStart).getTime() -
          new Date(b.scheduledStart).getTime(),
      )
      .slice(0, 5);
  }, [sessions]);

  const ratingDisplay = useMemo(() => {
    if (!profile) return 0;
    return (profile.rating / 100).toFixed(1);
  }, [profile]);

  const sessionColumns: Column<TutoringSession>[] = [
    { id: "title", label: "Session" },
    {
      id: "studentName",
      label: "Student",
      render: (_, row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: 12,
              bgcolor: "primary.main",
            }}
          >
            {row.studentName?.charAt(0) ?? "S"}
          </Avatar>
          <Typography variant="body2">{row.studentName}</Typography>
        </Stack>
      ),
    },
    {
      id: "scheduledStart",
      label: "Date & Time",
      render: (value) => {
        const date = new Date(value as string);
        return (
          <Stack spacing={0}>
            <Typography variant="body2">
              {date.toLocaleDateString("en-ZA", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleTimeString("en-ZA", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Stack>
        );
      },
    },
    {
      id: "status",
      label: "Status",
      render: (value) => {
        const colors: Record<string, string> = {
          scheduled: "info",
          in_progress: "warning",
          completed: "success",
          cancelled: "error",
          no_show: "error",
        };
        return (
          <Chip
            size="small"
            label={String(value).replace("_", " ")}
            color={
              colors[value as string] as
                | "info"
                | "warning"
                | "success"
                | "error"
            }
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },
    { id: "subjectName", label: "Subject", hidden: "md" },
  ];

  const sessionActions: ActionItem<TutoringSession>[] = [
    {
      label: "Start Session",
      onClick: (row) => console.log("Start", row),
      show: (row) => row.status === "scheduled",
    },
    {
      label: "View Details",
      onClick: (row) => console.log("View", row),
    },
    {
      label: "Cancel",
      onClick: (row) => console.log("Cancel", row),
      color: "error",
      show: (row) => row.status === "scheduled",
    },
  ];

  if (!user || user.role !== "TUTOR") {
    return null;
  }

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h3">
              Welcome back,{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                {profile?.userName ?? user.name ?? "Tutor"}
              </Box>
            </Typography>
            {profile?.isActive && (
              <Chip
                size="small"
                label="Active"
                color="success"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Rating
              value={Number(ratingDisplay)}
              precision={0.1}
              readOnly
              size="small"
              icon={<StarIcon sx={{ color: "#FFD600" }} fontSize="inherit" />}
              emptyIcon={<StarIcon sx={{ opacity: 0.3 }} fontSize="inherit" />}
            />
            <Typography variant="body2" color="text.secondary">
              {ratingDisplay} rating ({profile?.totalSessions ?? 0} sessions)
            </Typography>
          </Stack>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateSessionDate(new Date())}
          >
            Schedule Session
          </Button>
          <Button
            component={Link}
            href="/tutor/students"
            variant="outlined"
            size="large"
          >
            Manage Students
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active Students"
            value={String(analytics?.activeStudents ?? 0)}
            icon={GroupsIcon}
            accent="#5BC0EB"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Upcoming Sessions"
            value={String(analytics?.upcomingSessions ?? 0)}
            icon={CalendarMonthIcon}
            accent="#FFD600"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Sessions This Month"
            value={String(analytics?.last30DaysSessions ?? 0)}
            icon={SchoolIcon}
            accent="#22C55E"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Completion Rate"
            value={
              analytics?.last30DaysSessions
                ? `${Math.round((analytics.last30DaysCompleted / analytics.last30DaysSessions) * 100)}%`
                : "0%"
            }
            icon={TrendingUpIcon}
            accent="#9333EA"
          />
        </Grid>
      </Grid>

      {/* Calendar */}
      <Stack spacing={2}>
        <Typography variant="h5">Your Schedule</Typography>
        <TutoringCalendar
          sessions={sessions ?? []}
          onSessionClick={(session) => console.log("Session clicked:", session)}
          onCreateSession={(date) => setCreateSessionDate(date)}
          userRole="TUTOR"
        />
      </Stack>

      {/* Upcoming Sessions Table */}
      <Stack spacing={2}>
        <Typography variant="h5">Upcoming Sessions</Typography>
        <DataTable
          columns={sessionColumns}
          data={upcomingSessions}
          actions={sessionActions}
          searchPlaceholder="Search sessions..."
          searchKeys={["title", "studentName", "subjectName"]}
          emptyMessage="No upcoming sessions scheduled"
          pageSize={5}
          onCreate={() => setCreateSessionDate(new Date())}
          createLabel="New Session"
        />
      </Stack>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <TutoringStatsChart title="Your Activity (Last 6 Months)" />
        </Grid>
        <Grid item xs={12} lg={4}>
          <PerformanceMeter
            score={Number(ratingDisplay) * 20}
            maxScore={100}
            title="Your Rating"
            subtitle={`Based on ${profile?.totalSessions ?? 0} sessions`}
            label="%"
          />
        </Grid>
      </Grid>

      {/* Students + Expertise */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">Your Students</Typography>
                  <Button size="small" component={Link} href="/tutor/students">
                    View All
                  </Button>
                </Stack>
                {(students ?? []).length === 0 ? (
                  <Typography color="text.secondary">
                    No students connected yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {(students ?? []).slice(0, 5).map((student) => (
                      <Stack
                        key={student.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha("#fff", 0.03),
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: "primary.main",
                              color: "primary.contrastText",
                            }}
                          >
                            {student.studentName?.charAt(0) ?? "S"}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {student.studentName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {student.studentEmail}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          size="small"
                          label={student.status}
                          color={
                            student.status === "active" ? "success" : "default"
                          }
                        />
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">Your Expertise</Typography>
                  <Button size="small" component={Link} href="/tutor/profile">
                    Edit Profile
                  </Button>
                </Stack>
                {(profile?.expertise ?? []).length === 0 ? (
                  <Typography color="text.secondary">
                    Add your areas of expertise to help students find you.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {(profile?.expertise ?? []).map((exp) => (
                      <Stack
                        key={exp.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha("#fff", 0.03),
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2">
                            {exp.subjectName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Grades {exp.gradeMin} - {exp.gradeMax}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`${exp.yearsExperience}+ years`}
                          sx={{
                            bgcolor: alpha("#FFD600", 0.1),
                            color: "primary.main",
                          }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                )}

                {/* Specializations */}
                {profile?.specializations &&
                  profile.specializations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Specializations
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {profile.specializations.map((spec) => (
                          <Chip
                            key={spec}
                            label={spec}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Announcements */}
      <AnnouncementsPanel />
    </Stack>
  );
}
