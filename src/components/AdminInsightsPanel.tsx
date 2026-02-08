"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

type AdminInsights = {
  roles: {
    student: number;
    parent: number;
    admin: number;
    total: number;
  };
  activity: { day: string; quizAttempts: number; assignments: number }[];
  attendance: {
    day: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }[];
};

const formatDay = (value: string | number | Date) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function AdminInsightsPanel() {
  const { data, loading, error } = useApi<AdminInsights>("/api/admin/insights");

  if (loading) {
    return (
      <Typography color="text.secondary">Loading admin insights...</Typography>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!data) {
    return (
      <Typography color="text.secondary">No insights available.</Typography>
    );
  }

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {[
          { label: "Students", value: data.roles.student },
          { label: "Parents", value: data.roles.parent },
          { label: "Admins", value: data.roles.admin },
          { label: "Total users", value: data.roles.total },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Learning activity</Typography>
                <Typography variant="body2" color="text.secondary">
                  Quiz attempts vs assignments created over the last 7 days.
                </Typography>
                <Divider />
                <Box sx={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.activity}
                      margin={{ left: 8, right: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tickFormatter={formatDay} />
                      <YAxis allowDecimals={false} />
                      <Tooltip labelFormatter={formatDay} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="quizAttempts"
                        stroke="#5bc0eb"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="assignments"
                        stroke="#f6c945"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Attendance trend</Typography>
                <Typography variant="body2" color="text.secondary">
                  Attendance status totals by day.
                </Typography>
                <Divider />
                <Box sx={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.attendance}
                      margin={{ left: 8, right: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tickFormatter={formatDay} />
                      <YAxis allowDecimals={false} />
                      <Tooltip labelFormatter={formatDay} />
                      <Legend />
                      <Bar dataKey="present" stackId="a" fill="#5bc0eb" />
                      <Bar dataKey="absent" stackId="a" fill="#ef5350" />
                      <Bar dataKey="late" stackId="a" fill="#f6c945" />
                      <Bar dataKey="excused" stackId="a" fill="#8bc34a" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
