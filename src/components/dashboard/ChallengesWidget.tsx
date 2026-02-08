"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useApi } from "@/hooks/useApi";
import { tokens } from "@/theme/tokens";

interface ChallengeData {
  id: number;
  title: string;
  description: string | null;
  type: "daily" | "weekly" | "special";
  xpReward: number;
  targetValue: number;
  currentValue: number;
  status: "active" | "completed" | "expired";
  endsAt: string | null;
}

const TYPE_COLORS = {
  daily: tokens.brand.cyan,
  weekly: tokens.brand.yellow,
  special: "#9c27b0",
};

const TYPE_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  special: "Special",
};

export default function ChallengesWidget() {
  const { data: challenges, loading } =
    useApi<ChallengeData[]>("/api/challenges");

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  const activeChallenges =
    challenges?.filter((c) => c.status === "active") ?? [];
  const completedCount =
    challenges?.filter((c) => c.status === "completed").length ?? 0;

  if (activeChallenges.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <EmojiEventsIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">No active challenges right now</Typography>
        <Typography variant="caption">Check back later!</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header stats */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Active Challenges
        </Typography>
        {completedCount > 0 && (
          <Chip
            size="small"
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label={`${completedCount} completed`}
            color="success"
            variant="outlined"
          />
        )}
      </Stack>

      {/* Challenge list */}
      <Stack spacing={1.5}>
        {activeChallenges.slice(0, 4).map((challenge) => {
          const progress = Math.min(
            100,
            Math.round((challenge.currentValue / challenge.targetValue) * 100),
          );

          return (
            <Card
              key={challenge.id}
              variant="outlined"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.02)",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        size="small"
                        label={TYPE_LABELS[challenge.type]}
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          bgcolor: `${TYPE_COLORS[challenge.type]}20`,
                          color: TYPE_COLORS[challenge.type],
                          borderColor: TYPE_COLORS[challenge.type],
                        }}
                        variant="outlined"
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {challenge.title}
                      </Typography>
                    </Stack>

                    {challenge.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {challenge.description}
                      </Typography>
                    )}

                    {/* Progress */}
                    <Box sx={{ mt: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {challenge.currentValue} / {challenge.targetValue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {progress}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 2,
                            bgcolor: TYPE_COLORS[challenge.type],
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* XP reward */}
                  <Box
                    sx={{
                      ml: 1.5,
                      textAlign: "center",
                      minWidth: 50,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color={tokens.gamification.xp}
                    >
                      +{challenge.xpReward}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      XP
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
