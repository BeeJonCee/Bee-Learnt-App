"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";

type QuestionBankItem = {
  id: number;
  subjectId: number;
  subjectName?: string;
  topicId?: number | null;
  topicTitle?: string | null;
  type: string;
  difficulty: string;
  questionText: string;
  points: number;
  source: string;
  sourceReference?: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: string;
};

type QBListResponse = {
  items: QuestionBankItem[];
  total: number;
  limit: number;
  offset: number;
};

const difficultyColors: Record<string, "success" | "warning" | "error"> = {
  easy: "success",
  medium: "warning",
  hard: "error",
};

export default function AdminQuestionBankPage() {
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const queryParts = ["limit=50"];
  if (difficultyFilter) queryParts.push(`difficulty=${difficultyFilter}`);
  if (typeFilter) queryParts.push(`type=${typeFilter}`);
  const query = queryParts.join("&");

  const { data, loading, error } = useApi<QBListResponse>(
    `/api/question-bank?${query}`,
  );
  const items = data?.items ?? [];

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">Question Bank</Typography>
        <Typography color="text.secondary">
          Manage reusable questions across subjects and topics.
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={difficultyFilter}
            label="Difficulty"
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
            <MenuItem value="true_false">True/False</MenuItem>
            <MenuItem value="short_answer">Short Answer</MenuItem>
            <MenuItem value="essay">Essay</MenuItem>
            <MenuItem value="numeric">Numeric</MenuItem>
            <MenuItem value="matching">Matching</MenuItem>
            <MenuItem value="ordering">Ordering</MenuItem>
            <MenuItem value="fill_in_blank">Fill in Blank</MenuItem>
          </Select>
        </FormControl>
        {data && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {data.total} questions total
            </Typography>
          </Box>
        )}
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading questions...</Typography>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No questions found. Create questions or import from NSC papers.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Card}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Question</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>
                    <Typography variant="body2" noWrap>
                      {item.questionText}
                    </Typography>
                    {item.topicTitle && (
                      <Typography variant="caption" color="text.secondary">
                        {item.topicTitle}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={item.type.replaceAll("_", " ")}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={difficultyColors[item.difficulty] ?? "default"}
                      label={item.difficulty}
                    />
                  </TableCell>
                  <TableCell>{item.points}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={item.source} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
