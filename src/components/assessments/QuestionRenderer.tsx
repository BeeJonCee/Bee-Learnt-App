"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { type ChangeEvent, useCallback } from "react";

type QuestionOption = {
  id: string;
  text: string;
  imageUrl?: string;
};

export type QuestionData = {
  assessmentQuestionId: number;
  type: string;
  questionText: string;
  questionHtml?: string | null;
  imageUrl?: string | null;
  options?: unknown;
  points: number;
};

type Props = {
  question: QuestionData;
  answer: unknown;
  onChange: (questionId: number, value: unknown) => void;
  disabled?: boolean;
};

function parseOptions(raw: unknown): QuestionOption[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item, i) => {
      if (typeof item === "string") return { id: String(i), text: item };
      if (item && typeof item === "object" && "text" in item) {
        const obj = item as Record<string, unknown>;
        return {
          id: String(obj.id ?? i),
          text: String(obj.text),
          imageUrl: obj.imageUrl as string | undefined,
        };
      }
      return { id: String(i), text: String(item) };
    });
  }
  if (typeof raw === "object" && raw !== null && "options" in raw) {
    return parseOptions((raw as Record<string, unknown>).options);
  }
  return [];
}

function parseMatchPairs(raw: unknown): { left: string[]; right: string[] } {
  if (!raw) return { left: [], right: [] };
  if (Array.isArray(raw)) {
    return {
      left: raw.map((p: Record<string, unknown>) =>
        String(p.left ?? p.premise ?? ""),
      ),
      right: raw.map((p: Record<string, unknown>) =>
        String(p.right ?? p.response ?? ""),
      ),
    };
  }
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (obj.pairs) return parseMatchPairs(obj.pairs);
    if (obj.left && obj.right) {
      return { left: obj.left as string[], right: obj.right as string[] };
    }
  }
  return { left: [], right: [] };
}

function parseOrderItems(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => (typeof item === "string" ? item : String(item)));
  }
  if (typeof raw === "object" && raw !== null && "items" in raw) {
    return parseOrderItems((raw as Record<string, unknown>).items);
  }
  return [];
}

export default function QuestionRenderer({
  question,
  answer,
  onChange,
  disabled,
}: Props) {
  const options = parseOptions(question.options);
  const qId = question.assessmentQuestionId;

  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(qId, e.target.value);
    },
    [qId, onChange],
  );

  const renderByType = () => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <RadioGroup
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => onChange(qId, e.target.value)}
          >
            {options.map((opt) => (
              <FormControlLabel
                key={opt.id}
                value={opt.text}
                control={<Radio disabled={disabled} />}
                label={opt.text}
              />
            ))}
          </RadioGroup>
        );

      case "multi_select": {
        const selected: string[] = Array.isArray(answer) ? answer : [];
        return (
          <Stack>
            {options.map((opt) => (
              <FormControlLabel
                key={opt.id}
                control={
                  <Checkbox
                    checked={selected.includes(opt.text)}
                    disabled={disabled}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, opt.text]
                        : selected.filter((v) => v !== opt.text);
                      onChange(qId, next);
                    }}
                  />
                }
                label={opt.text}
              />
            ))}
          </Stack>
        );
      }

      case "true_false":
        return (
          <RadioGroup
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => onChange(qId, e.target.value)}
          >
            <FormControlLabel
              value="true"
              control={<Radio disabled={disabled} />}
              label="True"
            />
            <FormControlLabel
              value="false"
              control={<Radio disabled={disabled} />}
              label="False"
            />
          </RadioGroup>
        );

      case "numeric":
        return (
          <TextField
            label="Numeric answer"
            type="number"
            value={answer ?? ""}
            onChange={handleTextChange}
            disabled={disabled}
            fullWidth
            size="small"
          />
        );

      case "fill_in_blank":
        return (
          <TextField
            label="Fill in the blank"
            value={typeof answer === "string" ? answer : ""}
            onChange={handleTextChange}
            disabled={disabled}
            fullWidth
            size="small"
          />
        );

      case "short_answer":
        return (
          <TextField
            label="Your answer"
            value={typeof answer === "string" ? answer : ""}
            onChange={handleTextChange}
            disabled={disabled}
            fullWidth
            multiline
            minRows={2}
          />
        );

      case "essay":
        return (
          <TextField
            label="Your response"
            value={typeof answer === "string" ? answer : ""}
            onChange={handleTextChange}
            disabled={disabled}
            fullWidth
            multiline
            minRows={6}
          />
        );

      case "matching": {
        const { left, right } = parseMatchPairs(question.options);
        const pairs: Record<string, string> =
          answer && typeof answer === "object" && !Array.isArray(answer)
            ? (answer as Record<string, string>)
            : {};
        return (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Match each item on the left with the correct option on the right.
            </Typography>
            {left.map((leftItem) => (
              <Stack
                key={leftItem}
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Typography variant="body2" sx={{ minWidth: 120 }}>
                  {leftItem}
                </Typography>
                <TextField
                  select
                  value={pairs[leftItem] ?? ""}
                  onChange={(e) => {
                    const next = { ...pairs, [leftItem]: e.target.value };
                    onChange(qId, next);
                  }}
                  size="small"
                  sx={{ minWidth: 200 }}
                  disabled={disabled}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select...</option>
                  {right.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </TextField>
              </Stack>
            ))}
          </Stack>
        );
      }

      case "ordering": {
        const items = parseOrderItems(question.options);
        const ordered: string[] = Array.isArray(answer) ? answer : [...items];
        return (
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Arrange the items in the correct order (enter numbers 1-
              {items.length} to reorder).
            </Typography>
            {ordered.map((item, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: ordering items may have duplicates
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  type="number"
                  value={i + 1}
                  onChange={(e) => {
                    const newIdx = Number(e.target.value) - 1;
                    if (newIdx < 0 || newIdx >= ordered.length) return;
                    const next = [...ordered];
                    next.splice(i, 1);
                    next.splice(newIdx, 0, item);
                    onChange(qId, next);
                  }}
                  sx={{ width: 60 }}
                  disabled={disabled}
                  slotProps={{ htmlInput: { min: 1, max: items.length } }}
                />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            ))}
          </Stack>
        );
      }

      default:
        return (
          <TextField
            label="Your answer"
            value={typeof answer === "string" ? answer : ""}
            onChange={handleTextChange}
            disabled={disabled}
            fullWidth
            multiline
            minRows={2}
          />
        );
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{question.questionText}</Typography>
      {question.imageUrl && (
        <Box
          component="img"
          src={question.imageUrl}
          alt="Question image"
          sx={{ maxWidth: "100%", maxHeight: 400, borderRadius: 1 }}
        />
      )}
      {renderByType()}
    </Stack>
  );
}
