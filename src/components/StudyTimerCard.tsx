"use client";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import TimerIcon from "@mui/icons-material/Timer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type StudySummary = {
  streak: {
    currentStreak: number;
    longestStreak: number;
    weeklyMinutes: number;
    lastStudyDate: string | null;
  };
  totalMinutes: number;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export default function StudyTimerCard() {
  const { data, loading, error, refetch } =
    useApi<StudySummary>("/api/study/summary");
  const [running, setRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      if (startedAtRef.current) {
        const diff = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setElapsedSeconds(diff);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const handleStart = () => {
    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    setRunning(true);
  };

  const handleStop = async () => {
    if (!startedAtRef.current) return;
    const endedAt = new Date();
    const startedAt = new Date(startedAtRef.current);
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    try {
      await apiFetch("/api/study/sessions", {
        method: "POST",
        body: JSON.stringify({
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          durationMinutes,
        }),
      });
      await refetch();
    } catch {
      // Let the error state handle feedback below.
    } finally {
      setRunning(false);
      setElapsedSeconds(0);
      startedAtRef.current = null;
    }
  };

  const weeklyHours = data
    ? (data.streak.weeklyMinutes / 60).toFixed(1)
    : "0.0";

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TimerIcon color="primary" />
            <Typography variant="h6">Study timer</Typography>
          </Stack>

          <Typography variant="h3" sx={{ letterSpacing: 1 }}>
            {formatDuration(elapsedSeconds)}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`Streak: ${data?.streak.currentStreak ?? 0} days`}
              size="small"
            />
            <Chip label={`Weekly: ${weeklyHours} hrs`} size="small" />
            <Chip
              label={`Best: ${data?.streak.longestStreak ?? 0} days`}
              size="small"
            />
          </Stack>

          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
          {loading && !data && (
            <Typography variant="caption" color="text.secondary">
              Loading study stats...
            </Typography>
          )}

          <Box>
            {running ? (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<StopIcon />}
                onClick={handleStop}
              >
                Stop & save
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleStart}
              >
                Start session
              </Button>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
