"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

type AssessmentSummary = {
  id: number;
  title: string;
  description?: string | null;
  type: "quiz" | "test" | "exam" | "practice" | "nsc_simulation" | "diagnostic";
  status: "draft" | "published" | "archived";
  subjectId: number;
  subjectName: string;
  grade?: number | null;
  moduleId?: number | null;
  timeLimitMinutes?: number | null;
};

function formatType(value: AssessmentSummary["type"]) {
  return value.replaceAll("_", " ").toUpperCase();
}

export default function AssessmentsPage() {
  const { data, loading, error } = useApi<AssessmentSummary[]>(
    "/api/assessments?limit=50",
  );
  const assessments = data ?? [];

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">Assessments</Typography>
        <Typography color="text.secondary">
          Practice quizzes and timed assessments based on your modules.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Loading assessments...
            </Typography>
          </CardContent>
        </Card>
      ) : assessments.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No assessments found. If this is a fresh database, run the backend
              seed.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {assessments.map((assessment) => (
            <Grid item xs={12} md={6} lg={4} key={assessment.id}>
              <Card>
                <CardActionArea
                  component={Link}
                  href={`/assessments/${assessment.id}`}
                >
                  <Box
                    sx={{
                      height: 140,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      px: 3,
                      background:
                        "linear-gradient(135deg, rgba(91, 192, 235, 0.14), rgba(255,255,255,0))",
                    }}
                  >
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        color="primary"
                        label={assessment.subjectName}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={formatType(assessment.type)}
                      />
                      {assessment.grade ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Grade ${assessment.grade}`}
                        />
                      ) : null}
                    </Stack>
                  </Box>
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Typography variant="h6">{assessment.title}</Typography>
                      {assessment.description ? (
                        <Typography variant="body2" color="text.secondary">
                          {assessment.description}
                        </Typography>
                      ) : null}
                      {assessment.timeLimitMinutes ? (
                        <Typography variant="caption" color="text.secondary">
                          Time limit: {assessment.timeLimitMinutes} min
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Untimed
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
