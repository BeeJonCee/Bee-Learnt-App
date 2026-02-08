"use client";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import alpha from "@mui/material/alpha";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import type { ZodSchema } from "zod";

type FormMode = "create" | "update" | "delete" | "view";

interface FormModalProps<T> {
  open: boolean;
  onClose: () => void;
  mode: FormMode;
  title?: string;
  entityName: string;
  data?: T;
  schema?: ZodSchema;
  onSubmit: (data: T) => Promise<void>;
  onDelete?: () => Promise<void>;
  children: React.ReactNode;
  submitLabel?: string;
  loading?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  name,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={name}
        variant="body2"
        fontWeight={500}
        sx={{ mb: 0.5, display: "block" }}
      >
        {label}
        {required && (
          <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>
      {children}
      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, display: "block" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default function FormModal<T extends Record<string, unknown>>({
  open,
  onClose,
  mode,
  title,
  entityName,
  data: _data,
  schema,
  onSubmit,
  onDelete,
  children,
  submitLabel,
  loading = false,
  maxWidth = "sm",
}: FormModalProps<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const getTitle = () => {
    if (title) return title;
    switch (mode) {
      case "create":
        return `Create ${entityName}`;
      case "update":
        return `Edit ${entityName}`;
      case "delete":
        return `Delete ${entityName}`;
      case "view":
        return entityName;
      default:
        return entityName;
    }
  };

  const getSubmitLabel = () => {
    if (submitLabel) return submitLabel;
    switch (mode) {
      case "create":
        return "Create";
      case "update":
        return "Save Changes";
      case "delete":
        return "Delete";
      default:
        return "Submit";
    }
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrors({});

      const formData = new FormData(event.currentTarget);
      const formValues: Record<string, unknown> = {};

      formData.forEach((value, key) => {
        // Handle nested keys (e.g., "user.name")
        const keys = key.split(".");
        if (keys.length > 1) {
          let obj = formValues;
          for (let i = 0; i < keys.length - 1; i++) {
            obj[keys[i]] = obj[keys[i]] || {};
            obj = obj[keys[i]] as Record<string, unknown>;
          }
          obj[keys[keys.length - 1]] = value;
        } else {
          // Handle arrays (checkboxes with same name)
          if (formValues[key] !== undefined) {
            if (Array.isArray(formValues[key])) {
              (formValues[key] as unknown[]).push(value);
            } else {
              formValues[key] = [formValues[key], value];
            }
          } else {
            formValues[key] = value;
          }
        }
      });

      // Validate with Zod if schema is provided
      if (schema) {
        const result = schema.safeParse(formValues);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            if (!fieldErrors[path]) {
              fieldErrors[path] = issue.message;
            }
          });
          setErrors(fieldErrors);
          return;
        }
      }

      try {
        setSubmitting(true);
        await onSubmit(formValues as T);
        onClose();
      } catch (error) {
        console.error("Form submission error:", error);
        setErrors({
          _form:
            error instanceof Error
              ? error.message
              : "An error occurred. Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [schema, onSubmit, onClose],
  );

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    try {
      setSubmitting(true);
      await onDelete();
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      setErrors({
        _form:
          error instanceof Error
            ? error.message
            : "Failed to delete. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }, [onDelete, onClose]);

  const isReadOnly = mode === "view";
  const isDelete = mode === "delete";

  return (
    <Dialog
      open={open}
      onClose={loading || submitting ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {isDelete && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: alpha("#EF4444", 0.1),
                display: "grid",
                placeItems: "center",
              }}
            >
              <DeleteIcon sx={{ color: "error.main" }} />
            </Box>
          )}
          <Typography variant="h6" fontWeight={600}>
            {getTitle()}
          </Typography>
        </Stack>
        <IconButton
          onClick={onClose}
          disabled={loading || submitting}
          size="small"
          sx={{
            bgcolor: alpha("#fff", 0.05),
            "&:hover": { bgcolor: alpha("#fff", 0.1) },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {isDelete ? (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Typography color="text.secondary">
                Are you sure you want to delete this {entityName.toLowerCase()}?
                This action cannot be undone.
              </Typography>
              {errors._form && (
                <Typography color="error" variant="body2">
                  {errors._form}
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2.5}>
              {errors._form && (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{
                    p: 1.5,
                    bgcolor: alpha("#EF4444", 0.1),
                    borderRadius: 1,
                  }}
                >
                  {errors._form}
                </Typography>
              )}
              {children}
            </Stack>
          </DialogContent>
          {!isReadOnly && (
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={onClose} disabled={loading || submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || submitting}
                startIcon={
                  submitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {submitting ? "Saving..." : getSubmitLabel()}
              </Button>
            </DialogActions>
          )}
        </form>
      )}
    </Dialog>
  );
}

// Helper hook for form state management
export function useFormModal<T>(initialData?: T) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [data, setData] = useState<T | undefined>(initialData);

  const openCreate = useCallback(() => {
    setMode("create");
    setData(undefined);
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setMode("update");
    setData(item);
    setOpen(true);
  }, []);

  const openDelete = useCallback((item: T) => {
    setMode("delete");
    setData(item);
    setOpen(true);
  }, []);

  const openView = useCallback((item: T) => {
    setMode("view");
    setData(item);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    mode,
    data,
    openCreate,
    openEdit,
    openDelete,
    openView,
    close,
  };
}
