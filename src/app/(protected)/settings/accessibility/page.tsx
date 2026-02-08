"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { apiFetch } from "@/lib/utils/api";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "af", label: "Afrikaans" },
  { value: "zu", label: "isiZulu" },
  { value: "xh", label: "isiXhosa" },
];

type AccessibilityPrefs = {
  textScale: number;
  enableNarration: boolean;
  highContrast: boolean;
  language: string;
  translationEnabled: boolean;
};

export default function AccessibilitySettingsPage() {
  const { data, loading } = useApi<AccessibilityPrefs>("/api/accessibility");
  const [form, setForm] = useState<AccessibilityPrefs>({
    textScale: 100,
    enableNarration: false,
    highContrast: false,
    language: "en",
    translationEnabled: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch("/api/accessibility", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setMessage("Accessibility settings saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Stack spacing={1}>
        <Typography variant="h3">Accessibility</Typography>
        <Typography color="text.secondary">
          Customize your learning experience with narration, text scaling, and
          language options.
        </Typography>
      </Stack>

      {message && (
        <Alert severity={message.includes("saved") ? "success" : "error"}>
          {message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Text size
              </Typography>
              <Slider
                value={form.textScale}
                min={80}
                max={140}
                step={5}
                valueLabelDisplay="auto"
                onChange={(_, value) =>
                  setForm((prev) => ({
                    ...prev,
                    textScale: Array.isArray(value) ? value[0] : value,
                  }))
                }
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.enableNarration}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      enableNarration: event.target.checked,
                    }))
                  }
                />
              }
              label="Enable voice narration"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.highContrast}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      highContrast: event.target.checked,
                    }))
                  }
                />
              }
              label="High contrast mode"
            />

            <TextField
              select
              label="Preferred language"
              value={form.language}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  language: event.target.value,
                }))
              }
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={form.translationEnabled}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      translationEnabled: event.target.checked,
                    }))
                  }
                />
              }
              label="Auto-translate lesson content"
            />

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
