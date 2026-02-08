"use client";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface StudentCountChartProps {
  data?: {
    total: number;
    grades: { grade: number; count: number }[];
    roles?: { role: string; count: number }[];
  };
  title?: string;
}

const COLORS = {
  grade9: "#FFD600", // Bee Yellow
  grade10: "#5BC0EB", // Secondary blue
  grade11: "#F97316", // Orange
  grade12: "#9333EA", // Purple
  total: "rgba(255, 255, 255, 0.2)",
};

export default function StudentCountChart({
  data,
  title = "Students",
}: StudentCountChartProps) {
  const total = data?.total ?? 0;
  const grades = data?.grades ?? [];

  // Transform data for radial chart
  const chartData = [
    { name: "Total", count: total, fill: COLORS.total },
    ...grades.map((g, index) => ({
      name: `Grade ${g.grade}`,
      count: g.count,
      fill: Object.values(COLORS)[index % 4],
    })),
  ];

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
          <Box sx={{ position: "relative", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="100%"
                barSize={18}
                data={chartData}
              >
                <RadialBar background dataKey="count" cornerRadius={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2B2B2B",
                    borderRadius: 12,
                    color: "#E0E0E0",
                  }}
                  formatter={(value: number | undefined) => [
                    `${value ?? 0} students`,
                    "",
                  ]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            {/* Center icon */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: alpha("#FFD600", 0.15),
                display: "grid",
                placeItems: "center",
              }}
            >
              <PeopleAltIcon sx={{ color: "primary.main", fontSize: 28 }} />
            </Box>
          </Box>

          {/* Legend */}
          <Stack
            direction="row"
            spacing={3}
            justifyContent="center"
            flexWrap="wrap"
          >
            {grades.map((g, index) => (
              <Stack key={g.grade} alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: Object.values(COLORS)[index % 4],
                  }}
                />
                <Typography variant="subtitle2" fontWeight={700}>
                  {g.count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Grade {g.grade}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
