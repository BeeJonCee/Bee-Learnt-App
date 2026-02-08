"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { enqueueOfflineAction } from "@/lib/offline/queue";
import { apiFetch } from "@/lib/utils/api";

type LessonNote = {
  id: number;
  content: string;
  createdAt: string;
  pending?: boolean;
};

type LessonNotesProps = {
  lessonId: number;
};

export default function LessonNotes({ lessonId }: LessonNotesProps) {
  const { data, setData } = useApi<LessonNote[]>(
    lessonId ? `/api/notes?lessonId=${lessonId}` : null,
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    setSaving(true);

    try {
      const created = await apiFetch<LessonNote>("/api/notes", {
        method: "POST",
        body: JSON.stringify({ lessonId, content: trimmed }),
      });
      setData((prev) => (prev ? [...prev, created] : [created]));
      setNote("");
    } catch {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (isOffline) {
        const pendingNote: LessonNote = {
          id: Date.now(),
          content: trimmed,
          createdAt: new Date().toISOString(),
          pending: true,
        };
        setData((prev) => (prev ? [...prev, pendingNote] : [pendingNote]));
        await enqueueOfflineAction({
          id: `note-${pendingNote.id}`,
          url: "/api/notes",
          method: "POST",
          body: JSON.stringify({ lessonId, content: trimmed }),
        });
        setNote("");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Lesson notes</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Add a note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
            <Box sx={{ minWidth: { md: 160 } }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || note.trim().length < 3}
                fullWidth
              >
                {saving ? "Saving..." : "Save note"}
              </Button>
            </Box>
          </Stack>
          {(data ?? []).length === 0 ? (
            <Typography color="text.secondary">
              Capture key formulas, definitions, or reminders for revision.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {(data ?? []).map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {item.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.pending
                      ? "Pending sync"
                      : new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
