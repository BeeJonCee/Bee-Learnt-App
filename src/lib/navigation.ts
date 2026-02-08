export function getDashboardPath(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "PARENT") return "/dashboard/parent";
  if (role === "TUTOR") return "/dashboard/tutor";
  return "/dashboard/student";
}
