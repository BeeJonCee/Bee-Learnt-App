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

type NscPaper = {
  id: number;
  subjectId: number;
  subjectName?: string;
  grade?: number | null;
  year: number;
  session: string;
  paperNumber: number;
  language: string;
  totalMarks?: number | null;
  isProcessed: boolean;
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

export default function AdminNscPapersPage() {
  const { data, loading, error } = useApi<PaperListResponse>(
    "/api/nsc-papers?limit=100",
  );
  const papers = data?.papers ?? [];

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">NSC Papers Management</Typography>
        <Typography color="text.secondary">
          Manage past paper catalog, upload documents, and extract questions.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading papers...</Typography>
          </CardContent>
        </Card>
      ) : papers.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No papers found. Run the seed script: npm run seed:nsc-papers
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {data?.total ?? 0} papers in catalog
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {papers.map((paper) => (
              <Grid item xs={12} md={6} lg={4} key={paper.id}>
                <Card>
                  <CardActionArea
                    component={Link}
                    href={`/admin/nsc-papers/${paper.id}`}
                  >
                    <CardContent>
                      <Stack spacing={1}>
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
                            label={
                              sessionLabels[paper.session] ?? paper.session
                            }
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`P${paper.paperNumber}`}
                          />
                          <Chip
                            size="small"
                            color={paper.isProcessed ? "success" : "default"}
                            variant="outlined"
                            label={
                              paper.isProcessed ? "Processed" : "Unprocessed"
                            }
                          />
                        </Stack>
                        <Typography variant="subtitle2">
                          {paper.subjectName ?? "Subject"} P{paper.paperNumber}{" "}
                          — {sessionLabels[paper.session] ?? paper.session}{" "}
                          {paper.year}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Stack>
  );
}
