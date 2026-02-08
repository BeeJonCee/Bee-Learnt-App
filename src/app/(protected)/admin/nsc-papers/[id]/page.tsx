"use client";

import Alert from "@mui/material/Alert";
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
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type PaperDocument = {
  id: number;
  docType: string;
  title: string;
  fileUrl: string;
  fileSize?: number | null;
};

type NscQuestion = {
  id: number;
  questionNumber: string;
  questionText: string;
  marks: number;
  sectionLabel?: string | null;
};

type NscPaperDetail = {
  id: number;
  subjectName?: string;
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

export default function AdminNscPaperDetailPage() {
  const params = useParams<{ id: string }>();
  const paperId = Number(params?.id);

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: paper,
    loading,
    error,
  } = useApi<NscPaperDetail>(
    Number.isFinite(paperId) ? `/api/nsc-papers/${paperId}` : null,
  );
  const { data: questions, refetch: refetchQuestions } = useApi<NscQuestion[]>(
    Number.isFinite(paperId) ? `/api/nsc-papers/${paperId}/questions` : null,
  );

  const handleImportToBank = async () => {
    setActionError(null);
    setImportResult(null);
    setImporting(true);
    try {
      const result = await apiFetch<{
        message: string;
        imported: number;
        skipped: number;
      }>(`/api/nsc-papers/${paperId}/import-to-bank`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setImportResult(result.message);
      refetchQuestions();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const title = paper
    ? `${paper.subjectName ?? "Subject"} P${paper.paperNumber} — ${
        sessionLabels[paper.session] ?? paper.session
      } ${paper.year}`
    : "NSC Paper";

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}
      {actionError && <Alert severity="error">{actionError}</Alert>}
      {importResult && <Alert severity="success">{importResult}</Alert>}

      {loading || !paper ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading paper...</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h4">{title}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    color={paper.isProcessed ? "success" : "default"}
                    label={paper.isProcessed ? "Processed" : "Unprocessed"}
                  />
                  {paper.totalMarks && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${paper.totalMarks} marks`}
                    />
                  )}
                  {paper.durationMinutes && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${paper.durationMinutes} min`}
                    />
                  )}
                </Stack>
                <Divider />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={handleImportToBank}
                    disabled={importing}
                  >
                    {importing ? "Importing..." : "Import questions to bank"}
                  </Button>
                  <Button variant="outlined" href="/admin/nsc-papers">
                    Back to papers
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documents ({paper.documents.length})
              </Typography>
              {paper.documents.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No documents uploaded.
                </Typography>
              ) : (
                <List disablePadding>
                  {paper.documents.map((doc) => (
                    <ListItem key={doc.id} divider>
                      <ListItemText
                        primary={doc.title}
                        secondary={docTypeLabels[doc.docType] ?? doc.docType}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Extracted questions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Extracted Questions ({questions?.length ?? 0})
              </Typography>
              {!questions || questions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No questions extracted yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {questions.map((q) => (
                    <Card key={q.id} variant="outlined">
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Q${q.questionNumber}`}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${q.marks} marks`}
                          />
                          {q.sectionLabel && (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={q.sectionLabel}
                            />
                          )}
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>
                          {q.questionText}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}
