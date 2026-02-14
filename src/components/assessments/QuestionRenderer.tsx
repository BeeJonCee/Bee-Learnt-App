"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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

function getAnswerValue(answer: unknown): unknown {
  if (!answer || typeof answer !== "object" || Array.isArray(answer))
    return answer;
  const payload = answer as Record<string, unknown>;
  if (payload.value !== undefined) return payload.value;
  if (payload.answer !== undefined) return payload.answer;
  return answer;
}

function normalizeText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return "";
}

function resolveOptionId(value: unknown, options: QuestionOption[]): string {
  const token = normalizeText(value).trim();
  if (!token) return "";

  const tokenLower = token.toLowerCase();
  const byId = options.find(
    (option) => option.id.trim().toLowerCase() === tokenLower,
  );
  if (byId) return byId.id;

  const byText = options.find(
    (option) => option.text.trim().toLowerCase() === tokenLower,
  );
  return byText?.id ?? "";
}

function resolveSelectedOptionIds(
  answer: unknown,
  options: QuestionOption[],
): string[] {
  const raw = getAnswerValue(answer);
  const values = Array.isArray(raw)
    ? raw
    : raw === null || raw === undefined
      ? []
      : [raw];
  return Array.from(
    new Set(
      values
        .map((entry) => resolveOptionId(entry, options))
        .filter((entry) => entry.length > 0),
    ),
  );
}

function resolveBooleanSelection(answer: unknown): "true" | "false" | "" {
  const raw = getAnswerValue(answer);
  if (typeof raw === "boolean") return raw ? "true" : "false";
  if (typeof raw === "number") return raw === 0 ? "false" : "true";
  if (typeof raw === "string") {
    const token = raw.trim().toLowerCase();
    if (token === "true" || token === "1" || token === "yes") return "true";
    if (token === "false" || token === "0" || token === "no") return "false";
  }
  return "";
}

function resolveTextAnswer(answer: unknown): string {
  const raw = getAnswerValue(answer);
  return normalizeText(raw);
}

function resolveBlankAnswer(answer: unknown): string {
  const raw = getAnswerValue(answer);
  if (Array.isArray(raw)) {
    const first = raw.find((entry) => normalizeText(entry).trim().length > 0);
    return normalizeText(first);
  }
  return normalizeText(raw);
}

function resolvePairMap(answer: unknown): Record<string, string> {
  const raw = getAnswerValue(answer);

  if (Array.isArray(raw)) {
    const pairs: Record<string, string> = {};
    for (const entry of raw) {
      if (!entry || typeof entry !== "object") continue;
      const pair = entry as Record<string, unknown>;
      const left = normalizeText(pair.left).trim();
      const right = normalizeText(pair.right).trim();
      if (left && right) pairs[left] = right;
    }
    return pairs;
  }

  if (raw && typeof raw === "object") {
    const pairs: Record<string, string> = {};
    for (const [left, right] of Object.entries(
      raw as Record<string, unknown>,
    )) {
      const normalizedLeft = normalizeText(left).trim();
      const normalizedRight = normalizeText(right).trim();
      if (normalizedLeft && normalizedRight) {
        pairs[normalizedLeft] = normalizedRight;
      }
    }
    return pairs;
  }

  return {};
}

function resolveOrdering(answer: unknown, fallback: string[]): string[] {
  const raw = getAnswerValue(answer);
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => normalizeText(entry))
      .filter((entry) => entry.trim().length > 0);
  }
  return [...fallback];
}

export default function QuestionRenderer({
  question,
  answer,
  onChange,
  disabled,
}: Props) {
  const options = parseOptions(question.options);
  const qId = question.assessmentQuestionId;

  const renderByType = () => {
    switch (question.type) {
      case "multiple_choice": {
        const selected = resolveOptionId(answer, options);
        return (
          <RadioGroup
            value={selected}
            onChange={(e) =>
              onChange(qId, { type: "single", value: e.target.value })
            }
          >
            {options.map((opt) => (
              <FormControlLabel
                key={opt.id}
                value={opt.id}
                control={<Radio disabled={disabled} />}
                label={opt.text}
              />
            ))}
          </RadioGroup>
        );
      }

      case "multi_select": {
        const selected = resolveSelectedOptionIds(answer, options);
        return (
          <Stack>
            {options.map((opt) => (
              <FormControlLabel
                key={opt.id}
                control={
                  <Checkbox
                    checked={selected.includes(opt.id)}
                    disabled={disabled}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, opt.id]
                        : selected.filter((value) => value !== opt.id);
                      onChange(qId, { type: "multi", value: next });
                    }}
                  />
                }
                label={opt.text}
              />
            ))}
          </Stack>
        );
      }

      case "true_false": {
        const selected = resolveBooleanSelection(answer);
        return (
          <RadioGroup
            value={selected}
            onChange={(e) =>
              onChange(qId, {
                type: "boolean",
                value: e.target.value === "true",
              })
            }
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
      }

      case "numeric":
        return (
          <TextField
            label="Numeric answer"
            type="number"
            value={resolveTextAnswer(answer)}
            onChange={(event) =>
              onChange(qId, { type: "numeric", value: event.target.value })
            }
            disabled={disabled}
            fullWidth
            size="small"
          />
        );

      case "fill_in_blank":
        return (
          <TextField
            label="Fill in the blank"
            value={resolveBlankAnswer(answer)}
            onChange={(event) =>
              onChange(qId, { type: "blanks", value: [event.target.value] })
            }
            disabled={disabled}
            fullWidth
            size="small"
          />
        );

      case "short_answer":
        return (
          <TextField
            label="Your answer"
            value={resolveTextAnswer(answer)}
            onChange={(event) =>
              onChange(qId, { type: "text", value: event.target.value })
            }
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
            value={resolveTextAnswer(answer)}
            onChange={(event) =>
              onChange(qId, { type: "text", value: event.target.value })
            }
            disabled={disabled}
            fullWidth
            multiline
            minRows={6}
          />
        );

      case "matching": {
        const { left, right } = parseMatchPairs(question.options);
        const pairs = resolvePairMap(answer);
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
                    const normalizedPairs = left
                      .map((item) => ({
                        left: item,
                        right: next[item] ?? "",
                      }))
                      .filter((pair) => pair.right.trim().length > 0);
                    onChange(qId, { type: "pairs", value: normalizedPairs });
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
        const ordered = resolveOrdering(answer, items);
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
                    onChange(qId, { type: "order", value: next });
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
            value={resolveTextAnswer(answer)}
            onChange={(event) =>
              onChange(qId, { type: "text", value: event.target.value })
            }
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
