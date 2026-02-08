"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type Room = {
  id: number;
  title: string;
  type: "classroom" | "project" | "discussion" | "breakout";
  description: string | null;
};

export default function CollaborationPage() {
  const { data: rooms, refetch } = useApi<Room[]>("/api/collaboration/rooms");
  const [form, setForm] = useState<{
    title: string;
    type: "classroom" | "project" | "discussion" | "breakout";
    description: string;
  }>({
    title: "",
    type: "project",
    description: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch("/api/collaboration/rooms", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ title: "", type: "project", description: "" });
      await refetch();
      setMessage("Room created.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create room.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 900 }}>
      <Stack spacing={1}>
        <Typography variant="h3">Collaboration hub</Typography>
        <Typography color="text.secondary">
          Create group projects, discussions, or virtual classrooms with
          breakout rooms.
        </Typography>
      </Stack>

      {message && (
        <Alert severity={message.includes("created") ? "success" : "error"}>
          {message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Start a new room</Typography>
            <TextField
              label="Room title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <TextField
              select
              label="Room type"
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  type: event.target.value as
                    | "project"
                    | "classroom"
                    | "discussion"
                    | "breakout",
                }))
              }
            >
              <MenuItem value="project">Group project</MenuItem>
              <MenuItem value="discussion">Peer discussion</MenuItem>
              <MenuItem value="classroom">Virtual classroom</MenuItem>
              <MenuItem value="breakout">Breakout room</MenuItem>
            </TextField>
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? "Creating..." : "Create room"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Typography variant="h6">Your rooms</Typography>
        {(rooms ?? []).length === 0 ? (
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                No rooms yet. Create one to start collaborating.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {(rooms ?? []).map((room) => (
              <Card key={room.id}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {room.title}
                      </Typography>
                      <Chip label={room.type} size="small" />
                    </Stack>
                    <Typography color="text.secondary">
                      {room.description || "No description yet."}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
