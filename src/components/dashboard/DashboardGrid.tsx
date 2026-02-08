"use client";

import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Fab from "@mui/material/Fab";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { type Layout, Responsive, WidthProvider } from "react-grid-layout";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import DashboardCustomizer from "./DashboardCustomizer";
import DashboardWidget from "./DashboardWidget";
import { DEFAULT_COLS } from "./WidgetRegistry";

// Import react-grid-layout styles
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetComponents {
  [widgetId: string]: ReactNode;
}

interface DashboardGridProps {
  widgets: WidgetComponents;
}

export default function DashboardGrid({ widgets }: DashboardGridProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);

  const {
    layout,
    widgetSettings,
    visibleWidgets,
    allWidgets,
    isLoading,
    isSaving,
    handleLayoutChange,
    toggleWidgetVisibility,
    toggleWidgetCollapsed,
    removeWidget,
    resetLayout,
  } = useDashboardLayout();

  // Handle drag start
  const handleDragStart = useCallback(
    (_layout: Layout[], _oldItem: Layout, newItem: Layout) => {
      setDraggingWidget(newItem.i);
    },
    [],
  );

  // Handle drag stop
  const handleDragStop = useCallback(() => {
    setDraggingWidget(null);
  }, []);

  // Generate responsive layouts
  const responsiveLayouts = useMemo(() => {
    return {
      lg: layout,
      md: layout.map((item) => ({
        ...item,
        w: Math.min(item.w, DEFAULT_COLS.md),
        x: Math.min(item.x, DEFAULT_COLS.md - item.w),
      })),
      sm: layout.map((item) => ({
        ...item,
        w: Math.min(item.w, DEFAULT_COLS.sm),
        x: 0, // Stack on small screens
      })),
      xs: layout.map((item) => ({
        ...item,
        w: DEFAULT_COLS.xs,
        x: 0,
      })),
      xxs: layout.map((item) => ({
        ...item,
        w: DEFAULT_COLS.xxs,
        x: 0,
      })),
    };
  }, [layout]);

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      removeWidget(widgetId);
    },
    [removeWidget],
  );

  const handleCollapseWidget = useCallback(
    (widgetId: string, collapsed: boolean) => {
      if (collapsed !== widgetSettings[widgetId]?.collapsed) {
        toggleWidgetCollapsed(widgetId);
      }
    },
    [widgetSettings, toggleWidgetCollapsed],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      {/* Grid Layout */}
      <ResponsiveGridLayout
        layouts={responsiveLayouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={DEFAULT_COLS}
        rowHeight={80}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={(currentLayout) => handleLayoutChange(currentLayout)}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        draggableHandle=".drag-handle"
        isDraggable={!isMobile}
        isResizable={!isMobile}
        useCSSTransforms
        compactType="vertical"
      >
        {visibleWidgets.map((widget) => {
          const widgetContent = widgets[widget.id];
          if (!widgetContent) return null;

          return (
            <Box key={widget.id} sx={{ height: "100%" }}>
              <DashboardWidget
                config={widget}
                isCollapsed={widgetSettings[widget.id]?.collapsed}
                onCollapse={(collapsed) =>
                  handleCollapseWidget(widget.id, collapsed)
                }
                onRemove={() => handleRemoveWidget(widget.id)}
                isDragging={draggingWidget === widget.id}
              >
                {widgetContent}
              </DashboardWidget>
            </Box>
          );
        })}
      </ResponsiveGridLayout>

      {/* Customize FAB */}
      <Tooltip title="Customize dashboard">
        <Fab
          color="primary"
          size="medium"
          onClick={() => setCustomizerOpen(true)}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 24,
            zIndex: 1000,
          }}
        >
          <SettingsIcon />
        </Fab>
      </Tooltip>

      {/* Saving indicator */}
      {isSaving && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "background.paper",
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            zIndex: 1000,
          }}
        >
          <CircularProgress size={16} />
          Saving layout...
        </Box>
      )}

      {/* Customizer Drawer */}
      <DashboardCustomizer
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        widgets={allWidgets}
        widgetSettings={widgetSettings}
        onToggleWidget={toggleWidgetVisibility}
        onResetLayout={resetLayout}
      />
    </Box>
  );
}
