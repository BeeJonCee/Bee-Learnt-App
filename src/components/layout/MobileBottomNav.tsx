"use client";

import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";

interface NavItem {
  label: string;
  value: string;
  icon: typeof DashboardIcon;
}

export default function MobileBottomNav() {
  const { user } = useAuth();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const role = user?.role ?? "STUDENT";

  const navItems = useMemo<NavItem[]>(() => {
    const dashboardPath = getDashboardPath(role);

    switch (role) {
      case "ADMIN":
        return [
          { label: "Dashboard", value: "/admin", icon: DashboardIcon },
          { label: "Users", value: "/admin/users", icon: PeopleIcon },
          { label: "Content", value: "/admin/content", icon: MenuBookIcon },
          { label: "Search", value: "/search", icon: SearchIcon },
          { label: "Account", value: "/account", icon: PersonIcon },
        ];

      case "TUTOR":
        return [
          { label: "Dashboard", value: dashboardPath, icon: DashboardIcon },
          { label: "Students", value: "/tutor/students", icon: SchoolIcon },
          { label: "Sessions", value: "/tutor/sessions", icon: AssignmentIcon },
          { label: "Search", value: "/search", icon: SearchIcon },
          { label: "Account", value: "/account", icon: PersonIcon },
        ];

      case "PARENT":
        return [
          { label: "Dashboard", value: dashboardPath, icon: DashboardIcon },
          { label: "Children", value: "/parent/children", icon: PeopleIcon },
          { label: "Search", value: "/search", icon: SearchIcon },
          { label: "Account", value: "/account", icon: PersonIcon },
        ];
      default:
        return [
          { label: "Home", value: dashboardPath, icon: DashboardIcon },
          { label: "Subjects", value: "/subjects", icon: MenuBookIcon },
          { label: "Tasks", value: "/assignments", icon: AssignmentIcon },
          { label: "Search", value: "/search", icon: SearchIcon },
          { label: "Account", value: "/account", icon: PersonIcon },
        ];
    }
  }, [role]);

  // Determine the current navigation value based on pathname
  const currentValue = useMemo(() => {
    const match = navItems.find(
      (item) =>
        pathname === item.value || pathname.startsWith(`${item.value}/`),
    );
    return match?.value ?? "";
  }, [pathname, navItems]);

  const handleNavChange = (_event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  if (!user) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: { xs: "block", md: "none" },
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        // Safe area padding for notched phones
        pb: "env(safe-area-inset-bottom)",
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentValue}
        onChange={handleNavChange}
        showLabels
        sx={{
          bgcolor: "transparent",
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            maxWidth: "none",
            padding: "6px 0",
            color: "text.secondary",
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.625rem",
            opacity: 0.8,
            "&.Mui-selected": {
              fontSize: "0.625rem",
              opacity: 1,
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={<item.icon />}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
