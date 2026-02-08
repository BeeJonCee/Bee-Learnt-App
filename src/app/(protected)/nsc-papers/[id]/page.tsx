"use client";

import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

type PaperDocument = {
  id: number;
  nscPaperId: number;
  docType: string;
  title: string;
  fileUrl: string;
  filePath?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  language: string;
};

type NscPaperDetail = {
  id: number;
  subjectId: number;
  subjectName?: string;
  gradeId?: number | null;
  grade?: number | null;
  year: number;
  session: string;
  paperNumber: number;
  language: string;
  totalMarks?: number | null;
  durationMinutes?: number | null;
  isProcessed: boolean;
  documents: PaperDocument[];
};

const sessionLabels: Record<string, string> = {
  november: "November",
  may_june: "May/June",
  february_march: "Feb/March",
  supplementary: "Supplementary",
  exemplar: "Exemplar",
};

const docTypeLabels: Record<string, string> = {
  question_paper: "Question Paper",
  memorandum: "Memorandum",
  marking_guideline: "Marking Guideline",
  answer_book: "Answer Book",
  data_files: "Data Files",
  addendum: "Addendum",
  formula_sheet: "Formula Sheet",
};

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NscPaperDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const paperId = Number(params?.id);

  const { data, loading, error } = useApi<NscPaperDetail>(
    Number.isFinite(paperId) ? `/api/nsc-papers/${paperId}` : null,
  );

  const title = data
    ? `${data.subjectName ?? "Subject"} P${data.paperNumber} — ${
        sessionLabels[data.session] ?? data.session
      } ${data.year}`
    : "NSC Paper";

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}

      {loading || !data ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Loading paper details...
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  alignItems="center"
                >
                  {data.subjectName && (
                    <Chip
                      size="small"
                      color="primary"
                      label={data.subjectName}
                    />
                  )}
                  <Chip
                    size="small"
                    variant="outlined"
                    label={String(data.year)}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={sessionLabels[data.session] ?? data.session}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Paper ${data.paperNumber}`}
                  />
                  {data.grade && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Grade ${data.grade}`}
                    />
                  )}
                </Stack>

                <Box>
                  <Typography variant="h4">{title}</Typography>
                </Box>

                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {data.totalMarks && (
                    <Typography variant="body2" color="text.secondary">
                      Total marks: {data.totalMarks}
                    </Typography>
                  )}
                  {data.durationMinutes && (
                    <Typography variant="body2" color="text.secondary">
                      Duration: {data.durationMinutes} minutes
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Language: {data.language}
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  {data.isProcessed && (
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() =>
                        router.push(`/nsc-papers/practice/${data.id}`)
                      }
                    >
                      Practice this paper
                    </Button>
                  )}
                  <Button variant="outlined" href="/nsc-papers">
                    Back to papers
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Documents</Typography>
                {data.documents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No documents available for this paper.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {data.documents.map((doc) => (
                      <ListItem
                        key={doc.id}
                        divider
                        secondaryAction={
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={doc.title}
                          secondary={
                            <Stack component="span" direction="row" spacing={1}>
                              <Typography variant="caption" component="span">
                                {docTypeLabels[doc.docType] ?? doc.docType}
                              </Typography>
                              {doc.fileSize ? (
                                <Typography variant="caption" component="span">
                                  {formatFileSize(doc.fileSize)}
                                </Typography>
                              ) : null}
                            </Stack>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}
