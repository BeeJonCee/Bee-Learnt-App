"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { getDashboardPath } from "@/lib/navigation";
import { apiFetch } from "@/lib/utils/api";
import { useAuth } from "@/providers/AuthProvider";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "PARENT" | "ADMIN";
};

type AdminModule = {
  id: number;
  title: string;
  grade: number;
  order: number;
  subjectId: number;
  subjectName: string;
};

type UserModulesResponse = {
  userId: string;
  modules: {
    moduleId: number;
    title: string;
    grade: number;
    order: number;
    subjectName: string;
    status: "pending" | "unlocked";
  }[];
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: students } = useApi<AdminUser[]>(
    "/api/admin/users?role=STUDENT",
  );
  const { data: modules } = useApi<AdminModule[]>("/api/admin/modules");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { data: userModules } = useApi<UserModulesResponse>(
    selectedUserId ? `/api/admin/users/${selectedUserId}/modules` : null,
  );
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);

  useEffect(() => {
    if (!userModules) return;
    const unlocked = userModules.modules
      .filter((module) => module.status === "unlocked")
      .map((module) => module.moduleId);
    setSelectedModuleIds(unlocked);
  }, [userModules]);

  const groupedModules = useMemo(() => {
    const list = modules ?? [];
    const groups = new Map<
      number,
      { subjectName: string; items: AdminModule[] }
    >();
    for (const module of list) {
      const entry = groups.get(module.subjectId) ?? {
        subjectName: module.subjectName,
        items: [],
      };
      entry.items.push(module);
      groups.set(module.subjectId, entry);
    }
    return Array.from(groups.entries()).map(([subjectId, value]) => ({
      subjectId,
      subjectName: value.subjectName,
      modules: value.items,
    }));
  }, [modules]);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const selectedUser = (students ?? []).find(
    (student) => student.id === selectedUserId,
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h3">User management</Typography>
        <Typography color="text.secondary">
          Assign modules to learners so they can access subjects, assignments,
          search, collaboration, and AI tutor experiences.
        </Typography>
      </Stack>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <InputLabel id="student-select-label">Select student</InputLabel>
              <Select
                labelId="student-select-label"
                label="Select student"
                value={selectedUserId}
                onChange={(event) => {
                  setSelectedUserId(event.target.value as string);
                  setNotice(null);
                  setError(null);
                }}
              >
                {(students ?? []).map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            {!selectedUser ? (
              <Typography color="text.secondary">
                Choose a student to view and assign modules.
              </Typography>
            ) : (
              <Stack spacing={2}>
                <Typography variant="h6">
                  Assign modules for {selectedUser.name}
                </Typography>
                {groupedModules.map((group) => (
                  <Card key={group.subjectId} variant="outlined">
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle1">
                          {group.subjectName}
                        </Typography>
                        <Stack spacing={1}>
                          {group.modules.map((module) => {
                            const checked = selectedModuleIds.includes(
                              module.id,
                            );
                            return (
                              <Stack
                                key={module.id}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={2}
                              >
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1.5}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onChange={() => {
                                      setSelectedModuleIds((prev) =>
                                        prev.includes(module.id)
                                          ? prev.filter(
                                              (id) => id !== module.id,
                                            )
                                          : [...prev, module.id],
                                      );
                                    }}
                                  />
                                  <Typography>
                                    {module.title} (Grade {module.grade})
                                  </Typography>
                                </Box>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="contained"
                  disabled={saving}
                  onClick={async () => {
                    if (!selectedUserId) return;
                    setSaving(true);
                    setNotice(null);
                    setError(null);
                    try {
                      await apiFetch(
                        `/api/admin/users/${selectedUserId}/modules`,
                        {
                          method: "POST",
                          body: JSON.stringify({
                            moduleIds: selectedModuleIds,
                          }),
                        },
                      );
                      setNotice("Module assignments saved.");
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Unable to save assignments.",
                      );
                    } finally {
                      setSaving(false);
                    }
                  }}
                  sx={{ width: "fit-content" }}
                >
                  {saving ? "Saving..." : "Save assignments"}
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Button
        component={Link}
        href="/admin"
        variant="outlined"
        sx={{ width: "fit-content" }}
      >
        Back to admin panel
      </Button>
    </Stack>
  );
}
