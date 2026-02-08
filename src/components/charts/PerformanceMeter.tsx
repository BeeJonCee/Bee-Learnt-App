"use client";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface PerformanceMeterProps {
  score: number;
  maxScore?: number;
  title?: string;
  subtitle?: string;
  label?: string;
}

export default function PerformanceMeter({
  score,
  maxScore = 100,
  title = "Performance",
  subtitle,
  label = "Score",
}: PerformanceMeterProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const remaining = 100 - percentage;

  const data = [
    { name: "Score", value: percentage },
    { name: "Remaining", value: remaining },
  ];

  const getColor = (pct: number) => {
    if (pct >= 80) return "#22C55E"; // Green
    if (pct >= 60) return "#FFD600"; // Yellow
    if (pct >= 40) return "#F97316"; // Orange
    return "#EF4444"; // Red
  };

  const scoreColor = getColor(percentage);

  return (
    <Card sx={{ height: "100%", position: "relative" }}>
      <CardContent>
        <Stack spacing={1}>
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
          <Box sx={{ position: "relative", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="65%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={scoreColor} />
                  <Cell fill={alpha(scoreColor, 0.15)} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Score Display */}
            <Box
              sx={{
                position: "absolute",
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{ color: scoreColor, lineHeight: 1 }}
              >
                {score.toFixed(score % 1 === 0 ? 0 : 1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {maxScore} {label}
              </Typography>
            </Box>
          </Box>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: -2 }}
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
