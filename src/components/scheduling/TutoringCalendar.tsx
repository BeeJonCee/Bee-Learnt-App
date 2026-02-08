"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type CalendarValue = Date | [Date, Date] | null;

export type TutoringSession = {
  id: number;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
  status:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show"
    | string;
  studentId: string;
  studentName?: string;
  subjectId?: number;
  subjectName?: string;
  moduleId?: number;
  moduleTitle?: string;
  meetingLink?: string;
  location?: string;
};

export interface TutoringCalendarProps {
  sessions: TutoringSession[];
  onSessionClick?: (session: TutoringSession) => void;
  onCreateSession?: (date: Date) => void;
  userRole?: string;
}

const pad2 = (value: number) => value.toString().padStart(2, "0");

const toLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TutoringCalendar({
  sessions,
  onSessionClick,
  onCreateSession,
  userRole,
}: TutoringCalendarProps) {
  const [value, setValue] = useState<CalendarValue>(new Date());
  const selectedDate = Array.isArray(value) ? value[0] : (value ?? new Date());
  const selectedKey = useMemo(
    () => toLocalDateKey(selectedDate),
    [selectedDate],
  );

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, TutoringSession[]>();
    for (const session of sessions) {
      const date = new Date(session.scheduledStart);
      if (Number.isNaN(date.getTime())) continue;
      const key = toLocalDateKey(date);
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(a.scheduledStart).getTime() -
          new Date(b.scheduledStart).getTime(),
      );
    }
    return map;
  }, [sessions]);

  const selectedSessions = useMemo(
    () => sessionsByDay.get(selectedKey) ?? [],
    [sessionsByDay, selectedKey],
  );

  const canCreate =
    Boolean(onCreateSession) && (userRole === "TUTOR" || userRole === "ADMIN");

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6">Calendar</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
            </Stack>

            {canCreate && (
              <Button
                variant="contained"
                size="small"
                onClick={() => onCreateSession?.(selectedDate)}
              >
                New session
              </Button>
            )}
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
              tileContent={({ date }) => {
                const key = toLocalDateKey(date);
                const count = sessionsByDay.get(key)?.length ?? 0;
                if (count <= 0) return null;
                return (
                  <Box
                    sx={{
                      mt: 0.5,
                      mx: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      boxShadow: `0 0 0 3px ${alpha("#FFD600", 0.2)}`,
                    }}
                  />
                );
              }}
            />
          </Box>

          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Sessions ({selectedSessions.length})
            </Typography>

            {selectedSessions.length === 0 ? (
              <Typography color="text.secondary">
                No sessions scheduled for this day.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {selectedSessions.map((session) => {
                  const statusColor =
                    session.status === "scheduled"
                      ? "info"
                      : session.status === "completed"
                        ? "success"
                        : session.status === "cancelled"
                          ? "error"
                          : "default";

                  return (
                    <Box
                      key={session.id}
                      role={onSessionClick ? "button" : undefined}
                      tabIndex={onSessionClick ? 0 : undefined}
                      onClick={() => onSessionClick?.(session)}
                      onKeyDown={(e) => {
                        if (!onSessionClick) return;
                        if (e.key === "Enter" || e.key === " ")
                          onSessionClick(session);
                      }}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        cursor: onSessionClick ? "pointer" : "default",
                        bgcolor: alpha("#fff", 0.02),
                        "&:hover": onSessionClick
                          ? {
                              borderColor: alpha("#FFD600", 0.6),
                              bgcolor: alpha("#FFD600", 0.04),
                            }
                          : undefined,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        justifyContent="space-between"
                      >
                        <Stack spacing={0.25}>
                          <Typography variant="subtitle2">
                            {session.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(session.scheduledStart)} -{" "}
                            {formatTime(session.scheduledEnd)}
                            {session.studentName
                              ? ` · ${session.studentName}`
                              : ""}
                          </Typography>
                          {(session.subjectName || session.moduleTitle) && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {[session.subjectName, session.moduleTitle]
                                .filter(Boolean)
                                .join(" · ")}
                            </Typography>
                          )}
                        </Stack>
                        <Chip
                          size="small"
                          label={session.status}
                          color={
                            statusColor as
                              | "info"
                              | "success"
                              | "error"
                              | "default"
                          }
                        />
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
