"use client";

import AssignmentIcon from "@mui/icons-material/Assignment";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type ReportStats = {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  avgEngagementScore: number;
  totalLessonsCompleted: number;
  totalQuizAttempts: number;
  avgQuizScore: number;
  moduleCompletionRate: number;
  topModules: { name: string; completions: number }[];
  userGrowth: { date: string; newUsers: number; cumulativeUsers: number }[];
  engagementByRole: { role: string; activeUsers: number; totalUsers: number }[];
};

const REPORT_TYPES = [
  { value: "user_engagement", label: "User Engagement" },
  { value: "content_performance", label: "Content Performance" },
  { value: "system_health", label: "System Health" },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

export default function AdminReportsPanel() {
  const [selectedReportType, setSelectedReportType] =
    useState<string>("user_engagement");
  const [dateRange, setDateRange] = useState<string>("7d");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const { data: stats, loading: statsLoading } = useApi<ReportStats>(
    `/api/admin/reports/stats?range=${dateRange}`,
  );

  const topModulesData = useMemo(
    () => stats?.topModules.slice(0, 5) ?? [],
    [stats?.topModules],
  );

  const engagementData = useMemo(
    () =>
      stats?.engagementByRole.map((item) => ({
        name: item.role,
        active: item.activeUsers,
        total: item.totalUsers,
      })) ?? [],
    [stats?.engagementByRole],
  );

  const userGrowthData = useMemo(
    () => stats?.userGrowth ?? [],
    [stats?.userGrowth],
  );

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await apiFetch<{ downloadUrl: string }>(
        "/api/admin/reports/generate",
        {
          method: "POST",
          body: JSON.stringify({
            type: selectedReportType,
            dateRange,
            format: "pdf",
          }),
        },
      );

      if (response.downloadUrl) {
        window.open(response.downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsGenerating(false);
      setShowDialog(false);
    }
  };

  if (statsLoading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Loading report data...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {/* Summary Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PeopleIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Total Users
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {stats.totalUsers.toLocaleString()}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={`${stats.activeToday} today`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentIcon color="success" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Lessons Completed
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {stats.totalLessonsCompleted.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This period
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
                  <TrendingUpIcon color="info" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Avg Quiz Score
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {Math.round(stats.avgQuizScore)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.totalQuizAttempts.toLocaleString()} attempts
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
                  <AssignmentIcon color="warning" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Module Completion
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {Math.round(stats.moduleCompletionRate)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Across all grades
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Modules Chart */}
      {topModulesData.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Performance" color="primary" size="small" />
                <Typography variant="body2" color="text.secondary">
                  Top performing modules
                </Typography>
              </Stack>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topModulesData}>
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
                    <Bar
                      dataKey="completions"
                      fill="#8884d8"
                      name="Completions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* User Growth & Engagement */}
      <Grid container spacing={3}>
        {userGrowthData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="Trend" color="primary" size="small" />
                    <Typography variant="body2" color="text.secondary">
                      User growth
                    </Typography>
                  </Stack>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowthData}>
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
                        <Bar
                          dataKey="newUsers"
                          fill="#82ca9d"
                          name="New Users"
                        />
                        <Bar
                          dataKey="cumulativeUsers"
                          fill="#8884d8"
                          name="Total Users"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {engagementData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="Breakdown" color="primary" size="small" />
                    <Typography variant="body2" color="text.secondary">
                      Active users by role
                    </Typography>
                  </Stack>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props: { name: string; active: number }) =>
                            `${props.name}: ${props.active}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="active"
                        >
                          {engagementData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Report Generation */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FileDownloadIcon color="primary" />
              <Typography variant="h6">Generate Report</Typography>
            </Stack>
            <Typography color="text.secondary" variant="body2">
              Create comprehensive reports for administrators, parents, and
              stakeholders.
            </Typography>
          </Stack>
        </CardContent>
        <Stack sx={{ p: 2 }} spacing={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowDialog(true)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Generating...
              </>
            ) : (
              "Create New Report"
            )}
          </Button>
        </Stack>
      </Card>

      {/* Report Generation Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => !isGenerating && setShowDialog(false)}
      >
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent sx={{ minWidth: 400, py: 2 }}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Report Type"
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              disabled={isGenerating}
            >
              {REPORT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              disabled={isGenerating}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="all">All time</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
