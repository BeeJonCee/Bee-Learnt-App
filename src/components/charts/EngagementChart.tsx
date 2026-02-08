"use client";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EngagementChartProps {
  data?: {
    day: string;
    lessonsCompleted: number;
    quizzesAttempted: number;
    minutesStudied?: number;
  }[];
  title?: string;
  showMinutes?: boolean;
}

const defaultData = [
  { day: "Mon", lessonsCompleted: 12, quizzesAttempted: 8, minutesStudied: 45 },
  {
    day: "Tue",
    lessonsCompleted: 15,
    quizzesAttempted: 10,
    minutesStudied: 60,
  },
  {
    day: "Wed",
    lessonsCompleted: 18,
    quizzesAttempted: 12,
    minutesStudied: 75,
  },
  { day: "Thu", lessonsCompleted: 14, quizzesAttempted: 9, minutesStudied: 55 },
  {
    day: "Fri",
    lessonsCompleted: 20,
    quizzesAttempted: 15,
    minutesStudied: 90,
  },
  { day: "Sat", lessonsCompleted: 8, quizzesAttempted: 5, minutesStudied: 30 },
  { day: "Sun", lessonsCompleted: 6, quizzesAttempted: 4, minutesStudied: 25 },
];

export default function EngagementChart({
  data = defaultData,
  title = "Weekly Engagement",
  showMinutes = false,
}: EngagementChartProps) {
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
              <BarChart data={data} barSize={showMinutes ? 12 : 16}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.06)"
                />
                <XAxis
                  dataKey="day"
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
                  cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
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
                <Bar
                  dataKey="lessonsCompleted"
                  name="Lessons Completed"
                  fill="#FFD600"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="quizzesAttempted"
                  name="Quizzes Attempted"
                  fill="#5BC0EB"
                  radius={[6, 6, 0, 0]}
                />
                {showMinutes && (
                  <Bar
                    dataKey="minutesStudied"
                    name="Minutes Studied"
                    fill="#F97316"
                    radius={[6, 6, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
