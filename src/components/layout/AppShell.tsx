"use client";

import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupIcon from "@mui/icons-material/Group";
import GroupsIcon from "@mui/icons-material/Groups";
import LogoutIcon from "@mui/icons-material/Logout";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SearchIcon from "@mui/icons-material/Search";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import NotificationCenter from "@/components/NotificationCenter";
import NotificationToast from "@/components/NotificationToast";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useColorMode } from "@/providers/ThemeModeProvider";

const drawerWidth = 280;
const collapsedDrawerWidth = 88;

type NavItem = {
  label: string;
  href: string;
  icon: typeof DashboardIcon;
  visible: boolean;
};

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname() ?? "";
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { mode, toggleMode } = useColorMode();
  const effectiveDrawerWidth =
    isDesktop && isCollapsed ? collapsedDrawerWidth : drawerWidth;
  const showLabels = !isDesktop || !isCollapsed;

  const navItems = useMemo<NavItem[]>(() => {
    const role = user?.role ?? "STUDENT";
    return [
      {
        label: "Dashboard",
        href: getDashboardPath(role),
        icon: DashboardIcon,
        visible: true,
      },
      {
        label: "Subjects",
        href: "/subjects",
        icon: MenuBookIcon,
        visible: role === "STUDENT",
      },
      {
        label: "Assignments",
        href: "/assignments",
        icon: AssignmentTurnedInIcon,
        visible: role === "STUDENT",
      },
      {
        label: "Assessments",
        href: "/assessments",
        icon: FactCheckIcon,
        visible: role === "STUDENT" || role === "TUTOR" || role === "ADMIN",
      },
      {
        label: "NSC Papers",
        href: "/nsc-papers",
        icon: DescriptionIcon,
        visible: role === "STUDENT" || role === "TUTOR" || role === "ADMIN",
      },
      {
        label: "Progress",
        href: "/progress",
        icon: ShowChartIcon,
        visible: role === "STUDENT",
      },
      {
        label: "Timetable",
        href: "/timetable",
        icon: CalendarMonthIcon,
        visible: role === "STUDENT" || role === "TUTOR",
      },
      {
        label: "Messages",
        href: "/messages",
        icon: MailIcon,
        visible: true,
      },
      {
        label: "Search",
        href: "/search",
        icon: SearchIcon,
        visible: true,
      },
      {
        label: "AI Tutor",
        href: "/ai-tutor",
        icon: AutoAwesomeIcon,
        visible: role === "STUDENT",
      },
      {
        label: "Collaboration",
        href: "/collaboration",
        icon: GroupsIcon,
        visible: role === "STUDENT" || role === "PARENT",
      },
      {
        label: "Accessibility",
        href: "/settings/accessibility",
        icon: AccessibilityNewIcon,
        visible: true,
      },
      {
        label: "Children",
        href: "/children",
        icon: GroupIcon,
        visible: role === "PARENT",
      },
      {
        label: "Admin",
        href: "/admin",
        icon: AdminPanelSettingsIcon,
        visible: role === "ADMIN",
      },
    ];
  }, [user?.role]);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {isDesktop && <Toolbar />}
      <Box sx={{ p: 3, pt: isDesktop ? 2 : 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              bgcolor: "primary.main",
              color: "#101010",
              fontWeight: 700,
            }}
          >
            B
          </Avatar>
          {showLabels && (
            <Box>
              <Typography variant="h6">BeeLearnt</Typography>
              <Typography variant="caption" color="text.secondary">
                CAPS-ready learning
              </Typography>
            </Box>
          )}
          {isDesktop && (
            <IconButton
              size="small"
              onClick={() => setIsCollapsed((prev) => !prev)}
              sx={{ ml: "auto" }}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          )}
        </Stack>
      </Box>
      <Divider />
      <List sx={{ px: 1.5, pt: 2 }}>
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const selected =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={selected}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: selected ? "#101010" : "text.secondary",
                  backgroundColor: selected
                    ? "rgba(246, 201, 69, 0.95)"
                    : "transparent",
                  justifyContent: showLabels ? "flex-start" : "center",
                  px: showLabels ? 2 : 1.5,
                  "&:hover": {
                    backgroundColor: selected
                      ? "rgba(246, 201, 69, 0.95)"
                      : "rgba(255, 255, 255, 0.06)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: showLabels ? 40 : "auto",
                    mr: showLabels ? 1 : 0,
                    color: selected ? "#101010" : "inherit",
                    justifyContent: "center",
                  }}
                >
                  <item.icon fontSize="small" />
                </ListItemIcon>
                {showLabels && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                )}
              </ListItemButton>
            );
          })}
      </List>
      <Box sx={{ mt: "auto", px: 2, pb: 3 }}>
        <Button
          variant="outlined"
          startIcon={showLabels ? <LogoutIcon /> : undefined}
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          fullWidth
          sx={{
            borderColor: "rgba(255,255,255,0.16)",
            color: "text.primary",
            minWidth: 0,
          }}
        >
          {showLabels ? "Logout" : <LogoutIcon fontSize="small" />}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          width: isDesktop ? `calc(100% - ${effectiveDrawerWidth}px)` : "100%",
          ml: isDesktop ? `${effectiveDrawerWidth}px` : 0,
          transition: theme.transitions.create(["margin-left", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {!isDesktop ? (
            <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          )}
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            BeeLearnt Workspace
          </Typography>
          <NotificationCenter />
          <IconButton color="inherit" onClick={toggleMode}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box textAlign="right">
              <Typography variant="subtitle2">{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === "PARENT"
                  ? "Parent"
                  : user?.role === "ADMIN"
                    ? "Admin"
                    : user?.role === "TUTOR"
                      ? "Tutor"
                      : "Student"}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              {user?.name?.[0]}
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: isDesktop ? effectiveDrawerWidth : 0, flexShrink: 0 }}
      >
        {isDesktop ? (
          <Drawer
            variant="permanent"
            sx={{
              width: effectiveDrawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: effectiveDrawerWidth,
                boxSizing: "border-box",
                backgroundImage: "none",
                backgroundColor: "rgba(15, 17, 22, 0.9)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.shorter,
                }),
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                backgroundImage: "none",
                backgroundColor: "rgba(15, 17, 22, 0.98)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 10, md: 12 },
          pb: { xs: 12, md: 6 }, // Extra padding on mobile for bottom nav
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(500px circle at 20% 10%, rgba(246, 201, 69, 0.12), transparent 60%), radial-gradient(450px circle at 80% 15%, rgba(91, 192, 235, 0.12), transparent 55%)",
            opacity: 0.8,
          }}
        />
        <Box sx={{ position: "relative" }}>{children}</Box>
      </Box>

      {/* Notification toast for achievements */}
      <NotificationToast />

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </Box>
  );
}
