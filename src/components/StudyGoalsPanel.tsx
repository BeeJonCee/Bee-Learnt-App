"use client";

import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import TimerIcon from "@mui/icons-material/Timer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type StudyGoal = {
  id: string;
  title: string;
  description?: string;
  targetHours: number;
  currentHours: number;
  deadline: string;
  status: "active" | "completed" | "abandoned";
  priority: "low" | "medium" | "high";
  createdAt: string;
};

export default function StudyGoalsPanel() {
  const [showDialog, setShowDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetHours: 10,
    deadline: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const { data: goals, refetch: refetchGoals } =
    useApi<StudyGoal[]>("/api/student/goals");

  const goalStats = useMemo(() => {
    if (!goals) return { total: 0, completed: 0, active: 0, hoursSpent: 0 };

    const completed = goals.filter((g) => g.status === "completed").length;
    const active = goals.filter((g) => g.status === "active").length;
    const hoursSpent = goals.reduce((sum, g) => sum + g.currentHours, 0);

    return { total: goals.length, completed, active, hoursSpent };
  }, [goals]);

  const activeGoals = useMemo(() => {
    return (goals ?? []).filter((g) => g.status === "active");
  }, [goals]);

  const completedGoals = useMemo(() => {
    return (goals ?? []).filter((g) => g.status === "completed");
  }, [goals]);

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.deadline) return;

    try {
      await apiFetch("/api/student/goals", {
        method: "POST",
        body: JSON.stringify(newGoal),
      });

      setNewGoal({
        title: "",
        description: "",
        targetHours: 10,
        deadline: "",
        priority: "medium",
      });

      setShowDialog(false);
      refetchGoals();
    } catch (err) {
      console.error("Failed to create goal:", err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await apiFetch(`/api/student/goals/${goalId}`, { method: "DELETE" });
      refetchGoals();
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await apiFetch(`/api/student/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      refetchGoals();
    } catch (err) {
      console.error("Failed to complete goal:", err);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Summary Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Active Goals
                </Typography>
                <Typography variant="h5">{goalStats.active}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Out of {goalStats.total}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
                </Stack>
                <Typography variant="h5">{goalStats.completed}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TimerIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Hours Logged
                  </Typography>
                </Stack>
                <Typography variant="h5">{goalStats.hoursSpent}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUpIcon color="success" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Completion Rate
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {goalStats.total > 0
                    ? Math.round((goalStats.completed / goalStats.total) * 100)
                    : 0}
                  %
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Goals */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">Active Goals</Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowDialog(true)}
              >
                New Goal
              </Button>
            </Stack>

            {activeGoals.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No active goals. Create one to get started!
              </Typography>
            ) : (
              <Stack spacing={2}>
                {activeGoals.map((goal) => {
                  const daysLeft = Math.ceil(
                    (new Date(goal.deadline).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const progress = (goal.currentHours / goal.targetHours) * 100;

                  return (
                    <Stack
                      key={goal.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(255,255,255,0.05)",
                      }}
                      spacing={1.5}
                    >
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                      >
                        <Stack spacing={0.5} flex={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {goal.title}
                          </Typography>
                          {goal.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {goal.description}
                            </Typography>
                          )}
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={goal.priority.toUpperCase()}
                            size="small"
                            color={
                              goal.priority === "high"
                                ? "error"
                                : goal.priority === "medium"
                                  ? "warning"
                                  : "default"
                            }
                          />
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleCompleteGoal(goal.id)}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Stack>
                      </Stack>

                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {goal.currentHours}/{goal.targetHours} hours
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progress, 100)}
                          sx={{
                            borderRadius: 4,
                            height: 8,
                            backgroundColor: "rgba(255,255,255,0.1)",
                          }}
                        />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(progress)}%
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Completed Goals</Typography>
              <Stack spacing={1}>
                {completedGoals.map((goal) => (
                  <Stack
                    key={goal.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: "rgba(76, 175, 80, 0.1)",
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "success.main" }} />
                    <Stack flex={1}>
                      <Typography variant="subtitle2">{goal.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Completed {goal.currentHours} of {goal.targetHours}{" "}
                        hours
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Create Study Goal</DialogTitle>
        <DialogContent sx={{ minWidth: 400, py: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Goal Title"
              placeholder="e.g., Complete Mathematics Module"
              value={newGoal.title}
              onChange={(e) =>
                setNewGoal({ ...newGoal, title: e.target.value })
              }
              size="small"
            />
            <TextField
              fullWidth
              label="Description"
              placeholder="Add details about your goal"
              value={newGoal.description}
              onChange={(e) =>
                setNewGoal({ ...newGoal, description: e.target.value })
              }
              multiline
              rows={2}
              size="small"
            />
            <TextField
              fullWidth
              type="number"
              label="Target Hours"
              value={newGoal.targetHours}
              onChange={(e) =>
                setNewGoal({ ...newGoal, targetHours: Number(e.target.value) })
              }
              inputProps={{ min: 1, max: 1000 }}
              size="small"
            />
            <TextField
              fullWidth
              type="date"
              label="Deadline"
              value={newGoal.deadline}
              onChange={(e) =>
                setNewGoal({ ...newGoal, deadline: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              select
              fullWidth
              label="Priority"
              value={newGoal.priority}
              onChange={(e) =>
                setNewGoal({
                  ...newGoal,
                  priority: e.target.value as "low" | "medium" | "high",
                })
              }
              size="small"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateGoal}
            variant="contained"
            disabled={!newGoal.title.trim() || !newGoal.deadline}
          >
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
