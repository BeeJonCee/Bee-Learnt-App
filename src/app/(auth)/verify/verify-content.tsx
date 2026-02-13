"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/**
 * Email verification is handled by Better Auth.
 * This page simply informs the user and links back to login.
 */
export default function VerifyPageContent() {
  const searchParams = useSearchParams();
  const email = useMemo(
    () => searchParams.get("email") ?? "",
    [searchParams],
  );
  const nextPath = useMemo(
    () => searchParams.get("next") ?? "/dashboard",
    [searchParams],
  );

  return (
    <Grid
      container
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Grid item xs={12} md={7} lg={5} xl={4} px={{ xs: 2, sm: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Check your email</Typography>
              <Typography color="text.secondary">
                {email
                  ? `We sent a verification link to ${email}.`
                  : "We sent a verification link to your email."}
              </Typography>
            </Box>

            <Alert severity="info">
              Click the link in the email to verify your account, then come back
              here to sign in.
            </Alert>

            <Button
              variant="contained"
              href={`/login${email ? `?email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextPath)}` : ""}`}
            >
              Go to sign in
            </Button>

            <Typography variant="body2" color="text.secondary">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <a href="/register">try registering again</a>.
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
