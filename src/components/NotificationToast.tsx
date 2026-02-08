"use client";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useBadgeAwards } from "@/hooks/useSocket";

interface NotificationToastProps {
  autoHideDuration?: number;
}

export default function NotificationToast({
  autoHideDuration = 6000,
}: NotificationToastProps) {
  const { lastBadge, clearLastBadge } = useBadgeAwards();

  const handleClose = () => {
    clearLastBadge();
  };

  if (!lastBadge) {
    return null;
  }

  return (
    <Snackbar
      open={!!lastBadge}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={handleClose}
        severity="success"
        variant="filled"
        icon={<EmojiEventsIcon sx={{ color: "#ffd600" }} />}
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.9)",
          color: "white",
          border: "1px solid",
          borderColor: "#ffd600",
          "& .MuiAlert-icon": {
            alignItems: "center",
          },
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Badge Earned!
          </Typography>
          <Typography variant="body2">
            You earned the <strong>{lastBadge.badgeName}</strong> badge
          </Typography>
          {lastBadge.description && (
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, display: "block", mt: 0.5 }}
            >
              {lastBadge.description}
            </Typography>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
}
