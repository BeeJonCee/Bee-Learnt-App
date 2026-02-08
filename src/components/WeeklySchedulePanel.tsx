"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";

type EventItem = {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  location: string | null;
  audience: "ALL" | "STUDENT" | "PARENT" | "ADMIN";
};

const formatDay = (value: Date) =>
  value.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function WeeklySchedulePanel() {
  const today = new Date();
  const from = new Date(today);
  from.setHours(0, 0, 0, 0);
  const to = new Date(today);
  to.setDate(to.getDate() + 6);
  to.setHours(23, 59, 59, 999);

  const { data, loading, error } = useApi<EventItem[]>(
    `/api/events?from=${from.toISOString()}&to=${to.toISOString()}&limit=20`,
  );

  const grouped = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(from);
      date.setDate(date.getDate() + i);
      map.set(date.toISOString().slice(0, 10), []);
    }
    for (const event of data ?? []) {
      const key = new Date(event.startAt).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(event);
    }
    return Array.from(map.entries()).map(([key, events]) => ({
      key,
      date: new Date(key),
      events: events.sort((a, b) => a.startAt.localeCompare(b.startAt)),
    }));
  }, [data, from]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Weekly schedule</Typography>
            <Chip label="Next 7 days" size="small" />
          </Stack>
          {loading ? (
            <Typography color="text.secondary">Loading schedule...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (data ?? []).length === 0 ? (
            <Typography color="text.secondary">
              No sessions scheduled yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {grouped.map((group) => (
                <Stack key={group.key} spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {formatDay(group.date)}
                  </Typography>
                  {group.events.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No sessions
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {group.events.map((event) => (
                        <Stack
                          key={event.id}
                          spacing={0.5}
                          sx={{
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            p: 1.25,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              flex={1}
                            >
                              {event.title}
                            </Typography>
                            <Chip label={event.audience} size="small" />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                          <Divider />
                          <Typography variant="caption" color="text.secondary">
                            {event.allDay
                              ? "All day"
                              : `${formatTime(event.startAt)}${event.endAt ? ` - ${formatTime(event.endAt)}` : ""}`}
                            {event.location ? ` · ${event.location}` : ""}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
