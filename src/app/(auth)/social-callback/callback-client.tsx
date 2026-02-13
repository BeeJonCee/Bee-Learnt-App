"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import type { AuthUser } from "@/lib/auth/storage";
import { setStoredAuth } from "@/lib/auth/storage";
import { getDashboardPath } from "@/lib/navigation";

export default function CallbackClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const exchangeToken = async () => {
      try {
        // Finalize OAuth callback and resolve the active session token.
        const sessionResponse = await authClient.getSession();
        const sessionToken = sessionResponse.data?.session?.token;

        if (!sessionToken) {
          throw new Error("No active authentication session found.");
        }

        // Bridge Better Auth session token -> backend JWT.
        const response = await fetch("/api/auth/bridge-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionToken }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            payload?.message || `Token exchange failed: ${response.status}`,
          );
        }

        const data: { token: string; user: AuthUser } = await response.json();

        setStoredAuth({ token: data.token, user: data.user });

        const dashboardPath = getDashboardPath(data.user.role);
        router.replace(dashboardPath);
      } catch (err) {
        console.error("[auth-callback] Token exchange failed:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to complete sign-in. Please try again.",
        );
      }
    };

    void exchangeToken();
  }, [router]);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 440, width: "100%" }}>
          <Stack spacing={2}>
            <Typography variant="h5">Sign in failed</Typography>
            <Alert severity="error">{error}</Alert>
            <Typography variant="body2" color="text.secondary">
              <a href="/login">Back to sign in</a>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress color="primary" />
      <Typography color="text.secondary">Completing sign-in...</Typography>
    </Box>
  );
}
