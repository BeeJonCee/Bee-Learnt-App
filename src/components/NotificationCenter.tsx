"use client";

import AnnouncementIcon from "@mui/icons-material/Announcement";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { type Notification, useNotifications } from "@/hooks/useSocket";
import { formatDistanceToNow } from "@/lib/utils/date";

const NOTIFICATION_ICONS: Record<string, typeof CheckCircleIcon> = {
  badge: EmojiEventsIcon,
  announcement: AnnouncementIcon,
  leaderboard: TrendingUpIcon,
  lesson: SchoolIcon,
  default: CheckCircleIcon,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  badge: "#ffd600",
  announcement: "#5bc0eb",
  leaderboard: "#8bc34a",
  lesson: "#f97316",
  default: "#9ca3af",
};

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { notifications, unreadCount, markAsRead, clearAll } =
    useNotifications();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    // Could also navigate based on notification type
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-describedby={id}
          sx={{ ml: 1 }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.65rem",
                minWidth: 16,
                height: 16,
              },
            }}
          >
            {unreadCount > 0 ? (
              <NotificationsIcon />
            ) : (
              <NotificationsNoneIcon />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: "100%",
            maxHeight: 480,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Typography
              variant="caption"
              color="primary"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={clearAll}
            >
              Clear all
            </Typography>
          )}
        </Box>

        {/* Notifications List */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
                px: 2,
              }}
            >
              <NotificationsNoneIcon
                sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((notification, index) => {
                const Icon =
                  NOTIFICATION_ICONS[notification.type] ||
                  NOTIFICATION_ICONS.default;
                const color =
                  NOTIFICATION_COLORS[notification.type] ||
                  NOTIFICATION_COLORS.default;

                return (
                  <Box key={notification.id}>
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        py: 1.5,
                        bgcolor:
                          notification.readAt === undefined
                            ? "rgba(91, 192, 235, 0.08)"
                            : "transparent",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Icon sx={{ color, fontSize: 24 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <>
                            {notification.message && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                                sx={{
                                  display: "block",
                                  fontSize: "0.8rem",
                                  mb: 0.5,
                                }}
                              >
                                {notification.message}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              component="span"
                            >
                              {formatDistanceToNow(notification.createdAt)}
                            </Typography>
                          </>
                        }
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight:
                            notification.readAt === undefined ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
