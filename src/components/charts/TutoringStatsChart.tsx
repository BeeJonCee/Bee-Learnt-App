"use client";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TutoringStatsChartProps {
  data?: {
    month: string;
    sessionsCompleted: number;
    hoursSpent: number;
    studentsHelped?: number;
  }[];
  title?: string;
}

const defaultData = [
  { month: "Jan", sessionsCompleted: 12, hoursSpent: 24, studentsHelped: 8 },
  { month: "Feb", sessionsCompleted: 15, hoursSpent: 30, studentsHelped: 10 },
  { month: "Mar", sessionsCompleted: 20, hoursSpent: 40, studentsHelped: 14 },
  { month: "Apr", sessionsCompleted: 18, hoursSpent: 36, studentsHelped: 12 },
  { month: "May", sessionsCompleted: 25, hoursSpent: 50, studentsHelped: 18 },
  { month: "Jun", sessionsCompleted: 22, hoursSpent: 44, studentsHelped: 15 },
];

export default function TutoringStatsChart({
  data = defaultData,
  title = "Tutoring Activity",
}: TutoringStatsChartProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <IconButton size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Chart */}
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.06)"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2B2B2B",
                    borderRadius: 12,
                    color: "#E0E0E0",
                  }}
                />
                <Legend
                  align="left"
                  verticalAlign="top"
                  wrapperStyle={{ paddingTop: 8, paddingBottom: 16 }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: "#B0B0B0", fontSize: 12 }}>
                      {value}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="sessionsCompleted"
                  name="Sessions"
                  stroke="#FFD600"
                  strokeWidth={3}
                  dot={{ fill: "#FFD600", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="hoursSpent"
                  name="Hours"
                  stroke="#5BC0EB"
                  strokeWidth={3}
                  dot={{ fill: "#5BC0EB", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="studentsHelped"
                  name="Students"
                  stroke="#9333EA"
                  strokeWidth={3}
                  dot={{ fill: "#9333EA", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
