import { authClient } from "@/lib/auth/client";
import {
  type AuthUser,
  getStoredAuth,
  setStoredAuth,
} from "@/lib/auth/storage";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

let refreshPromise: Promise<string | null> | null = null;

function getAuthToken() {
  // Client-only token storage (JWT issued by the backend).
  if (typeof window === "undefined") return null;
  return getStoredAuth()?.token ?? null;
}

function normalizeUser(input: unknown): AuthUser | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Partial<AuthUser>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.role !== "string" ||
    !["STUDENT", "PARENT", "ADMIN", "TUTOR"].includes(candidate.role)
  ) {
    return null;
  }

  return {
    id: candidate.id,
    role: candidate.role as AuthUser["role"],
    name: typeof candidate.name === "string" ? candidate.name : null,
    email: typeof candidate.email === "string" ? candidate.email : null,
  };
}

async function refreshBackendTokenFromNeonSession(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const sessionResponse = await authClient.getSession();
      const sessionToken = sessionResponse.data?.session?.token ?? null;
      if (!sessionToken) {
        return null;
      }

      const response = await fetch(
        `${backendUrl}/api/auth/exchange-neon-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken }),
        },
      );

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        token?: unknown;
        user?: unknown;
      };

      const token =
        typeof payload.token === "string" && payload.token.length > 0
          ? payload.token
          : null;
      const user = normalizeUser(payload.user);

      if (!token || !user) {
        return null;
      }

      setStoredAuth({ token, user });
      return token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function extractMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    typeof (payload as { message?: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }

  return null;
}

function formatRequestPath(url: RequestInfo) {
  if (typeof url !== "string") return "request";

  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

function buildErrorMessage(status: number, payload: unknown, url: RequestInfo) {
  const payloadMessage = extractMessage(payload);
  if (payloadMessage) return payloadMessage;

  const requestPath = formatRequestPath(url);

  if (status === 401) {
    return `Unauthorized (${requestPath})`;
  }

  return `Request failed (${status}) for ${requestPath}`;
}

function buildUrl(input: RequestInfo) {
  if (typeof input === "string" && input.startsWith("/")) {
    return `${backendUrl}${input}`;
  }

  return input;
}

async function parseJsonSafely(response: Response) {
  return response.json().catch(() => ({}));
}

async function doFetch<T>(
  input: RequestInfo,
  init: RequestInit,
  allowRefreshRetry: boolean,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Authorization")) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = buildUrl(input);
  const response = await fetch(url, { ...init, headers });

  if (response.ok) {
    return response.json();
  }

  if (response.status === 401 && allowRefreshRetry) {
    const refreshedToken = await refreshBackendTokenFromNeonSession();
    if (refreshedToken) {
      const retryHeaders = new Headers(init.headers);
      if (!retryHeaders.has("Content-Type") && init.body) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

      return doFetch<T>(input, { ...init, headers: retryHeaders }, false);
    }
  }

  const payload = await parseJsonSafely(response);
  throw new Error(buildErrorMessage(response.status, payload, url));
}

export async function apiFetch<T>(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<T> {
  return doFetch<T>(input, init, true);
}
