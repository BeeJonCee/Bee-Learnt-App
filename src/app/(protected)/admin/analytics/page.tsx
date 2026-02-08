"use client";

import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useApi } from "@/hooks/useApi";

type PlatformStats = {
  users: {
    byRole: Record<string, number>;
    activeLastWeek: number;
  };
  assessments: {
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
  };
  questions: {
    total: number;
    active: number;
  };
  study: {
    sessionsLast30Days: number;
    minutesLast30Days: number;
  };
};

function StatCard({
  label,
  value,
  color = "primary.main",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Card>
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="h3" color={color}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const { data, loading, error } = useApi<PlatformStats>(
    "/api/analytics/platform",
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">Platform Analytics</Typography>
        <Typography color="text.secondary">
          Overview of platform-wide statistics and engagement.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading || !data ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading analytics...</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* User counts */}
          <Typography variant="h6">Users</Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <StatCard
                label="Students"
                value={data.users.byRole.STUDENT ?? 0}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard label="Tutors" value={data.users.byRole.TUTOR ?? 0} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard label="Parents" value={data.users.byRole.PARENT ?? 0} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                label="Active (last week)"
                value={data.users.activeLastWeek}
                color="secondary.main"
              />
            </Grid>
          </Grid>

          {/* Assessment stats */}
          <Typography variant="h6">Assessments</Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={4}>
              <StatCard
                label="Total Attempts"
                value={data.assessments.totalAttempts}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <StatCard
                label="Completed"
                value={data.assessments.completedAttempts}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                label="Average Score"
                value={`${data.assessments.averageScore}%`}
              />
            </Grid>
          </Grid>

          {/* Question bank */}
          <Typography variant="h6">Question Bank</Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <StatCard label="Total Questions" value={data.questions.total} />
            </Grid>
            <Grid item xs={6}>
              <StatCard
                label="Active Questions"
                value={data.questions.active}
              />
            </Grid>
          </Grid>

          {/* Study activity */}
          <Typography variant="h6">Study Activity (30 days)</Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <StatCard
                label="Study Sessions"
                value={data.study.sessionsLast30Days}
              />
            </Grid>
            <Grid item xs={6}>
              <StatCard
                label="Study Hours"
                value={Math.round(data.study.minutesLast30Days / 60)}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}
