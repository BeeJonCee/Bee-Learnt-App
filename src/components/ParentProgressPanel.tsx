"use client";

import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "@/hooks/useApi";

type ChildProgress = {
  studentId: string;
  studentName: string;
  completedLessons: number;
  quizAverage: number;
  totalAssignments?: number;
  assignmentsSubmitted?: number;
};

type ParentInsights = {
  children: ChildProgress[];
  averageQuizScore: number;
  totalLessonsCompleted: number;
  totalAssignmentsSubmitted: number;
  learningTrend: {
    date: string;
    averageScore: number;
    lessonsCompleted: number;
  }[];
};

export default function ParentProgressPanel() {
  const {
    data: insights,
    loading,
    error,
  } = useApi<ParentInsights>("/api/parent/insights");

  const chartData = useMemo(() => {
    if (!insights?.children) return [];
    return insights.children.map((child) => ({
      name: child.studentName.split(" ")[0], // First name only for space
      "Quiz Avg": Math.round(child.quizAverage),
      Lessons: child.completedLessons,
    }));
  }, [insights?.children]);

  const trendData = useMemo(() => {
    if (!insights?.learningTrend) return [];
    return insights.learningTrend;
  }, [insights?.learningTrend]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Loading progress data...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {/* Summary Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SchoolIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Total Lessons
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {insights.totalLessonsCompleted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Across all children
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUpIcon color="success" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Average Score
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {Math.round(insights.averageQuizScore)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quiz performance
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentIcon color="info" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Assignments
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {insights.totalAssignmentsSubmitted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Submitted
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Children
                </Typography>
                <Typography variant="h5">{insights.children.length}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Being monitored
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Comparison Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Performance" color="primary" size="small" />
                <Typography variant="body2" color="text.secondary">
                  Children comparison
                </Typography>
              </Stack>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="Quiz Avg"
                      fill="#8884d8"
                      name="Quiz Average (%)"
                    />
                    <Bar
                      dataKey="Lessons"
                      fill="#82ca9d"
                      name="Lessons Completed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="7-day" color="primary" size="small" />
                <Typography variant="body2" color="text.secondary">
                  Learning trend
                </Typography>
              </Stack>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="averageScore"
                      stroke="#8884d8"
                      dot={false}
                      name="Avg Quiz Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="lessonsCompleted"
                      stroke="#82ca9d"
                      dot={false}
                      name="Lessons"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Individual Child Progress */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Individual Progress
          </Typography>
          <Stack spacing={2}>
            {insights.children.map((child) => (
              <Stack key={child.studentId} spacing={1}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="subtitle2">
                    {child.studentName}
                  </Typography>
                  <Chip
                    label={`${Math.round(child.quizAverage)}%`}
                    size="small"
                    color={
                      child.quizAverage >= 80
                        ? "success"
                        : child.quizAverage >= 60
                          ? "warning"
                          : "error"
                    }
                  />
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={child.quizAverage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                />
                <Stack direction="row" spacing={2}>
                  <Typography variant="caption" color="text.secondary">
                    {child.completedLessons} lessons completed
                  </Typography>
                  {child.assignmentsSubmitted !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      {child.assignmentsSubmitted} assignments
                    </Typography>
                  )}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
