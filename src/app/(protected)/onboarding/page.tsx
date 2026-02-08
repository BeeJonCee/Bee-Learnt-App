"use client";

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
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import HexModulePicker from "@/components/HexModulePicker";
import { useApi } from "@/hooks/useApi";
import { getDashboardPath } from "@/lib/navigation";
import { apiFetch } from "@/lib/utils/api";
import { useAuth } from "@/providers/AuthProvider";

type OnboardingModule = {
  id: number;
  title: string;
  grade: number;
  order: number;
  subjectName: string;
  selected: boolean;
  status: "pending" | "unlocked" | null;
};

type OnboardingResponse = {
  modules: OnboardingModule[];
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi<OnboardingResponse>(
    "/api/onboarding/modules",
  );
  const [pendingModule, setPendingModule] = useState<OnboardingModule | null>(
    null,
  );
  const [accessCode, setAccessCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const modules = data?.modules ?? [];
  const availableModules = useMemo(
    () =>
      modules.filter(
        (module) =>
          !module.selected &&
          (pendingModule ? module.id !== pendingModule.id : true),
      ),
    [modules, pendingModule],
  );
  const unlockedModules = useMemo(
    () => modules.filter((module) => module.status === "unlocked"),
    [modules],
  );

  const handleVerify = async () => {
    if (!pendingModule) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await apiFetch("/api/onboarding/select", {
        method: "POST",
        body: JSON.stringify({ moduleId: pendingModule.id, code: accessCode }),
      });
      await refetch();
      setPendingModule(null);
      setAccessCode("");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Invalid access code",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role && user.role !== "STUDENT") {
    router.replace(getDashboardPath(user.role));
    return null;
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h3">Personalize your dashboard</Typography>
        <Typography color="text.secondary">
          Choose the modules you want to focus on. Unlock each module with an
          access code from your teacher.
        </Typography>
        <Typography color="text.secondary">
          Access codes rotate daily to keep onboarding secure.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Pick your modules</Typography>
            {loading ? (
              <Typography color="text.secondary">Loading modules...</Typography>
            ) : (
              <HexModulePicker
                modules={availableModules.map((module) => ({
                  id: module.id,
                  title: module.title,
                  grade: module.grade,
                  subjectName: module.subjectName,
                }))}
                onPick={(module) => {
                  const fullModule =
                    modules.find((item) => item.id === module.id) ?? null;
                  setPendingModule(fullModule);
                  setAccessCode("");
                  setSubmitError(null);
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Unlocked modules</Typography>
            {unlockedModules.length === 0 ? (
              <Typography color="text.secondary">
                Unlock at least one module to populate your dashboard.
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {unlockedModules.map((module) => (
                  <Chip
                    key={module.id}
                    label={`${module.title} (Grade ${module.grade})`}
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Button
          variant="contained"
          size="large"
          disabled={unlockedModules.length === 0}
          onClick={() => router.push("/dashboard/student")}
        >
          Finish onboarding
        </Button>
      </Box>

      <Dialog
        open={Boolean(pendingModule)}
        onClose={() => setPendingModule(null)}
      >
        <DialogTitle>Enter access code</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="subtitle1">
              {pendingModule?.title} (Grade {pendingModule?.grade})
            </Typography>
            <TextField
              label="Access code"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              helperText={
                pendingModule
                  ? `Daily code format: BEE-${pendingModule.grade}-${pendingModule.order}-XXXXXX`
                  : undefined
              }
              autoFocus
            />
            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingModule(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={submitting}
          >
            {submitting ? "Unlocking..." : "Unlock module"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
