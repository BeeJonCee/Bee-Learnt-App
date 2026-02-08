"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

type Props = {
  score: number;
  maxScore?: number;
  label?: string;
};

export default function PerformanceGauge({
  score,
  maxScore = 100,
  label,
}: Props) {
  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(score, maxScore))
    : 0;
  const percent = Math.round((safeScore / maxScore) * 100);
  const data = [
    { name: "Score", value: percent, fill: "#5bc0eb" },
    { name: "Remaining", value: 100 - percent, fill: "#e5e7eb" },
  ];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">Performance</Typography>
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          <Stack sx={{ width: "100%", height: 180, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  stroke="none"
                />
              </PieChart>
            </ResponsiveContainer>
            <Stack
              sx={{
                position: "absolute",
                inset: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                {safeScore}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                out of {maxScore}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
