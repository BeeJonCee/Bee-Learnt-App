"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";

type RoleGuard = {
  prefix: string;
  roles: Array<"ADMIN" | "PARENT" | "STUDENT" | "TUTOR">;
};

const roleGuards: RoleGuard[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard/parent", roles: ["PARENT"] },
  { prefix: "/dashboard/student", roles: ["STUDENT"] },
  { prefix: "/dashboard/tutor", roles: ["TUTOR"] },
  { prefix: "/subjects", roles: ["STUDENT"] },
  { prefix: "/modules", roles: ["STUDENT"] },
  { prefix: "/lessons", roles: ["STUDENT", "TUTOR"] },
  { prefix: "/assignments", roles: ["STUDENT", "TUTOR"] },
  { prefix: "/quizzes", roles: ["STUDENT", "TUTOR"] },
  { prefix: "/assessments", roles: ["STUDENT", "TUTOR", "ADMIN"] },
  { prefix: "/nsc-papers", roles: ["STUDENT", "TUTOR", "ADMIN"] },
  { prefix: "/progress", roles: ["STUDENT"] },
  { prefix: "/timetable", roles: ["STUDENT", "TUTOR"] },
  { prefix: "/ai-tutor", roles: ["STUDENT"] },
  { prefix: "/study", roles: ["STUDENT"] },
  { prefix: "/onboarding", roles: ["STUDENT"] },
  { prefix: "/children", roles: ["PARENT"] },
  { prefix: "/collaboration", roles: ["STUDENT", "PARENT"] },
];

const isAllowedForRole = (
  pathname: string,
  role: "ADMIN" | "PARENT" | "STUDENT" | "TUTOR",
) => {
  const guard = roleGuards.find((entry) => pathname.startsWith(entry.prefix));
  if (!guard) return true;
  return guard.roles.includes(role);
};

export default function ProtectedLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user) return;

    if (pathname === "/dashboard") {
      router.replace(getDashboardPath(user.role));
      return;
    }

    if (!isAllowedForRole(pathname, user.role)) {
      router.replace(getDashboardPath(user.role));
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
