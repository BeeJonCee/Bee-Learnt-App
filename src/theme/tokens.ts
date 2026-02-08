/**
 * Design tokens for BeeLearnt theme
 * Centralizes all color definitions for consistent theming
 */

export const tokens = {
  // Brand colors
  brand: {
    yellow: "#FFD600",
    yellowLight: "#FFF176",
    yellowDark: "#F0C000",
    cyan: "#5BC0EB",
    cyanLight: "#87D4F3",
    cyanDark: "#3DA9D9",
  },

  // Chart colors - consistent across themes
  chart: {
    series: [
      "#5BC0EB", // cyan
      "#F6C945", // yellow
      "#8BC34A", // green
      "#EF5350", // red
      "#9C27B0", // purple
      "#FF9800", // orange
    ],
    gradient: {
      start: "rgba(91, 192, 235, 0.3)",
      end: "rgba(91, 192, 235, 0.05)",
    },
    tooltip: {
      light: "rgba(255, 255, 255, 0.95)",
      dark: "rgba(0, 0, 0, 0.9)",
    },
    grid: {
      light: "rgba(0, 0, 0, 0.1)",
      dark: "rgba(255, 255, 255, 0.1)",
    },
    axis: {
      light: "rgba(0, 0, 0, 0.5)",
      dark: "rgba(255, 255, 255, 0.5)",
    },
  },

  // Surface colors for cards and containers
  surface: {
    elevated: {
      light: "rgba(0, 0, 0, 0.04)",
      dark: "rgba(255, 255, 255, 0.05)",
    },
    hover: {
      light: "rgba(0, 0, 0, 0.08)",
      dark: "rgba(255, 255, 255, 0.08)",
    },
    selected: {
      light: "rgba(91, 192, 235, 0.15)",
      dark: "rgba(91, 192, 235, 0.2)",
    },
    disabled: {
      light: "rgba(0, 0, 0, 0.12)",
      dark: "rgba(255, 255, 255, 0.12)",
    },
  },

  // Overlay colors for modals, drawers, etc.
  overlay: {
    sidebar: {
      light: "rgba(255, 255, 255, 0.95)",
      dark: "rgba(15, 17, 22, 0.95)",
    },
    modal: {
      light: "rgba(0, 0, 0, 0.5)",
      dark: "rgba(0, 0, 0, 0.7)",
    },
    gradient: {
      light:
        "radial-gradient(500px circle at 20% 10%, rgba(91, 192, 235, 0.08), transparent 60%)",
      dark: "radial-gradient(500px circle at 20% 10%, rgba(246, 201, 69, 0.12), transparent 60%)",
    },
  },

  // Status colors
  status: {
    success: {
      main: "#8BC34A",
      light: "#A5D670",
      dark: "#6B9B2D",
      bg: {
        light: "rgba(139, 195, 74, 0.1)",
        dark: "rgba(139, 195, 74, 0.15)",
      },
    },
    warning: {
      main: "#FF9800",
      light: "#FFB74D",
      dark: "#F57C00",
      bg: {
        light: "rgba(255, 152, 0, 0.1)",
        dark: "rgba(255, 152, 0, 0.15)",
      },
    },
    error: {
      main: "#EF5350",
      light: "#E57373",
      dark: "#D32F2F",
      bg: {
        light: "rgba(239, 83, 80, 0.1)",
        dark: "rgba(239, 83, 80, 0.15)",
      },
    },
    info: {
      main: "#5BC0EB",
      light: "#87D4F3",
      dark: "#3DA9D9",
      bg: {
        light: "rgba(91, 192, 235, 0.1)",
        dark: "rgba(91, 192, 235, 0.15)",
      },
    },
  },

  // Text colors
  text: {
    primary: {
      light: "#1E1E1E",
      dark: "#E0E0E0",
    },
    secondary: {
      light: "#666666",
      dark: "#B0B0B0",
    },
    disabled: {
      light: "#9E9E9E",
      dark: "#757575",
    },
    hint: {
      light: "#BDBDBD",
      dark: "#616161",
    },
  },

  // Background colors
  background: {
    default: {
      light: "#FFFFFF",
      dark: "#121212",
    },
    paper: {
      light: "#F7F7F7",
      dark: "#1A1A1A",
    },
    elevated: {
      light: "#FFFFFF",
      dark: "#242424",
    },
  },

  // Border colors
  border: {
    default: {
      light: "rgba(0, 0, 0, 0.12)",
      dark: "rgba(255, 255, 255, 0.12)",
    },
    subtle: {
      light: "rgba(0, 0, 0, 0.06)",
      dark: "rgba(255, 255, 255, 0.06)",
    },
    focus: {
      light: "#5BC0EB",
      dark: "#5BC0EB",
    },
  },

  // Gamification colors
  gamification: {
    xp: "#FFD600",
    level: "#5BC0EB",
    streak: "#FF9800",
    badge: {
      bronze: "#CD7F32",
      silver: "#C0C0C0",
      gold: "#FFD700",
      platinum: "#E5E4E2",
    },
    leaderboard: {
      first: "#FFD700",
      second: "#C0C0C0",
      third: "#CD7F32",
    },
  },

  // Priority colors
  priority: {
    high: "#EF5350",
    medium: "#FF9800",
    low: "#8BC34A",
  },
};

/**
 * Get a color value based on the current theme mode
 */
export function getThemedColor<T extends { light: string; dark: string }>(
  colorObj: T,
  mode: "light" | "dark",
): string {
  return colorObj[mode];
}

/**
 * Get chart colors for a series
 */
export function getChartColor(index: number): string {
  return tokens.chart.series[index % tokens.chart.series.length];
}
