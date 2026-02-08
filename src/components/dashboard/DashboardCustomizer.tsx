"use client";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import RestoreIcon from "@mui/icons-material/Restore";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import type { WidgetSettings } from "@/hooks/useDashboardLayout";
import type { WidgetConfig } from "./WidgetRegistry";

interface DashboardCustomizerProps {
  open: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  widgetSettings: WidgetSettings;
  onToggleWidget: (widgetId: string) => void;
  onResetLayout: () => void;
}

const CATEGORY_ICONS: Record<WidgetConfig["category"], typeof SchoolIcon> = {
  stats: TrendingUpIcon,
  progress: SchoolIcon,
  engagement: PeopleIcon,
  schedule: CalendarMonthIcon,
  gamification: EmojiEventsIcon,
};

const CATEGORY_LABELS: Record<WidgetConfig["category"], string> = {
  stats: "Statistics",
  progress: "Progress & Learning",
  engagement: "Engagement",
  schedule: "Schedule & Calendar",
  gamification: "Gamification",
};

export default function DashboardCustomizer({
  open,
  onClose,
  widgets,
  widgetSettings,
  onToggleWidget,
  onResetLayout,
}: DashboardCustomizerProps) {
  // Group widgets by category
  const widgetsByCategory = widgets.reduce(
    (acc, widget) => {
      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }
      acc[widget.category].push(widget);
      return acc;
    },
    {} as Record<WidgetConfig["category"], WidgetConfig[]>,
  );

  const categories = Object.keys(
    widgetsByCategory,
  ) as WidgetConfig["category"][];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 360 },
          bgcolor: "background.paper",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Customize Dashboard
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", py: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, pb: 1 }}
        >
          Toggle widgets to show or hide them on your dashboard. Drag widgets to
          reorder them.
        </Typography>

        {categories.map((category) => {
          const CategoryIcon = CATEGORY_ICONS[category];
          const categoryWidgets = widgetsByCategory[category];

          return (
            <Box key={category}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  bgcolor: "rgba(255, 255, 255, 0.02)",
                }}
              >
                <CategoryIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={600}>
                  {CATEGORY_LABELS[category]}
                </Typography>
              </Box>

              <List dense disablePadding>
                {categoryWidgets.map((widget) => {
                  const isVisible =
                    widgetSettings[widget.id]?.visible !== false;
                  const isRequired = !widget.removable;

                  return (
                    <ListItem
                      key={widget.id}
                      sx={{
                        px: 2,
                        opacity: isRequired ? 1 : isVisible ? 1 : 0.6,
                      }}
                    >
                      <ListItemText
                        primary={widget.title}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: isVisible ? 500 : 400,
                        }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={isVisible}
                            onChange={() => onToggleWidget(widget.id)}
                            disabled={isRequired}
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </ListItem>
                  );
                })}
              </List>
              <Divider />
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={onResetLayout}
        >
          Reset to Default Layout
        </Button>
      </Box>
    </Drawer>
  );
}
