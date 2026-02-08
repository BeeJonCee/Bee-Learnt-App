// Widget configuration
export interface WidgetConfig {
  id: string;
  title: string;
  component: string; // Component name for dynamic loading
  defaultLayout: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
  };
  collapsible: boolean;
  removable: boolean;
  category: "stats" | "progress" | "engagement" | "schedule" | "gamification";
}

// Default layouts for different breakpoints
export const DEFAULT_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

// Widget definitions
export const STUDENT_WIDGETS: WidgetConfig[] = [
  {
    id: "quick-stats",
    title: "Quick Stats",
    component: "QuickStatsWidget",
    defaultLayout: { w: 12, h: 2, minW: 6, minH: 2 },
    collapsible: false,
    removable: false,
    category: "stats",
  },
  {
    id: "study-goals",
    title: "Study Goals",
    component: "StudyGoalsPanel",
    defaultLayout: { w: 8, h: 4, minW: 4, minH: 3 },
    collapsible: true,
    removable: true,
    category: "progress",
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    component: "LeaderboardWidget",
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 3 },
    collapsible: true,
    removable: true,
    category: "engagement",
  },
  {
    id: "performance",
    title: "Performance Gauge",
    component: "PerformanceGauge",
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 3 },
    collapsible: true,
    removable: true,
    category: "progress",
  },
  {
    id: "weekly-schedule",
    title: "Weekly Schedule",
    component: "WeeklySchedulePanel",
    defaultLayout: { w: 6, h: 3, minW: 4, minH: 3 },
    collapsible: true,
    removable: true,
    category: "schedule",
  },
  {
    id: "announcements",
    title: "Announcements",
    component: "AnnouncementsPanel",
    defaultLayout: { w: 6, h: 3, minW: 4, minH: 3 },
    collapsible: true,
    removable: true,
    category: "engagement",
  },
  {
    id: "attendance",
    title: "Attendance Summary",
    component: "AttendanceSummaryPanel",
    defaultLayout: { w: 6, h: 3, minW: 4, minH: 3 },
    collapsible: true,
    removable: true,
    category: "schedule",
  },
  {
    id: "events-calendar",
    title: "Events Calendar",
    component: "EventsCalendarPanel",
    defaultLayout: { w: 6, h: 4, minW: 4, minH: 3 },
    collapsible: true,
    removable: true,
    category: "schedule",
  },
  {
    id: "xp-progress",
    title: "XP & Level",
    component: "XPProgressBar",
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 3 },
    collapsible: true,
    removable: true,
    category: "gamification",
  },
  {
    id: "challenges",
    title: "Challenges",
    component: "ChallengesWidget",
    defaultLayout: { w: 4, h: 4, minW: 4, minH: 3 },
    collapsible: true,
    removable: true,
    category: "gamification",
  },
  {
    id: "study-timer",
    title: "Study Timer",
    component: "StudyTimerCard",
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 3 },
    collapsible: true,
    removable: true,
    category: "gamification",
  },
  {
    id: "badges",
    title: "Badges",
    component: "BadgeShelf",
    defaultLayout: { w: 8, h: 2, minW: 4, minH: 2 },
    collapsible: true,
    removable: true,
    category: "gamification",
  },
  {
    id: "subject-performance",
    title: "Subject Performance",
    component: "SubjectPerformancePanel",
    defaultLayout: { w: 12, h: 4, minW: 6, minH: 3 },
    collapsible: true,
    removable: true,
    category: "progress",
  },
  {
    id: "learning-paths",
    title: "Learning Paths",
    component: "LearningPathPanel",
    defaultLayout: { w: 12, h: 4, minW: 6, minH: 3 },
    collapsible: true,
    removable: true,
    category: "progress",
  },
  {
    id: "recommended-resources",
    title: "Recommended Resources",
    component: "RecommendedResourcesPanel",
    defaultLayout: { w: 12, h: 3, minW: 6, minH: 3 },
    collapsible: true,
    removable: true,
    category: "engagement",
  },
];

// Generate default layout from widget configs
export function generateDefaultLayout(widgets: WidgetConfig[]) {
  let currentY = 0;
  let currentX = 0;
  const maxCols = DEFAULT_COLS.lg;

  return widgets.map((widget) => {
    const { w, h, minW, minH } = widget.defaultLayout;

    // Check if widget fits in current row
    if (currentX + w > maxCols) {
      currentX = 0;
      currentY += h;
    }

    const layout = {
      i: widget.id,
      x: currentX,
      y: currentY,
      w,
      h,
      minW,
      minH,
    };

    currentX += w;

    return layout;
  });
}

// Get widget config by ID
export function getWidgetConfig(id: string): WidgetConfig | undefined {
  return STUDENT_WIDGETS.find((w) => w.id === id);
}

// Get widgets by category
export function getWidgetsByCategory(
  category: WidgetConfig["category"],
): WidgetConfig[] {
  return STUDENT_WIDGETS.filter((w) => w.category === category);
}
