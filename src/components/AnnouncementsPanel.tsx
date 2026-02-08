"use client";

import CampaignIcon from "@mui/icons-material/Campaign";
import PushPinIcon from "@mui/icons-material/PushPin";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useApi } from "@/hooks/useApi";

type Announcement = {
  id: number;
  title: string;
  body: string;
  audience: "ALL" | "STUDENT" | "PARENT" | "ADMIN" | "TUTOR";
  pinned: boolean;
  publishedAt: string;
};

const audienceLabel: Record<string, string> = {
  ALL: "Everyone",
  STUDENT: "Students",
  PARENT: "Parents",
  ADMIN: "Admin",
  TUTOR: "Tutors",
};

// Color palette for announcements - creates a colorful, alternating pattern
const ANNOUNCEMENT_COLORS = [
  { bg: "#5BC0EB", light: alpha("#5BC0EB", 0.08) }, // Sky Blue
  { bg: "#9333EA", light: alpha("#9333EA", 0.08) }, // Purple
  { bg: "#FFD600", light: alpha("#FFD600", 0.08) }, // Yellow
  { bg: "#22C55E", light: alpha("#22C55E", 0.08) }, // Green
  { bg: "#F97316", light: alpha("#F97316", 0.08) }, // Orange
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getRelativeTime = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(value);
};

export default function AnnouncementsPanel() {
  const { data, loading, error } = useApi<Announcement[]>(
    "/api/announcements?limit=4",
  );
  const announcements = data ?? [];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CampaignIcon color="primary" />
              <Typography variant="h6">Announcements</Typography>
            </Stack>
            <Button size="small" sx={{ color: "text.secondary" }}>
              View All
            </Button>
          </Stack>

          {loading ? (
            <Typography color="text.secondary">
              Loading announcements...
            </Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : announcements.length === 0 ? (
            <Typography color="text.secondary">
              No announcements yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {announcements.map((announcement, index) => {
                const colorSet =
                  ANNOUNCEMENT_COLORS[index % ANNOUNCEMENT_COLORS.length];
                return (
                  <Box
                    key={announcement.id}
                    sx={{
                      borderRadius: 2,
                      bgcolor: colorSet.light,
                      p: 2,
                      borderLeft: `4px solid ${colorSet.bg}`,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateX(4px)",
                        boxShadow: `0 4px 12px ${alpha(colorSet.bg, 0.15)}`,
                      },
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        justifyContent="space-between"
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          {announcement.title}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          {announcement.pinned && (
                            <PushPinIcon
                              sx={{
                                fontSize: 16,
                                color: "#F97316",
                                transform: "rotate(45deg)",
                              }}
                            />
                          )}
                          <Chip
                            label={getRelativeTime(announcement.publishedAt)}
                            size="small"
                            sx={{
                              bgcolor: "background.paper",
                              fontSize: 10,
                              height: 20,
                            }}
                          />
                        </Stack>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: 13,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {announcement.body}
                      </Typography>
                      <Chip
                        label={audienceLabel[announcement.audience]}
                        size="small"
                        sx={{
                          width: "fit-content",
                          bgcolor: alpha(colorSet.bg, 0.15),
                          color: colorSet.bg,
                          fontWeight: 600,
                          fontSize: 10,
                        }}
                      />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
