"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";

type AttendanceSummary = {
  totals: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  daily: {
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }[];
};

type ParentAttendanceSummary = {
  studentId: string;
  studentName: string;
  summary: AttendanceSummary;
};

const percent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

export default function AttendanceSummaryPanel({
  studentId,
}: {
  studentId?: string;
}) {
  const query = studentId
    ? `/api/attendance/summary?studentId=${studentId}`
    : "/api/attendance/summary";
  const { data, loading, error } = useApi<
    AttendanceSummary | ParentAttendanceSummary[]
  >(query);

  const summaries = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data))
      return data.map((entry) => ({
        name: entry.studentName,
        summary: entry.summary,
      }));
    return [{ name: "Your attendance", summary: data }];
  }, [data]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Attendance snapshot</Typography>
          {loading ? (
            <Typography color="text.secondary">
              Loading attendance...
            </Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : summaries.length === 0 ? (
            <Typography color="text.secondary">
              No attendance records yet.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {summaries.map((entry) => {
                const totals = entry.summary.totals;
                const totalDays =
                  totals.present + totals.absent + totals.late + totals.excused;
                return (
                  <Stack key={entry.name} spacing={1.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {entry.name}
                    </Typography>
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Present</Typography>
                        <Typography variant="body2">
                          {percent(totals.present, totalDays)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={percent(totals.present, totalDays)}
                      />
                    </Stack>
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Absent</Typography>
                        <Typography variant="body2">
                          {percent(totals.absent, totalDays)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        color="error"
                        variant="determinate"
                        value={percent(totals.absent, totalDays)}
                      />
                    </Stack>
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Late</Typography>
                        <Typography variant="body2">
                          {percent(totals.late, totalDays)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        color="warning"
                        variant="determinate"
                        value={percent(totals.late, totalDays)}
                      />
                    </Stack>
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Excused</Typography>
                        <Typography variant="body2">
                          {percent(totals.excused, totalDays)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        color="info"
                        variant="determinate"
                        value={percent(totals.excused, totalDays)}
                      />
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
