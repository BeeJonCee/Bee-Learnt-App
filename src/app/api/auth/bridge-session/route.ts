import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

const sessionCookieNames = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "session_token",
] as const;

type BridgePayload = {
  sessionToken?: string;
};

async function getSessionTokenFromBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    const body = (await request.json()) as BridgePayload;
    if (typeof body?.sessionToken === "string") {
      const value = body.sessionToken.trim();
      return value.length > 0 ? value : null;
    }
  } catch {
    // Ignore malformed JSON and fall back to cookies.
  }

  return null;
}

async function getSessionTokenFromCookies() {
  const cookieStore = await cookies();
  for (const name of sessionCookieNames) {
    const value = cookieStore.get(name)?.value?.trim();
    if (value) {
      return value;
    }
  }
  return null;
}

async function resolveSessionToken(request?: Request) {
  if (request) {
    const fromBody = await getSessionTokenFromBody(request);
    if (fromBody) return fromBody;
  }

  return getSessionTokenFromCookies();
}

async function exchangeToken(sessionToken: string) {
  const response = await fetch(`${backendUrl}/api/auth/exchange-neon-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionToken }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(
      { message: payload?.message || `Backend returned ${response.status}` },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

async function handleBridge(request?: Request) {
  try {
    const sessionToken = await resolveSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { message: "No session found. Please sign in again." },
        { status: 401 },
      );
    }

    return exchangeToken(sessionToken);
  } catch (error) {
    console.error("[bridge-session] Error:", error);
    return NextResponse.json(
      { message: "Authentication failed. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return handleBridge();
}

export async function POST(request: Request) {
  return handleBridge(request);
}
