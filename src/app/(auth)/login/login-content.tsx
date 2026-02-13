"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";

function maskEmail(email: string) {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  if (local.length <= 2) return `***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();
  const nextPath = useMemo(
    () => searchParams.get("next") ?? "/dashboard",
    [searchParams],
  );
  const initialEmail = useMemo(
    () => searchParams.get("email") ?? "",
    [searchParams],
  );
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail && email !== initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  // Redirect logged-in users to their role-specific dashboard
  useEffect(() => {
    if (user) {
      const targetPath =
        nextPath === "/dashboard" ? getDashboardPath(user.role) : nextPath;
      router.replace(targetPath);
    }
  }, [user, router, nextPath]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    console.info("[auth-ui] login:submit", {
      email: maskEmail(email),
      nextPath,
    });

    try {
      await login(email, password);
      console.info("[auth-ui] login:submit:success", {
        email: maskEmail(email),
      });
      // User will be redirected by the useEffect hook above
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password.";
      console.error("[auth-ui] login:submit:error", {
        email: maskEmail(email),
        message,
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container minHeight="100vh">
      <Grid
        item
        lg={6}
        sx={{
          display: { xs: "none", lg: "flex" },
          background:
            "linear-gradient(135deg, rgba(255, 214, 0, 0.15), rgba(15, 15, 15, 0.2))",
          alignItems: "center",
          justifyContent: "center",
          px: 6,
        }}
      >
        <Stack spacing={3} maxWidth={420}>
          <Typography variant="h2" sx={{ color: "text.primary" }}>
            Welcome back to BeeLearnt
          </Typography>
          <Typography color="text.secondary">
            Sign in to continue your CAPS-aligned learning journey and track
            your progress.
          </Typography>
        </Stack>
      </Grid>

      <Grid
        item
        xs={12}
        lg={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4 },
        }}
      >
        <Paper sx={{ p: 4, width: "100%", maxWidth: 440 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Sign in</Typography>
              <Typography color="text.secondary">
                Use your BeeLearnt account to continue.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Need an account? <a href="/register">Create one</a>
            </Typography>

            <SocialLoginButtons disabled={loading} />
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
