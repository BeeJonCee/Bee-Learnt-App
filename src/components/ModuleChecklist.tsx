"use client";

import ChecklistIcon from "@mui/icons-material/Checklist";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type ChecklistItem = {
  id: number;
  title: string;
  order: number;
  required: boolean;
  completed: boolean;
};

type ModuleChecklistProps = {
  moduleId: number;
};

export default function ModuleChecklist({ moduleId }: ModuleChecklistProps) {
  const { data, loading, error, setData } = useApi<ChecklistItem[]>(
    moduleId ? `/api/checklists?moduleId=${moduleId}` : null,
  );

  const items = useMemo(() => data ?? [], [data]);

  const handleToggle = async (item: ChecklistItem) => {
    const nextCompleted = !item.completed;
    setData((prev) =>
      (prev ?? []).map((entry) =>
        entry.id === item.id ? { ...entry, completed: nextCompleted } : entry,
      ),
    );

    try {
      await apiFetch("/api/checklists", {
        method: "POST",
        body: JSON.stringify({ itemId: item.id, completed: nextCompleted }),
      });
    } catch {
      setData((prev) =>
        (prev ?? []).map((entry) =>
          entry.id === item.id
            ? { ...entry, completed: item.completed }
            : entry,
        ),
      );
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ChecklistIcon color="primary" />
            <Typography variant="h6">Practical checklist</Typography>
          </Stack>

          {loading && !data && (
            <Typography variant="body2" color="text.secondary">
              Loading checklist...
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {items.length === 0 && !loading ? (
            <Typography variant="body2" color="text.secondary">
              No checklist items yet.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {items.map((item) => (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  key={item.id}
                >
                  <Checkbox
                    checked={item.completed}
                    onChange={() => handleToggle(item)}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: item.completed ? "line-through" : "none",
                    }}
                  >
                    {item.title}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
