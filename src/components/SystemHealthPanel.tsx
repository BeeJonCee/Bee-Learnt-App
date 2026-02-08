"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SpeedIcon from "@mui/icons-material/Speed";
import StorageIcon from "@mui/icons-material/Storage";
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
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "@/hooks/useApi";

type SystemHealth = {
  status: "healthy" | "warning" | "error";
  uptime: number; // percentage
  responseTime: number; // ms
  errorRate: number; // percentage
  dbConnections: number;
  maxConnections: number;
  cacheHitRate: number; // percentage
  diskUsage: number; // percentage
  memoryUsage: number; // percentage
  cpuUsage: number; // percentage
  activeRequests: number;
  requestsPerSecond: number;
  performanceTrend: { time: string; responseTime: number; errorRate: number }[];
  recentIncidents: {
    id: string;
    timestamp: string;
    type: "error" | "warning" | "info";
    message: string;
  }[];
};

const STATUS_COLORS = {
  healthy: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
};

export default function SystemHealthPanel() {
  const {
    data: health,
    loading,
    error,
  } = useApi<SystemHealth>("/api/admin/system-health");

  const healthStatus = useMemo(() => {
    if (!health) return { color: "#9e9e9e", label: "Unknown" };
    if (health.status === "healthy")
      return { color: STATUS_COLORS.healthy, label: "Healthy" };
    if (health.status === "warning")
      return { color: STATUS_COLORS.warning, label: "Warning" };
    return { color: STATUS_COLORS.error, label: "Error" };
  }, [health?.status, health]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Loading system health...
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

  if (!health) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {/* Overall Status */}
      <Card
        sx={{
          background: `linear-gradient(135deg, ${healthStatus.color}20 0%, ${healthStatus.color}10 100%)`,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              {health.status === "healthy" ? (
                <CheckCircleIcon
                  sx={{ color: healthStatus.color, fontSize: 40 }}
                />
              ) : (
                <ErrorIcon sx={{ color: healthStatus.color, fontSize: 40 }} />
              )}
              <Stack spacing={0.5}>
                <Typography variant="h6">System Status</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: healthStatus.color, fontWeight: 600 }}
                >
                  {healthStatus.label}
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Uptime: {health.uptime.toFixed(2)}% | Response time:{" "}
              {health.responseTime}ms | Error rate:{" "}
              {health.errorRate.toFixed(2)}%
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Core Metrics */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SpeedIcon color="primary" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Response Time
                  </Typography>
                </Stack>
                <Typography variant="h5">{health.responseTime}ms</Typography>
                <Chip
                  label={health.responseTime < 200 ? "Good" : "Check"}
                  size="small"
                  color={health.responseTime < 200 ? "success" : "warning"}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SignalCellularAltIcon color="success" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Cache Hit Rate
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {health.cacheHitRate.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={health.cacheHitRate}
                  sx={{ borderRadius: 4 }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StorageIcon color="info" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    DB Connections
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {health.dbConnections}/{health.maxConnections}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(health.dbConnections / health.maxConnections) * 100}
                  sx={{ borderRadius: 4 }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ErrorIcon color="warning" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Error Rate
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {health.errorRate.toFixed(2)}%
                </Typography>
                <Chip
                  label={health.errorRate < 1 ? "Excellent" : "Alert"}
                  size="small"
                  color={health.errorRate < 1 ? "success" : "error"}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resource Usage */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Resource Usage
          </Typography>
          <Stack spacing={2}>
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Disk Usage
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {health.diskUsage.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={health.diskUsage}
                sx={{
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      health.diskUsage > 80
                        ? "#f44336"
                        : health.diskUsage > 60
                          ? "#ff9800"
                          : "#4caf50",
                  },
                }}
              />
            </Stack>

            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Memory Usage
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {health.memoryUsage.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={health.memoryUsage}
                sx={{
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      health.memoryUsage > 80
                        ? "#f44336"
                        : health.memoryUsage > 60
                          ? "#ff9800"
                          : "#4caf50",
                  },
                }}
              />
            </Stack>

            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  CPU Usage
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {health.cpuUsage.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={health.cpuUsage}
                sx={{
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      health.cpuUsage > 80
                        ? "#f44336"
                        : health.cpuUsage > 60
                          ? "#ff9800"
                          : "#4caf50",
                  },
                }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      {health.performanceTrend.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={health.performanceTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#8884d8"
                    dot={false}
                    name="Response Time (ms)"
                  />
                  <Line
                    type="monotone"
                    dataKey="errorRate"
                    stroke="#ff7c7c"
                    dot={false}
                    name="Error Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Incidents */}
      {health.recentIncidents.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Incidents
            </Typography>
            <Stack spacing={1.5}>
              {health.recentIncidents.map((incident) => (
                <Stack
                  key={incident.id}
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderLeft: `3px solid ${
                      incident.type === "error"
                        ? "#f44336"
                        : incident.type === "warning"
                          ? "#ff9800"
                          : "#2196f3"
                    }`,
                  }}
                >
                  <Stack spacing={0.5} flex={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={incident.type.toUpperCase()}
                        size="small"
                        color={
                          incident.type === "error"
                            ? "error"
                            : incident.type === "warning"
                              ? "warning"
                              : "info"
                        }
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(incident.timestamp).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">{incident.message}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Activity Metrics */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Current Activity</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Active Requests
                  </Typography>
                  <Typography variant="h6">{health.activeRequests}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Requests/Second
                  </Typography>
                  <Typography variant="h6">
                    {health.requestsPerSecond.toFixed(2)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
