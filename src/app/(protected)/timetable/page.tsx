"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

type TimetableEntry = {
  id: number;
  userId: string;
  subjectId: number | null;
  subjectName?: string;
  title: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string | null;
  color: string | null;
  isRecurring: boolean;
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const dayLabels: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const defaultColors = [
  "#5BC0EB",
  "#F6C945",
  "#9B59B6",
  "#E74C3C",
  "#2ECC71",
  "#3498DB",
  "#E67E22",
];

export default function TimetablePage() {
  const {
    data: entries,
    loading,
    error,
    refetch,
  } = useApi<TimetableEntry[]>("/api/timetable");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    dayOfWeek: "monday" as string,
    startTime: "08:00",
    endTime: "09:00",
    location: "",
    color: defaultColors[0],
  });

  const entriesByDay = useMemo(() => {
    const map: Record<string, TimetableEntry[]> = {};
    for (const day of DAYS) map[day] = [];
    for (const entry of entries ?? []) {
      if (map[entry.dayOfWeek]) {
        map[entry.dayOfWeek].push(entry);
      }
    }
    // Sort each day by startTime
    for (const day of DAYS) {
      map[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [entries]);

  const handleCreate = async () => {
    setActionError(null);
    setSaving(true);
    try {
      await apiFetch("/api/timetable", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          location: form.location.trim() || undefined,
          color: form.color || undefined,
        }),
      });
      setDialogOpen(false);
      setForm({
        title: "",
        dayOfWeek: "monday",
        startTime: "08:00",
        endTime: "09:00",
        location: "",
        color: defaultColors[0],
      });
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create entry.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/api/timetable/${id}`, { method: "DELETE" });
      refetch();
    } catch {
      // silent
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h3">Timetable</Typography>
        <Typography color="text.secondary">
          Manage your weekly study and class schedule.
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add entry
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {actionError && <Alert severity="error">{actionError}</Alert>}

      {loading ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Loading timetable...</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {DAYS.map((day) => (
            <Grid item xs={12} sm={6} md key={day}>
              <Card sx={{ minHeight: 200 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    {dayLabels[day]}
                  </Typography>
                  {entriesByDay[day].length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      No entries
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {entriesByDay[day].map((entry) => (
                        <Box
                          key={entry.id}
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: entry.color
                              ? `${entry.color}22`
                              : "action.hover",
                            borderLeft: `3px solid ${entry.color ?? "#5BC0EB"}`,
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {entry.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {entry.startTime} – {entry.endTime}
                              </Typography>
                              {entry.location && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  {entry.location}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              size="small"
                              icon={<DeleteIcon fontSize="small" />}
                              label=""
                              variant="outlined"
                              onClick={() => handleDelete(entry.id)}
                              sx={{
                                minWidth: 0,
                                "& .MuiChip-label": { px: 0 },
                              }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add timetable entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              fullWidth
              required
              size="small"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Day</InputLabel>
              <Select
                value={form.dayOfWeek}
                label="Day"
                onChange={(e) =>
                  setForm((f) => ({ ...f, dayOfWeek: e.target.value }))
                }
              >
                {DAYS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Start"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End"
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <TextField
              label="Location"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              fullWidth
              size="small"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={form.color}
                label="Color"
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
              >
                {defaultColors.map((c) => (
                  <MenuItem key={c} value={c}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          bgcolor: c,
                        }}
                      />
                      <Typography variant="body2">{c}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !form.title.trim()}
          >
            {saving ? "Saving..." : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
