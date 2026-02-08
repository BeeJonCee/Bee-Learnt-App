"use client";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventIcon from "@mui/icons-material/Event";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import AssignmentList from "@/components/AssignmentList";
import StatCard from "@/components/StatCard";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
] as const;

type StatusFilter = (typeof statusOptions)[number]["value"];

type GradeFilter = "all" | "10" | "11" | "12";

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

type Module = {
  id: number;
  title: string;
};

export default function AssignmentsPage() {
  const { data: assignments, setData } =
    useApi<Assignment[]>("/api/assignments");
  const { data: modules } = useApi<Module[]>("/api/modules");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [grade, setGrade] = useState<GradeFilter>("all");

  const moduleById = useMemo(() => {
    const map = new Map<number, string>();
    for (const module of modules ?? []) {
      map.set(module.id, module.title);
    }
    return map;
  }, [modules]);

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

  const items = useMemo(() => {
    const withModules = (assignments ?? []).map((assignment) => ({
      ...assignment,
      moduleTitle: moduleById.get(assignment.moduleId) ?? "Module",
    }));

    return withModules
      .filter((assignment) => {
        const isCompleted = ["submitted", "graded"].includes(assignment.status);
        if (status === "pending" && isCompleted) return false;
        if (status === "completed" && !isCompleted) return false;
        if (grade !== "all" && assignment.grade !== Number(grade)) return false;
        return true;
      })
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
  }, [assignments, grade, moduleById, status]);

  const handleToggle = async (assignmentId: number) => {
    const current = assignments?.find(
      (assignment) => assignment.id === assignmentId,
    );
    if (!current) return;
    const isCompleted = ["submitted", "graded"].includes(current.status);
    const nextStatus = isCompleted ? "todo" : "submitted";

    setData((prev) =>
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
      setData((prev) =>
        (prev ?? []).map((assignment) =>
          assignment.id === assignmentId ? current : assignment,
        ),
      );
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h3">Assignments</Typography>
        <Typography color="text.secondary">
          Track IT projects, practical tasks, and research work by due date.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Total assignments"
            value={`${summary.total}`}
            icon={AssignmentTurnedInIcon}
            accent="#f6c945"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Completed"
            value={`${summary.completed}`}
            icon={TaskAltIcon}
            accent="#5bc0eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Due soon"
            value={`${summary.dueSoon}`}
            icon={EventIcon}
            accent="#f97316"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Overdue"
            value={`${summary.overdue}`}
            icon={WarningAmberIcon}
            accent="#ef5350"
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        <Tabs
          value={status}
          onChange={(_, value) => setStatus(value)}
          textColor="primary"
          indicatorColor="primary"
        >
          {statusOptions.map((option) => (
            <Tab key={option.value} value={option.value} label={option.label} />
          ))}
        </Tabs>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="grade-filter-label">Grade</InputLabel>
          <Select
            labelId="grade-filter-label"
            label="Grade"
            value={grade}
            onChange={(event) => setGrade(event.target.value as GradeFilter)}
          >
            <MenuItem value="all">All grades</MenuItem>
            <MenuItem value="10">Grade 10</MenuItem>
            <MenuItem value="11">Grade 11</MenuItem>
            <MenuItem value="12">Grade 12</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <AssignmentList items={items} onToggle={handleToggle} showModule />
    </Stack>
  );
}
