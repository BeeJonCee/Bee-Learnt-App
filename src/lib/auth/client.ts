"use client";

import { createAuthClient } from "better-auth/react";

const authBaseUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;

if (!authBaseUrl) {
	throw new Error("NEXT_PUBLIC_NEON_AUTH_URL environment variable is required");
}

export const authClient = createAuthClient({
	baseURL: authBaseUrl,
});

export const { signIn, signOut, signUp, useSession } = authClient;
