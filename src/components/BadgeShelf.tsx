"use client";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useApi } from "@/hooks/useApi";

type Badge = {
  id: number;
  name: string;
  description?: string | null;
  earned: boolean;
};

type BadgeResponse = {
  badges: Badge[];
};

export default function BadgeShelf() {
  const { data, loading, error } = useApi<BadgeResponse>("/api/badges");
  const badges = data?.badges ?? [];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EmojiEventsIcon color="primary" />
            <Typography variant="h6">Badges</Typography>
          </Stack>

          {loading && !data && (
            <Typography variant="body2" color="text.secondary">
              Loading badges...
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {badges.length === 0 && !loading ? (
            <Typography variant="body2" color="text.secondary">
              No badges yet. Complete tasks to earn rewards.
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {badges.map((badge) => (
                <Chip
                  key={badge.id}
                  icon={<EmojiEventsIcon />}
                  label={badge.name}
                  color={badge.earned ? "primary" : "default"}
                  variant={badge.earned ? "filled" : "outlined"}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
