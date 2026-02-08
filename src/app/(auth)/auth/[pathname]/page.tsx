"use client";

import { AuthView } from "@neondatabase/neon-js/auth/react/ui";
import { useParams } from "next/navigation";

function normalizePathname(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join("/");
  return value ?? "sign-in";
}

export default function AuthPage() {
  const params = useParams<{ pathname?: string | string[] }>();
  const pathname = normalizePathname(params?.pathname);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <AuthView pathname={pathname} />
    </div>
  );
}