"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FlagIcon from "@mui/icons-material/Flag";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type PathMilestone = {
  id: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  modules: number;
  lessons: number;
};

type LearningPath = {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  totalHours: number;
  completedHours: number;
  progress: number;
  milestones: PathMilestone[];
  progressHistory: { week: number; hours: number; completed: number }[];
  estimatedCompletion: string;
  skillsGained: string[];
  certificateAvailable: boolean;
  enrolledDate: string;
};

type LearningPaths = {
  active: LearningPath[];
  completed: LearningPath[];
  recommended: LearningPath[];
  progressOverTime: {
    date: string;
    hoursCompleted: number;
    pathsActive: number;
  }[];
};

export default function LearningPathPanel() {
  const {
    data: paths,
    loading,
    error,
    refetch,
  } = useApi<LearningPaths>("/api/student/learning-paths");

  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const progressData = useMemo(
    () => paths?.progressOverTime ?? [],
    [paths?.progressOverTime],
  );

  const activePath = paths?.active[0];
  const completedCount = paths?.completed.length ?? 0;
  const recommendedCount = paths?.recommended.length ?? 0;

  const handleEnrollPath = async (pathId: string) => {
    try {
      await apiFetch(`/api/student/learning-paths/${pathId}/enroll`, {
        method: "POST",
      });
      refetch();
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to enroll in path:", err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Loading learning paths...
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

  if (!paths) {
    return null;
  }

  const PathHeader = ({ path }: { path: LearningPath }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(76,175,80,0.1) 100%)`,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SchoolIcon color="primary" />
                <Typography variant="h5" fontWeight={600}>
                  {path.name}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {path.subject} • {path.grade}
              </Typography>
            </Stack>
            <Stack spacing={0.5} alignItems="flex-end">
              <Chip
                label={`${path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}`}
                color={
                  path.difficulty === "beginner"
                    ? "success"
                    : path.difficulty === "intermediate"
                      ? "warning"
                      : "error"
                }
                size="small"
              />
              {path.certificateAvailable && (
                <Chip
                  icon={<EmojiEventsIcon />}
                  label="Certificate"
                  color="primary"
                  size="small"
                />
              )}
            </Stack>
          </Stack>

          <Typography variant="body2">{path.description}</Typography>

          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2">Progress</Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {path.progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={path.progress}
              sx={{ height: 8 }}
            />
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon fontSize="small" color="inherit" />
                <Typography variant="caption" color="text.secondary">
                  {path.completedHours}/{path.totalHours} hours
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <FlagIcon fontSize="small" color="inherit" />
                <Typography variant="caption" color="text.secondary">
                  Due: {new Date(path.estimatedCompletion).toLocaleDateString()}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <MenuBookIcon fontSize="small" color="inherit" />
                <Typography variant="caption" color="text.secondary">
                  {path.milestones.length} milestones
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const MilestoneItem = ({ milestone }: { milestone: PathMilestone }) => (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Stack spacing={0.5} flex={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                {milestone.status === "completed" ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : milestone.status === "in_progress" ? (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      color: "white",
                    }}
                  >
                    ◉
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid #999",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                )}
                <Typography variant="subtitle2" fontWeight={600}>
                  {milestone.title}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {milestone.description}
              </Typography>
            </Stack>
            <Chip
              label={milestone.status.replace(/_/g, " ").toUpperCase()}
              size="small"
              color={
                milestone.status === "completed"
                  ? "success"
                  : milestone.status === "in_progress"
                    ? "warning"
                    : "default"
              }
            />
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Hours
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {milestone.actualHours}/{milestone.estimatedHours}h
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Modules
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {milestone.modules}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Lessons
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {milestone.lessons}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Efficiency
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {milestone.estimatedHours > 0
                    ? (
                        (milestone.actualHours / milestone.estimatedHours) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {milestone.status === "completed" && milestone.completedDate && (
            <Typography variant="caption" color="success.main">
              ✓ Completed on{" "}
              {new Date(milestone.completedDate).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Stack spacing={3}>
      {/* Summary Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  fontWeight={600}
                >
                  ACTIVE PATHS
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {paths.active.length}
                </Typography>
                {activePath && (
                  <Typography variant="caption" color="text.secondary">
                    {activePath.progress}% progress
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  fontWeight={600}
                >
                  COMPLETED
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {completedCount}
                </Typography>
                {completedCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Paths completed
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  fontWeight={600}
                >
                  HOURS LOGGED
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {paths.active.reduce((sum, p) => sum + p.completedHours, 0)}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This month
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  fontWeight={600}
                >
                  RECOMMENDED
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {recommendedCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  For you
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Over Time Chart */}
      {progressData.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpIcon color="primary" />
                <Typography variant="h6">Progress Over Time</Typography>
              </Stack>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="hoursCompleted"
                      stroke="#8884d8"
                      fill="rgba(136,132,216,0.1)"
                      name="Hours Completed"
                    />
                    <Area
                      type="monotone"
                      dataKey="pathsActive"
                      stroke="#82ca9d"
                      fill="rgba(130,202,157,0.1)"
                      name="Paths Active"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Active Paths */}
      {paths.active.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">📚 Your Learning Paths</Typography>
          {paths.active.map((path) => (
            <Stack key={path.id} spacing={2}>
              <PathHeader path={path} />

              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Milestones
                </Typography>
                <Stack spacing={1.5}>
                  {path.milestones.map((milestone) => (
                    <MilestoneItem key={milestone.id} milestone={milestone} />
                  ))}
                </Stack>
              </Stack>

              {path.skillsGained.length > 0 && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Skills You'll Gain
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {path.skillsGained.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Stack>
                </Stack>
              )}

              <Button variant="contained" fullWidth>
                Continue Learning
              </Button>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Recommended Paths */}
      {paths.recommended.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">⭐ Recommended for You</Typography>
          <Grid container spacing={2}>
            {paths.recommended.slice(0, 3).map((path) => (
              <Grid item xs={12} md={6} lg={4} key={path.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight={600}>
                          {path.name}
                        </Typography>
                        <Chip
                          label={path.difficulty}
                          size="small"
                          color={
                            path.difficulty === "beginner"
                              ? "success"
                              : path.difficulty === "intermediate"
                                ? "warning"
                                : "error"
                          }
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {path.subject}
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                        {path.description}
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="caption">
                            {path.totalHours}h
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <MenuBookIcon fontSize="small" />
                          <Typography variant="caption">
                            {path.milestones.length} milestones
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardContent>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setSelectedPath(path);
                        setDialogOpen(true);
                      }}
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* Completed Paths */}
      {paths.completed.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">✅ Paths Completed</Typography>
          <Grid container spacing={2}>
            {paths.completed.map((path) => (
              <Grid item xs={12} md={6} lg={4} key={path.id}>
                <Card
                  sx={{
                    position: "relative",
                    opacity: 0.8,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 40,
                      height: 40,
                      background:
                        "radial-gradient(circle, #4caf50 0%, rgba(76,175,80,0.1) 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {path.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {path.subject}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="caption" color="success.main">
                          Completed
                        </Typography>
                      </Stack>
                      {path.certificateAvailable && (
                        <Button size="small" startIcon={<EmojiEventsIcon />}>
                          Download Certificate
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* Enroll Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enroll in Learning Path</DialogTitle>
        <DialogContent>
          {selectedPath && (
            <Stack spacing={2} sx={{ pt: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {selectedPath.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPath.description}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Stack flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedPath.totalHours} hours
                  </Typography>
                </Stack>
                <Stack flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Difficulty
                  </Typography>
                  <Chip
                    label={selectedPath.difficulty}
                    size="small"
                    color={
                      selectedPath.difficulty === "beginner"
                        ? "success"
                        : selectedPath.difficulty === "intermediate"
                          ? "warning"
                          : "error"
                    }
                    sx={{ width: "fit-content" }}
                  />
                </Stack>
              </Stack>
              <Typography variant="body2">
                This learning path contains {selectedPath.milestones.length}{" "}
                milestones and will help you develop key skills in{" "}
                {selectedPath.subject}.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedPath) {
                handleEnrollPath(selectedPath.id);
              }
            }}
            variant="contained"
          >
            Enroll Now
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
