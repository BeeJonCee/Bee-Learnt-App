"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";

type NscPaper = {
  id: number;
  subjectId: number;
  subjectName?: string;
  gradeId?: number | null;
  grade?: number | null;
  year: number;
  session:
    | "november"
    | "may_june"
    | "february_march"
    | "supplementary"
    | "exemplar";
  paperNumber: number;
  language: string;
  totalMarks?: number | null;
  durationMinutes?: number | null;
  isProcessed: boolean;
  documentCount?: number;
};

type PaperListResponse = {
  papers: NscPaper[];
  total: number;
};

const sessionLabels: Record<string, string> = {
  november: "November",
  may_june: "May/June",
  february_march: "Feb/March",
  supplementary: "Supplementary",
  exemplar: "Exemplar",
};

function formatSession(value: string) {
  return sessionLabels[value] ?? value.replaceAll("_", " ");
}

export default function NscPapersPage() {
  const [yearFilter, setYearFilter] = useState<string>("");
  const [sessionFilter, setSessionFilter] = useState<string>("");

  const queryParts: string[] = ["limit=100"];
  if (yearFilter) queryParts.push(`year=${yearFilter}`);
  if (sessionFilter) queryParts.push(`session=${sessionFilter}`);
  const query = queryParts.join("&");

  const { data, loading, error } = useApi<PaperListResponse>(
    `/api/nsc-papers?${query}`,
  );
  const { data: years } = useApi<number[]>("/api/nsc-papers/years");

  const papers = useMemo(() => data?.papers ?? [], [data]);

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">NSC Past Papers</Typography>
        <Typography color="text.secondary">
          Browse and practice with official National Senior Certificate past
          papers.
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={yearFilter}
            label="Year"
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <MenuItem value="">All years</MenuItem>
            {(years ?? []).map((y) => (
              <MenuItem key={y} value={String(y)}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Session</InputLabel>
          <Select
            value={sessionFilter}
            label="Session"
            onChange={(e) => setSessionFilter(e.target.value)}
          >
            <MenuItem value="">All sessions</MenuItem>
            <MenuItem value="november">November</MenuItem>
            <MenuItem value="may_june">May/June</MenuItem>
            <MenuItem value="february_march">Feb/March</MenuItem>
            <MenuItem value="supplementary">Supplementary</MenuItem>
            <MenuItem value="exemplar">Exemplar</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Loading past papers...
            </Typography>
          </CardContent>
        </Card>
      ) : papers.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No past papers found. Try adjusting the filters or run the NSC
              papers seed.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {papers.map((paper) => (
            <Grid item xs={12} md={6} lg={4} key={paper.id}>
              <Card>
                <CardActionArea
                  component={Link}
                  href={`/nsc-papers/${paper.id}`}
                >
                  <Box
                    sx={{
                      height: 140,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      px: 3,
                      background:
                        "linear-gradient(135deg, rgba(246, 201, 69, 0.14), rgba(255,255,255,0))",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {paper.subjectName && (
                        <Chip
                          size="small"
                          color="primary"
                          label={paper.subjectName}
                        />
                      )}
                      <Chip
                        size="small"
                        variant="outlined"
                        label={String(paper.year)}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={formatSession(paper.session)}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Paper ${paper.paperNumber}`}
                      />
                    </Stack>
                  </Box>
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Typography variant="h6">
                        {paper.subjectName ?? "Subject"} P{paper.paperNumber} —{" "}
                        {formatSession(paper.session)} {paper.year}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {paper.totalMarks && (
                          <Typography variant="caption" color="text.secondary">
                            {paper.totalMarks} marks
                          </Typography>
                        )}
                        {paper.durationMinutes && (
                          <Typography variant="caption" color="text.secondary">
                            {paper.durationMinutes} min
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {paper.language}
                        </Typography>
                        {paper.grade && (
                          <Typography variant="caption" color="text.secondary">
                            Grade {paper.grade}
                          </Typography>
                        )}
                      </Stack>
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
