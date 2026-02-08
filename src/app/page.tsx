"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import InsightsIcon from "@mui/icons-material/Insights";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { getDashboardPath } from "@/lib/navigation";
import { apiFetch } from "@/lib/utils/api";
import { useAuth } from "@/providers/AuthProvider";
import { useColorMode } from "@/providers/ThemeModeProvider";

type Highlight = {
  title: string;
  description: string;
  icon: typeof AutoAwesomeIcon;
};

const highlights: Highlight[] = [
  {
    title: "Multi-subject curriculum",
    description:
      "CAPS-aligned modules across multiple subjects and grade levels.",
    icon: MenuBookIcon,
  },
  {
    title: "Progress intelligence",
    description:
      "Track learner momentum, mastery, and focus areas across all subjects.",
    icon: InsightsIcon,
  },
  {
    title: "Adaptive learning paths",
    description:
      "Personalized guidance with AI support and parent-ready insights.",
    icon: SchoolIcon,
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode, toggleMode } = useColorMode();
  const lastUserId = useRef<string | number | null>(null);

  const isStudent = user?.role === "STUDENT";

  useEffect(() => {
    if (loading || !user) return;
    if (lastUserId.current === user.id) return;
    lastUserId.current = user.id;
    if (!isStudent) {
      router.replace(getDashboardPath(user.role));
      return;
    }

    apiFetch<{ moduleId: number }[]>("/api/user-modules")
      .then((modules) => {
        if (!modules || modules.length === 0) {
          router.replace("/onboarding");
        } else {
          router.replace(getDashboardPath(user.role));
        }
      })
      .catch(() => {
        router.replace(getDashboardPath(user.role));
      });
  }, [loading, user, isStudent, router]);

  const highlightsWithIcons = useMemo(
    () =>
      highlights.map((item) => ({
        ...item,
        Icon: item.icon,
      })),
    [],
  );

  if (loading || user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 6, md: 10 },
        background:
          "radial-gradient(800px circle at 15% 20%, rgba(255, 214, 0, 0.18), transparent 55%), radial-gradient(700px circle at 80% 10%, rgba(91, 192, 235, 0.18), transparent 60%)",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={8}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "#121212",
                  fontWeight: 700,
                }}
              >
                B
              </Box>
              <Box>
                <Typography variant="h6">BeeLearnt</Typography>
                <Typography variant="caption" color="text.secondary">
                  Adaptive learning platform
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component={Link}
                href="/login"
                variant="text"
                color="inherit"
              >
                Sign in
              </Button>
              <Button component={Link} href="/register" variant="outlined">
                Create account
              </Button>
              <IconButton
                onClick={toggleMode}
                aria-label="Toggle theme"
                color="inherit"
              >
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Stack>
          </Stack>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Chip
                  label="Learning Platform"
                  color="primary"
                  sx={{ width: "fit-content" }}
                />
                <Typography variant="h2">
                  Personalized Learning at Scale
                </Typography>
                <Typography color="text.secondary" variant="h6">
                  Comprehensive platform for multiple subjects and grade levels.
                  Track progress, adapt to individual needs, and empower
                  learners with data-driven insights.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={Link}
                    href="/dashboard"
                    variant="contained"
                    size="large"
                  >
                    Learner Dashboard
                  </Button>
                  <Button
                    component={Link}
                    href="/admin"
                    variant="outlined"
                    size="large"
                  >
                    Admin Analytics
                  </Button>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="overline" color="text.secondary">
                          Active subjects
                        </Typography>
                        <Typography variant="h4">5+</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Subjects available for learners.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="overline" color="text.secondary">
                          Curriculum modules
                        </Typography>
                        <Typography variant="h4">100+</Typography>
                        <Typography color="text.secondary" variant="body2">
                          CAPS-aligned modules ready to deploy.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Stack spacing={1}>
                      <Typography variant="h5">Why BeeLearnt</Typography>
                      <Typography color="text.secondary">
                        Supporting learners across all subjects and grade levels
                        with intelligent feedback.
                      </Typography>
                    </Stack>
                    <Stack spacing={2}>
                      {highlightsWithIcons.map(
                        ({ title, description, Icon }) => (
                          <Stack key={title} direction="row" spacing={2}>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 3,
                                bgcolor: "rgba(255, 214, 0, 0.18)",
                                display: "grid",
                                placeItems: "center",
                                color: "primary.main",
                                flexShrink: 0,
                              }}
                            >
                              <Icon fontSize="small" />
                            </Box>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle1">
                                {title}
                              </Typography>
                              <Typography
                                color="text.secondary"
                                variant="body2"
                              >
                                {description}
                              </Typography>
                            </Stack>
                          </Stack>
                        ),
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Stack spacing={2} alignItems="center" textAlign="center">
            <AutoAwesomeIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="h4">
              Empower learners across all disciplines
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
              BeeLearnt combines comprehensive curriculum with adaptive AI
              support and real-time analytics, helping educators and families
              keep every learner progressing.
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
