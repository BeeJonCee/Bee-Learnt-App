"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardHubPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect all users to their role-specific dashboard
  useEffect(() => {
    if (user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);

  // Show loading or nothing while redirecting
  if (!user) {
    return null;
  }

  return null;
}
