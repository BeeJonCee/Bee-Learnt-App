"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export default function AccountPage() {
  const { user, token, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h3">Account</Typography>
        <Typography color="text.secondary">
          Your BeeLearnt profile is authenticated by the backend (JWT).
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Name
              </Typography>
              <Typography>{user.name ?? "—"}</Typography>
            </Stack>

            <Divider />

            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Email
              </Typography>
              <Typography>{user.email ?? "—"}</Typography>
            </Stack>

            <Divider />

            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Role
              </Typography>
              <Typography>{user.role}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!token && (
        <Alert severity="warning">
          No active session token found. If you just verified your email, sign
          in again.
        </Alert>
      )}

      <Box display="flex" gap={2} flexWrap="wrap">
        <Button
          component={Link}
          href="/settings/accessibility"
          variant="outlined"
        >
          Accessibility settings
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
        >
          Logout
        </Button>
      </Box>
    </Stack>
  );
}
