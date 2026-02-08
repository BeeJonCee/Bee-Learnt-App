import { alpha, createTheme, type PaletteMode } from "@mui/material/styles";
import { tokens } from "./tokens";

const brand = {
  yellow: tokens.brand.yellow,
  dark: tokens.background.default.dark,
  graphite: tokens.background.paper.dark,
  offWhite: tokens.text.primary.dark,
  white: tokens.background.default.light,
  accent: "#2B2B2B",
};

// Extend MUI theme to include custom chart colors
declare module "@mui/material/styles" {
  interface Theme {
    chart: {
      series: string[];
      tooltip: string;
      grid: string;
      axis: string;
    };
  }
  interface ThemeOptions {
    chart?: {
      series?: string[];
      tooltip?: string;
      grid?: string;
      axis?: string;
    };
  }
}

export function getTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: brand.yellow,
        contrastText: "#121212",
      },
      secondary: {
        main: isDark ? tokens.brand.cyan : "#1976d2",
      },
      background: {
        default: isDark ? brand.dark : brand.white,
        paper: isDark ? brand.graphite : "#F7F7F7",
      },
      text: {
        primary: isDark ? brand.offWhite : tokens.text.primary.light,
        secondary: isDark
          ? tokens.text.secondary.dark
          : tokens.text.secondary.light,
      },
      divider: isDark ? brand.accent : "#E5E7EB",
      success: {
        main: tokens.status.success.main,
        light: tokens.status.success.light,
        dark: tokens.status.success.dark,
      },
      warning: {
        main: tokens.status.warning.main,
        light: tokens.status.warning.light,
        dark: tokens.status.warning.dark,
      },
      error: {
        main: tokens.status.error.main,
        light: tokens.status.error.light,
        dark: tokens.status.error.dark,
      },
      info: {
        main: tokens.status.info.main,
        light: tokens.status.info.light,
        dark: tokens.status.info.dark,
      },
    },
    chart: {
      series: tokens.chart.series,
      tooltip: isDark ? tokens.chart.tooltip.dark : tokens.chart.tooltip.light,
      grid: isDark ? tokens.chart.grid.dark : tokens.chart.grid.light,
      axis: isDark ? tokens.chart.axis.dark : tokens.chart.axis.light,
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily:
        'var(--font-body), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontFamily:
          'var(--font-display), "Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontFamily:
          'var(--font-display), "Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily:
          'var(--font-display), "Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 700,
      },
      h4: {
        fontFamily:
          'var(--font-display), "Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 700,
      },
      h5: {
        fontFamily:
          'var(--font-display), "Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 600,
      },
      h6: {
        fontFamily:
          'var(--font-display), "Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 600,
      },
      button: {
        fontFamily:
          'var(--font-body), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? brand.dark : brand.white,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingLeft: 20,
            paddingRight: 20,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: isDark
              ? `linear-gradient(135deg, ${alpha("#1f1f1f", 0.95)} 0%, ${alpha(
                  "#161616",
                  0.98,
                )} 100%)`
              : "none",
            border: `1px solid ${alpha(isDark ? brand.white : "#000", isDark ? 0.06 : 0.08)}`,
            boxShadow: isDark
              ? "0 24px 60px rgba(0, 0, 0, 0.35)"
              : "0 16px 40px rgba(15, 15, 15, 0.08)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${alpha(isDark ? brand.white : "#000", isDark ? 0.06 : 0.08)}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark
              ? alpha(brand.dark, 0.4)
              : alpha(brand.white, 0.7),
          },
          notchedOutline: {
            borderColor: alpha(isDark ? brand.white : "#000", 0.12),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(8px)",
            backgroundImage: "none",
            backgroundColor: alpha(isDark ? brand.dark : brand.white, 0.85),
            borderBottom: `1px solid ${alpha(isDark ? brand.white : "#000", 0.06)}`,
          },
        },
      },
    },
  });
}
