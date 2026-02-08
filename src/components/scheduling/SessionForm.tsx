"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useMemo } from "react";
import { z } from "zod";
import FormModal, { FormField } from "@/components/ui/FormModal";

export const sessionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
  scheduledStart: z.string().min(1, "Start time is required"),
  scheduledEnd: z.string().min(1, "End time is required"),
  subjectId: z.string().optional(),
  moduleId: z.string().optional(),
  meetingLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  location: z.string().optional(),
});

export type SessionFormData = z.infer<typeof sessionSchema>;

interface Student {
  id: string;
  name: string;
  email?: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Module {
  id: number;
  title: string;
  subjectId: number;
  grade: number;
}

interface TutoringSession {
  id: number;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  studentId: string;
  studentName?: string;
  subjectId?: number;
  subjectName?: string;
  moduleId?: number;
  moduleTitle?: string;
  meetingLink?: string;
  location?: string;
}

interface SessionFormProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update" | "delete" | "view";
  session?: TutoringSession;
  students: Student[];
  subjects: Subject[];
  modules: Module[];
  defaultDate?: Date;
  onSubmit: (data: SessionFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function SessionForm({
  open,
  onClose,
  mode,
  session,
  students,
  subjects,
  modules,
  defaultDate,
  onSubmit,
  onDelete,
}: SessionFormProps) {
  const defaultStartTime = useMemo(() => {
    if (session?.scheduledStart) {
      return new Date(session.scheduledStart).toISOString().slice(0, 16);
    }
    if (defaultDate) {
      const date = new Date(defaultDate);
      date.setHours(9, 0, 0, 0);
      return date.toISOString().slice(0, 16);
    }
    return "";
  }, [session, defaultDate]);

  const defaultEndTime = useMemo(() => {
    if (session?.scheduledEnd) {
      return new Date(session.scheduledEnd).toISOString().slice(0, 16);
    }
    if (defaultDate) {
      const date = new Date(defaultDate);
      date.setHours(10, 0, 0, 0);
      return date.toISOString().slice(0, 16);
    }
    return "";
  }, [session, defaultDate]);

  const filteredModules = useMemo(() => {
    if (!session?.subjectId) return modules;
    return modules.filter((m) => m.subjectId === session.subjectId);
  }, [modules, session?.subjectId]);

  const formData = useMemo(() => {
    if (!session) return undefined;
    return {
      title: session.title,
      description: session.description,
      studentId: session.studentId,
      scheduledStart: new Date(session.scheduledStart)
        .toISOString()
        .slice(0, 16),
      scheduledEnd: new Date(session.scheduledEnd).toISOString().slice(0, 16),
      subjectId: session.subjectId?.toString(),
      moduleId: session.moduleId?.toString(),
      meetingLink: session.meetingLink,
      location: session.location,
    };
  }, [session]);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      mode={mode}
      entityName="Session"
      data={formData}
      schema={sessionSchema}
      onSubmit={onSubmit}
      onDelete={onDelete}
      maxWidth="sm"
    >
      <Stack spacing={2.5}>
        {/* Title */}
        <FormField label="Session Title" name="title" required>
          <TextField
            id="title"
            name="title"
            fullWidth
            size="small"
            defaultValue={session?.title ?? ""}
            placeholder="e.g., Math Revision - Algebra"
            disabled={mode === "view"}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description" name="description">
          <TextField
            id="description"
            name="description"
            fullWidth
            size="small"
            multiline
            rows={2}
            defaultValue={session?.description ?? ""}
            placeholder="What will you cover in this session?"
            disabled={mode === "view"}
          />
        </FormField>

        {/* Student */}
        <FormField label="Student" name="studentId" required>
          <Autocomplete
            options={students}
            getOptionLabel={(option) => option.name}
            defaultValue={students.find((s) => s.id === session?.studentId)}
            disabled={mode === "view"}
            renderInput={(params) => (
              <TextField
                {...params}
                name="studentId"
                size="small"
                placeholder="Select a student"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack>
                  <span>{option.name}</span>
                  {option.email && (
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {option.email}
                    </span>
                  )}
                </Stack>
              </Box>
            )}
          />
        </FormField>

        {/* Date/Time */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormField label="Start Time" name="scheduledStart" required>
            <TextField
              id="scheduledStart"
              name="scheduledStart"
              type="datetime-local"
              fullWidth
              size="small"
              defaultValue={defaultStartTime}
              disabled={mode === "view"}
              InputLabelProps={{ shrink: true }}
            />
          </FormField>
          <FormField label="End Time" name="scheduledEnd" required>
            <TextField
              id="scheduledEnd"
              name="scheduledEnd"
              type="datetime-local"
              fullWidth
              size="small"
              defaultValue={defaultEndTime}
              disabled={mode === "view"}
              InputLabelProps={{ shrink: true }}
            />
          </FormField>
        </Stack>

        {/* Subject & Module */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Subject (Optional)</InputLabel>
            <Select
              name="subjectId"
              label="Subject (Optional)"
              defaultValue={session?.subjectId ?? ""}
              disabled={mode === "view"}
            >
              <MenuItem value="">None</MenuItem>
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Module (Optional)</InputLabel>
            <Select
              name="moduleId"
              label="Module (Optional)"
              defaultValue={session?.moduleId ?? ""}
              disabled={mode === "view"}
            >
              <MenuItem value="">None</MenuItem>
              {filteredModules.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.title} (Grade {module.grade})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Meeting Link */}
        <FormField label="Meeting Link" name="meetingLink">
          <TextField
            id="meetingLink"
            name="meetingLink"
            fullWidth
            size="small"
            defaultValue={session?.meetingLink ?? ""}
            placeholder="https://meet.google.com/..."
            disabled={mode === "view"}
          />
        </FormField>

        {/* Location */}
        <FormField label="Location" name="location">
          <TextField
            id="location"
            name="location"
            fullWidth
            size="small"
            defaultValue={session?.location ?? ""}
            placeholder="e.g., Library Room 3, Online"
            disabled={mode === "view"}
          />
        </FormField>
      </Stack>
    </FormModal>
  );
}
