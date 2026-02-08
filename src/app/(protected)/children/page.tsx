"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useApi } from "@/hooks/useApi";

export default function ChildrenPage() {
  const {
    data: overview,
    loading,
    error,
  } = useApi<
    {
      studentId: string;
      studentName: string;
      completedLessons: number;
      quizAverage: number;
    }[]
  >("/api/parent/overview");

  return (
    <Stack spacing={3}>
      <Typography variant="h3">Children</Typography>
      <Typography color="text.secondary">
        Track progress and support each learner with focused feedback.
      </Typography>
      {loading ? (
        <Typography color="text.secondary">
          Loading learner summaries...
        </Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (overview ?? []).length === 0 ? (
        <Typography color="text.secondary">
          No linked learners yet. Ask an admin to connect your parent account.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {(overview ?? []).map((child) => (
            <Grid item xs={12} md={6} key={child.studentId}>
              <Card>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h6">{child.studentName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lessons completed: {child.completedLessons}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quiz average: {child.quizAverage}%
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
