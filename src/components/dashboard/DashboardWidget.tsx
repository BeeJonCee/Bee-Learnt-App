"use client";

import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { type ReactNode, useState } from "react";
import type { WidgetConfig } from "./WidgetRegistry";

interface DashboardWidgetProps {
  config: WidgetConfig;
  children: ReactNode;
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onRemove?: () => void;
  isDragging?: boolean;
}

export default function DashboardWidget({
  config,
  children,
  isCollapsed = false,
  onCollapse,
  onRemove,
  isDragging = false,
}: DashboardWidgetProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const handleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapse?.(newState);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease-in-out",
        boxShadow: isDragging ? 8 : 1,
        border: isDragging ? "2px solid" : "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        bgcolor: "background.paper",
      }}
    >
      <CardHeader
        sx={{
          py: 1,
          px: 2,
          borderBottom: collapsed ? "none" : "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(255, 255, 255, 0.02)",
          "& .MuiCardHeader-content": {
            overflow: "hidden",
          },
          "& .MuiCardHeader-title": {
            fontSize: "0.875rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
        title={config.title}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {config.collapsible && (
              <Tooltip title={collapsed ? "Expand" : "Collapse"}>
                <IconButton size="small" onClick={handleCollapse}>
                  {collapsed ? (
                    <ExpandMoreIcon fontSize="small" />
                  ) : (
                    <ExpandLessIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {config.removable && onRemove && (
              <Tooltip title="Remove widget">
                <IconButton size="small" onClick={onRemove}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Drag to reorder">
              <IconButton
                size="small"
                className="drag-handle"
                sx={{ cursor: "grab", "&:active": { cursor: "grabbing" } }}
              >
                <DragIndicatorIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <Collapse in={!collapsed} timeout="auto">
        <CardContent
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
}
