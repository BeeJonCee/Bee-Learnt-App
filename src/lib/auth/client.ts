"use client";

import { createAuthClient } from "better-auth/react";

const authBaseUrl =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL?.trim() || "/api/auth";

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
});

export const { signIn, signOut, signUp, useSession } = authClient;
