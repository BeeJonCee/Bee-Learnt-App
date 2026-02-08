"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useApi } from "@/hooks/useApi";
import { tokens } from "@/theme/tokens";

interface UserPointsData {
  totalXp: number;
  level: number;
  weeklyXp: number;
  monthlyXp: number;
  xpToNextLevel: number;
  levelProgress: number;
}

export default function XPProgressBar() {
  const { data: points, loading } = useApi<UserPointsData>("/api/points");

  if (loading || !points) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
        {/* Level badge */}
        <Tooltip title={`Level ${points.level}`}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: tokens.gamification.xp,
              color: "#000",
              fontWeight: 700,
              fontSize: "1.25rem",
              boxShadow: `0 0 12px ${tokens.gamification.xp}40`,
            }}
          >
            {points.level}
          </Box>
        </Tooltip>

        {/* XP info */}
        <Box sx={{ flex: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Level {points.level}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {points.totalXp.toLocaleString()} XP total
            </Typography>
          </Stack>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={points.levelProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              mt: 0.5,
              bgcolor: "rgba(255, 214, 0, 0.2)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor: tokens.gamification.xp,
              },
            }}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {points.xpToNextLevel} XP to Level {points.level + 1}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {points.levelProgress}%
            </Typography>
          </Stack>
        </Box>
      </Stack>

      {/* Weekly/Monthly stats */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(91, 192, 235, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="secondary.main">
            {points.weeklyXp}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This Week
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(139, 195, 74, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="success.main">
            {points.monthlyXp}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This Month
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
