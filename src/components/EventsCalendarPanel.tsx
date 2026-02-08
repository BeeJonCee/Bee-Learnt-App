"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useApi } from "@/hooks/useApi";

type EventItem = {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  location: string | null;
  audience: "ALL" | "STUDENT" | "PARENT" | "ADMIN" | "TUTOR";
};

const AUDIENCE_COLORS: Record<string, string> = {
  ALL: "#5BC0EB", // Blue
  STUDENT: "#FFD600", // Yellow
  PARENT: "#9333EA", // Purple
  ADMIN: "#EF4444", // Red
  TUTOR: "#22C55E", // Green
};

type CalendarValue = Date | [Date, Date] | null;

type Scope = "month" | "week";

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value: Date) =>
  value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function EventsCalendarPanel() {
  const [value, setValue] = useState<CalendarValue>(new Date());
  const [scope, setScope] = useState<Scope>("week");
  const selectedDate = Array.isArray(value) ? value[0] : (value ?? new Date());

  const fromDate = useMemo(() => {
    const start = new Date(selectedDate);
    if (scope === "week") {
      start.setDate(start.getDate() - start.getDay());
    } else {
      start.setDate(1);
    }
    start.setHours(0, 0, 0, 0);
    return start;
  }, [selectedDate, scope]);

  const toDate = useMemo(() => {
    const end = new Date(fromDate);
    if (scope === "week") {
      end.setDate(end.getDate() + 6);
    } else {
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }
    end.setHours(23, 59, 59, 999);
    return end;
  }, [fromDate, scope]);

  const { data, loading, error } = useApi<EventItem[]>(
    `/api/events?from=${fromDate.toISOString()}&to=${toDate.toISOString()}&limit=8`,
  );

  const events = data ?? [];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <EventIcon color="primary" />
              <Typography variant="h6">Events</Typography>
            </Stack>
            <ToggleButtonGroup
              value={scope}
              exclusive
              onChange={(_, next) => next && setScope(next)}
              size="small"
            >
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 1.5,
            }}
          >
            <Calendar
              value={value}
              onChange={(newValue) => {
                if (Array.isArray(newValue) && newValue.length === 2) {
                  setValue([newValue[0] as Date, newValue[1] as Date]);
                } else if (newValue instanceof Date) {
                  setValue(newValue);
                } else if (newValue === null) {
                  setValue(null);
                }
              }}
            />
          </Box>

          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Showing events for {formatDate(selectedDate)}
            </Typography>

            {loading ? (
              <Typography color="text.secondary">Loading events...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : events.length === 0 ? (
              <Typography color="text.secondary">
                No events scheduled yet.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {events.map((event, _index) => {
                  const color =
                    AUDIENCE_COLORS[event.audience] || AUDIENCE_COLORS.ALL;
                  return (
                    <Box
                      key={event.id}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderTop: "none",
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        position: "relative",
                        overflow: "hidden",
                        p: 1.5,
                        bgcolor: alpha(color, 0.04),
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          bgcolor: color,
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                          justifyContent="space-between"
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {event.title}
                          </Typography>
                          <Chip
                            label={event.audience}
                            size="small"
                            sx={{
                              bgcolor: alpha(color, 0.15),
                              color: color,
                              fontWeight: 600,
                              fontSize: 10,
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: 13 }}
                        >
                          {event.description}
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDateTime(event.startAt)}
                              {event.endAt &&
                                ` - ${formatDateTime(event.endAt)}`}
                            </Typography>
                          </Stack>
                          {event.location && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <LocationOnIcon
                                sx={{ fontSize: 14, color: "text.secondary" }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {event.location}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
