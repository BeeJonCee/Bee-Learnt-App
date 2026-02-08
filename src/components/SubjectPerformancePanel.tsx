"use client";

import AssignmentIcon from "@mui/icons-material/Assignment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolIcon from "@mui/icons-material/School";
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
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "@/hooks/useApi";

type SubjectMetrics = {
  subjectId: number;
  subjectName: string;
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  quizAttempts: number;
  strength: number; // 0-100
  engagement: number; // 0-100
  timeSpent: number; // minutes
  topicPerformance: {
    topic: string;
    score: number;
  }[];
};

type StudentPerformance = {
  subjects: SubjectMetrics[];
  overallAverage: number;
  bestSubject: string;
  improvementAreas: string[];
  consistencyScore: number; // 0-100
};

export default function SubjectPerformancePanel() {
  const {
    data: performance,
    loading,
    error,
  } = useApi<StudentPerformance>("/api/student/performance");

  const chartData = useMemo(() => {
    if (!performance?.subjects) return [];
    return performance.subjects.map((subject) => ({
      name: subject.subjectName,
      "Avg Score": Math.round(subject.averageScore),
      Engagement: subject.engagement,
      Strength: subject.strength,
    }));
  }, [performance?.subjects]);

  const radarData = useMemo(() => {
    if (!performance?.subjects) return [];
    return performance.subjects.map((subject) => ({
      subject: subject.subjectName.slice(0, 10),
      score: Math.round(subject.averageScore),
      fullName: subject.subjectName,
    }));
  }, [performance?.subjects]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Loading performance metrics...
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

  if (!performance) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {/* Overall Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Overall Average
                </Typography>
                <Typography variant="h5">
                  {Math.round(performance.overallAverage)}%
                </Typography>
                <Chip
                  label={
                    performance.overallAverage >= 80
                      ? "Excellent"
                      : performance.overallAverage >= 60
                        ? "Good"
                        : "Needs Work"
                  }
                  size="small"
                  color={
                    performance.overallAverage >= 80
                      ? "success"
                      : performance.overallAverage >= 60
                        ? "warning"
                        : "error"
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmojiEventsIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Best Subject
                  </Typography>
                </Stack>
                <Typography variant="h6">{performance.bestSubject}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Consistency
                </Typography>
                <Typography variant="h5">
                  {Math.round(performance.consistencyScore)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={performance.consistencyScore}
                  sx={{ borderRadius: 4 }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Subjects
                </Typography>
                <Typography variant="h5">
                  {performance.subjects.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Being tracked
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Subject Comparison Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Metrics" color="primary" size="small" />
                <Typography variant="body2" color="text.secondary">
                  Subject performance comparison
                </Typography>
              </Stack>
              <Box sx={{ height: 350 }}>
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
                      dataKey="Avg Score"
                      fill="#8884d8"
                      name="Average Score (%)"
                    />
                    <Bar
                      dataKey="Engagement"
                      fill="#82ca9d"
                      name="Engagement (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Overview" color="primary" size="small" />
                <Typography variant="body2" color="text.secondary">
                  Performance radar
                </Typography>
              </Stack>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fontSize: 12 }}
                    />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.5)" />
                    <Radar
                      name="Average Score"
                      dataKey="score"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Individual Subject Cards */}
      <Stack spacing={2}>
        <Typography variant="h6">Subject Breakdown</Typography>
        <Grid container spacing={2}>
          {performance.subjects.map((subject) => (
            <Grid item xs={12} md={6} key={subject.subjectId}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        {subject.subjectName}
                      </Typography>
                      <Chip
                        label={`${Math.round(subject.averageScore)}%`}
                        size="small"
                      />
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Stack spacing={0.5}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <SchoolIcon fontSize="small" color="primary" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Lessons
                            </Typography>
                          </Stack>
                          <Typography variant="subtitle2">
                            {subject.lessonsCompleted}/{subject.totalLessons}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={0.5}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <AssignmentIcon fontSize="small" color="success" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Quizzes
                            </Typography>
                          </Stack>
                          <Typography variant="subtitle2">
                            {subject.quizAttempts}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Strength
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {Math.round(subject.strength)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={subject.strength}
                        sx={{
                          borderRadius: 4,
                          backgroundColor: "rgba(255,255,255,0.1)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              subject.strength >= 70 ? "#4caf50" : "#ff9800",
                          },
                        }}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Engagement
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {Math.round(subject.engagement)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={subject.engagement}
                        sx={{
                          borderRadius: 4,
                          backgroundColor: "rgba(255,255,255,0.1)",
                        }}
                      />
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {(subject.timeSpent / 60).toFixed(1)} hours logged
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {/* Improvement Areas */}
      {performance.improvementAreas.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Areas for Improvement</Typography>
              <Stack spacing={1}>
                {performance.improvementAreas.map((area) => (
                  <Stack
                    key={area}
                    direction="row"
                    spacing={2}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: "rgba(255, 152, 0, 0.1)",
                      borderLeft: "3px solid #ff9800",
                    }}
                  >
                    <Typography variant="body2">{area}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
