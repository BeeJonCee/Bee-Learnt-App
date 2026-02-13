"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";

const roleOptions = [
  { value: "STUDENT", label: "Student" },
  { value: "PARENT", label: "Parent" },
];

function maskEmail(email: string) {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  if (local.length <= 2) return `***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    console.info("[auth-ui] register:submit", {
      email: maskEmail(form.email),
      role: form.role,
    });

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role as "STUDENT" | "PARENT",
      });

      if (result.autoLoggedIn) {
        console.info("[auth-ui] register:auto-login:success", {
          email: maskEmail(form.email),
          role: form.role,
        });
        const targetPath =
          form.role === "STUDENT" ? "/onboarding" : getDashboardPath(form.role);
        router.replace(targetPath);
      } else {
        console.warn("[auth-ui] register:auto-login:skipped", {
          email: maskEmail(form.email),
          role: form.role,
          reason: "No active session after signup",
        });
        setSuccess(
          "Account created! Check your email for a verification link, then sign in.",
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed.";
      console.error(
        `[auth-ui] register:submit:error email=${maskEmail(form.email)} role=${form.role} message=${message}`,
      );
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid
      container
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Grid item xs={12} md={8} lg={5} xl={4} px={{ xs: 2, sm: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Create your account</Typography>
              <Typography color="text.secondary">
                Join BeeLearnt to access CAPS-aligned tutoring.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Full name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  required
                />
                <TextField
                  select
                  label="Role"
                  value={form.role}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, role: event.target.value }))
                  }
                  required
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Creating..." : "Create account"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Already have an account? <a href="/login">Sign in</a>
            </Typography>

            <SocialLoginButtons
              disabled={loading}
              dividerText="or sign up with"
            />
            <Typography variant="caption" color="text.secondary">
              Social sign-up creates a Student account by default.
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
