import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

const jwtSecret = process.env.JWT_SECRET;

/**
 * Direct token exchange - no slow bridge pattern
 * Extracts session token from cookie set by Neon Auth UI,
 * exchanges it with backend for a JWT
 */
export async function GET() {
  try {
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server misconfigured: JWT_SECRET not set" },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    
    // Neon Auth UI sets the session token in __session cookie
    const sessionToken = cookieStore.get("__session")?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { message: "No session found. Please try signing in again." },
        { status: 401 },
      );
    }

    // Exchange token directly with backend (no intermediate bridge)
    const response = await fetch(`${backendUrl}/api/auth/exchange-neon-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionToken }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      console.error("[token-exchange] Backend error:", payload);
      return NextResponse.json(
        { message: payload?.message || `Backend returned ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[token-exchange] Error:", error);
    return NextResponse.json(
      { message: "Authentication failed. Please try again." },
      { status: 500 },
    );
  }
}

