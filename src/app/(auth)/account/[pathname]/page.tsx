"use client";

import { AccountView } from "@neondatabase/neon-js/auth/react/ui";
import { useParams } from "next/navigation";

function normalizePathname(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join("/");
  return value ?? "profile";
}

export default function AccountPage() {
  const params = useParams<{ pathname?: string | string[] }>();
  const pathname = normalizePathname(params?.pathname);

  return <AccountView pathname={pathname} />;
}