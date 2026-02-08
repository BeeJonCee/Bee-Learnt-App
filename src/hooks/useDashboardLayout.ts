"use client";

import { useCallback, useEffect, useState } from "react";
import type { Layout } from "react-grid-layout";
import {
  generateDefaultLayout,
  STUDENT_WIDGETS,
  type WidgetConfig,
} from "@/components/dashboard/WidgetRegistry";
import { apiFetch } from "@/lib/utils/api";

export interface WidgetSettings {
  [widgetId: string]: {
    visible: boolean;
    collapsed?: boolean;
    config?: Record<string, unknown>;
  };
}

export interface DashboardPreferences {
  dashboardLayout: Layout[] | null;
  widgetSettings: WidgetSettings | null;
}

const LOCAL_STORAGE_KEY = "beelearnt-dashboard-layout";

// Default widget settings (all visible)
function getDefaultWidgetSettings(widgets: WidgetConfig[]): WidgetSettings {
  return widgets.reduce((acc, widget) => {
    acc[widget.id] = { visible: true, collapsed: false };
    return acc;
  }, {} as WidgetSettings);
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState<Layout[]>(() =>
    generateDefaultLayout(STUDENT_WIDGETS),
  );
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(() =>
    getDefaultWidgetSettings(STUDENT_WIDGETS),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences from API or localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        // Try to load from API first
        const prefs = await apiFetch<DashboardPreferences>("/api/preferences");
        if (prefs?.dashboardLayout) {
          setLayout(prefs.dashboardLayout);
        }
        if (prefs?.widgetSettings) {
          setWidgetSettings(prefs.widgetSettings);
        }
      } catch {
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.layout) setLayout(parsed.layout);
            if (parsed.widgetSettings) setWidgetSettings(parsed.widgetSettings);
          }
        } catch {
          // Use defaults
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to API and localStorage
  const savePreferences = useCallback(
    async (newLayout: Layout[], newSettings: WidgetSettings) => {
      setIsSaving(true);

      // Save to localStorage immediately for quick access
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ layout: newLayout, widgetSettings: newSettings }),
        );
      } catch {
        // localStorage might be full or unavailable
      }

      // Save to API in background
      try {
        await apiFetch("/api/preferences", {
          method: "PATCH",
          body: JSON.stringify({
            dashboardLayout: newLayout,
            widgetSettings: newSettings,
          }),
        });
      } catch {
        // API save failed, but localStorage is saved
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  // Handle layout change from drag/drop
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      setLayout(newLayout);
      savePreferences(newLayout, widgetSettings);
    },
    [widgetSettings, savePreferences],
  );

  // Toggle widget visibility
  const toggleWidgetVisibility = useCallback(
    (widgetId: string) => {
      setWidgetSettings((prev) => {
        const newSettings = {
          ...prev,
          [widgetId]: {
            ...prev[widgetId],
            visible: !prev[widgetId]?.visible,
          },
        };
        savePreferences(layout, newSettings);
        return newSettings;
      });
    },
    [layout, savePreferences],
  );

  // Toggle widget collapsed state
  const toggleWidgetCollapsed = useCallback(
    (widgetId: string) => {
      setWidgetSettings((prev) => {
        const newSettings = {
          ...prev,
          [widgetId]: {
            ...prev[widgetId],
            collapsed: !prev[widgetId]?.collapsed,
          },
        };
        savePreferences(layout, newSettings);
        return newSettings;
      });
    },
    [layout, savePreferences],
  );

  // Remove widget (hide it)
  const removeWidget = useCallback(
    (widgetId: string) => {
      setWidgetSettings((prev) => {
        const newSettings = {
          ...prev,
          [widgetId]: {
            ...prev[widgetId],
            visible: false,
          },
        };
        savePreferences(layout, newSettings);
        return newSettings;
      });
    },
    [layout, savePreferences],
  );

  // Reset to default layout
  const resetLayout = useCallback(() => {
    const defaultLayout = generateDefaultLayout(STUDENT_WIDGETS);
    const defaultSettings = getDefaultWidgetSettings(STUDENT_WIDGETS);
    setLayout(defaultLayout);
    setWidgetSettings(defaultSettings);
    savePreferences(defaultLayout, defaultSettings);
  }, [savePreferences]);

  // Get visible widgets with their layouts
  const visibleWidgets = STUDENT_WIDGETS.filter(
    (widget) => widgetSettings[widget.id]?.visible !== false,
  );

  const visibleLayout = layout.filter((item) =>
    visibleWidgets.some((widget) => widget.id === item.i),
  );

  return {
    layout: visibleLayout,
    widgetSettings,
    visibleWidgets,
    allWidgets: STUDENT_WIDGETS,
    isLoading,
    isSaving,
    handleLayoutChange,
    toggleWidgetVisibility,
    toggleWidgetCollapsed,
    removeWidget,
    resetLayout,
  };
}
