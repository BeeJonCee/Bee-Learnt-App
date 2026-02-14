"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authClient } from "@/lib/auth/client";
import type { AuthUser } from "@/lib/auth/storage";
import {
  AUTH_STORAGE_EVENT,
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "@/lib/auth/storage";

type SocialProvider = "google" | "facebook" | "apple";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: "STUDENT" | "PARENT";
  }) => Promise<{ autoLoggedIn: boolean }>;
  socialLogin: (provider: SocialProvider) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";
const AUTH_LOG_NS = "[auth-client]";
type AuthFlowStep =
  | "sign-in-email"
  | "sign-up-email"
  | "resolve-session-token"
  | "exchange-session-token"
  | "store-auth-state"
  | "backend-register"
  | "backend-login";

type AuthClientErrorSummary = {
  message: string;
  status: number | null;
  statusText: string | null;
  code: string | null;
  raw: string;
};

function createTraceId(action: "login" | "register") {
  return `${action}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function maskEmail(email: string) {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  if (local.length <= 2) return `***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function summarizeAuthClientError(error: unknown): AuthClientErrorSummary {
  const maybeError =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : {};

  const message =
    typeof maybeError.message === "string" && maybeError.message.length > 0
      ? maybeError.message
      : getErrorMessage(error);
  const status =
    typeof maybeError.status === "number" ? maybeError.status : null;
  const statusText =
    typeof maybeError.statusText === "string" ? maybeError.statusText : null;
  const code = typeof maybeError.code === "string" ? maybeError.code : null;

  let raw = "";
  try {
    raw = JSON.stringify(error);
  } catch {
    raw = String(error);
  }

  return { message, status, statusText, code, raw };
}

function isAuthEndpointUnavailable(error: AuthClientErrorSummary) {
  const detail = `${error.message} ${error.statusText ?? ""}`.toLowerCase();
  return (
    error.status === 404 ||
    detail.includes("404") ||
    detail.includes("not found")
  );
}

function isAuthServerError(error: AuthClientErrorSummary) {
  return typeof error.status === "number" && error.status >= 500;
}

function isAuthTransportError(error: AuthClientErrorSummary) {
  const detail = `${error.message} ${error.statusText ?? ""}`.toLowerCase();
  return (
    detail.includes("unknown error") ||
    detail.includes("failed to fetch") ||
    detail.includes("network") ||
    detail.includes("timeout")
  );
}

function shouldFallbackToBackendAuth(error: AuthClientErrorSummary) {
  return (
    isAuthEndpointUnavailable(error) ||
    isAuthServerError(error) ||
    isAuthTransportError(error)
  );
}

function getFallbackReason(error: AuthClientErrorSummary) {
  if (isAuthEndpointUnavailable(error)) {
    return "auth-endpoint-unavailable";
  }
  if (isAuthServerError(error)) {
    return "auth-server-error";
  }
  if (isAuthTransportError(error)) {
    return "auth-transport-error";
  }
  return "auth-error";
}

function toUserFacingAuthMessage(
  error: AuthClientErrorSummary,
  fallback: string,
) {
  if (isAuthEndpointUnavailable(error)) {
    return "Authentication service endpoint not found (404). Check Neon Auth endpoint configuration.";
  }
  if (isAuthServerError(error) || isAuthTransportError(error)) {
    return "Authentication service is temporarily unavailable. Please try again.";
  }
  return error.message || fallback;
}

async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${backendUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

async function exchangeSessionToken(
  sessionToken: string,
  traceId?: string,
  desiredRole?: "STUDENT" | "PARENT",
) {
  const headers = traceId
    ? {
        "x-auth-trace-id": traceId,
      }
    : undefined;

  const bodyPayload: {
    sessionToken: string;
    desiredRole?: "STUDENT" | "PARENT";
  } = { sessionToken };

  if (desiredRole) {
    bodyPayload.desiredRole = desiredRole;
  }

  return backendFetch<{ token: string; user: AuthUser }>(
    "/api/auth/exchange-neon-token",
    {
      method: "POST",
      headers,
      body: JSON.stringify(bodyPayload),
    },
  );
}

async function loginWithBackendCredentials(
  email: string,
  password: string,
  traceId?: string,
) {
  const headers = traceId
    ? {
        "x-auth-trace-id": traceId,
      }
    : undefined;

  return backendFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password }),
  });
}

async function registerWithBackendCredentials(
  payload: {
    name: string;
    email: string;
    password: string;
    role: "STUDENT" | "PARENT";
  },
  traceId?: string,
) {
  const headers = traceId
    ? {
        "x-auth-trace-id": traceId,
      }
    : undefined;

  return backendFetch<{
    id: string;
    name: string;
    email: string;
    role: AuthUser["role"];
  }>("/api/auth/register", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

async function resolveSessionTokenFromAuthClient() {
  const sessionResponse = await authClient.getSession();
  return sessionResponse.data?.session?.token ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage and validate token with the backend.
  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const stored = getStoredAuth();
      if (!stored) {
        if (active) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setUser(stored.user);
        setToken(stored.token);
      }

      // Validate token and refresh user payload.
      try {
        const me = await backendFetch<{ user: AuthUser }>("/api/auth/me", {
          headers: { Authorization: `Bearer ${stored.token}` },
        });
        if (active) {
          setUser(me.user);
          setToken(stored.token);
          setStoredAuth({ token: stored.token, user: me.user });
        }
      } catch {
        // Token invalid/expired; clear local state.
        clearStoredAuth();
        if (active) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void hydrate();

    const onStorage = (event: StorageEvent) => {
      if (event.key !== "beelearn-auth") return;
      const next = getStoredAuth();
      setUser(next?.user ?? null);
      setToken(next?.token ?? null);
    };

    const onAuthStorageEvent = () => {
      const next = getStoredAuth();
      setUser(next?.user ?? null);
      setToken(next?.token ?? null);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_STORAGE_EVENT, onAuthStorageEvent);

    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_STORAGE_EVENT, onAuthStorageEvent);
    };
  }, []);

  // Authenticate with Better Auth and exchange for backend JWT.
  const login = useCallback(async (email: string, password: string) => {
    const traceId = createTraceId("login");
    let step: AuthFlowStep = "sign-in-email";
    console.info(`${AUTH_LOG_NS} login:start`, {
      traceId,
      email: maskEmail(email),
    });

    try {
      step = "sign-in-email";
      const signInResult = await authClient.signIn.email({
        email,
        password,
      });

      if (signInResult.error) {
        const authError = summarizeAuthClientError(signInResult.error);
        if (shouldFallbackToBackendAuth(authError)) {
          console.warn(
            `${AUTH_LOG_NS} login:sign-in-email:recoverable traceId=${traceId} status=${authError.status ?? "na"} statusText=${authError.statusText ?? "na"} code=${authError.code ?? "na"} message=${authError.message} raw=${authError.raw}`,
          );
          step = "backend-login";
          console.warn(
            `${AUTH_LOG_NS} login:fallback:backend:start traceId=${traceId} reason=${getFallbackReason(authError)}`,
          );
          const result = await loginWithBackendCredentials(
            email,
            password,
            traceId,
          );
          step = "store-auth-state";
          setStoredAuth({ token: result.token, user: result.user });
          setUser(result.user);
          setToken(result.token);
          console.info(
            `${AUTH_LOG_NS} login:fallback:backend:success traceId=${traceId} userId=${result.user.id} role=${result.user.role}`,
          );
          return;
        }
        console.error(
          `${AUTH_LOG_NS} login:sign-in-email:error traceId=${traceId} status=${authError.status ?? "na"} statusText=${authError.statusText ?? "na"} code=${authError.code ?? "na"} message=${authError.message} raw=${authError.raw}`,
        );
        throw new Error(
          toUserFacingAuthMessage(authError, "Invalid email or password."),
        );
      }

      console.info(`${AUTH_LOG_NS} login:sign-in-email:success`, { traceId });

      step = "resolve-session-token";
      const sessionToken = await resolveSessionTokenFromAuthClient();
      if (!sessionToken) {
        console.error(
          `${AUTH_LOG_NS} login:get-session:error traceId=${traceId} message=No active authentication session found.`,
        );
        throw new Error("No active authentication session found.");
      }

      console.info(`${AUTH_LOG_NS} login:get-session:success`, {
        traceId,
        sessionTokenLength: sessionToken.length,
      });

      step = "exchange-session-token";
      const result = await exchangeSessionToken(sessionToken, traceId);

      step = "store-auth-state";
      setStoredAuth({ token: result.token, user: result.user });
      setUser(result.user);
      setToken(result.token);

      console.info(`${AUTH_LOG_NS} login:exchange:success`, {
        traceId,
        userId: result.user.id,
        role: result.user.role,
      });
    } catch (error) {
      console.error(
        `${AUTH_LOG_NS} login:error traceId=${traceId} step=${step} message=${getErrorMessage(error)}`,
      );
      throw error;
    }
  }, []);

  // Register via Better Auth and exchange session when available.
  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      role: "STUDENT" | "PARENT";
    }): Promise<{ autoLoggedIn: boolean }> => {
      const traceId = createTraceId("register");
      let step: AuthFlowStep = "sign-up-email";
      console.info(`${AUTH_LOG_NS} register:start`, {
        traceId,
        email: maskEmail(payload.email),
        role: payload.role,
      });

      try {
        const signUpPayload = {
          name: payload.name,
          email: payload.email,
          password: payload.password,
        } as Parameters<typeof authClient.signUp.email>[0];

        step = "sign-up-email";
        const signUpResult = await authClient.signUp.email(signUpPayload);

        if (signUpResult.error) {
          const authError = summarizeAuthClientError(signUpResult.error);
          if (shouldFallbackToBackendAuth(authError)) {
            console.warn(
              `${AUTH_LOG_NS} register:sign-up-email:recoverable traceId=${traceId} status=${authError.status ?? "na"} statusText=${authError.statusText ?? "na"} code=${authError.code ?? "na"} message=${authError.message} raw=${authError.raw}`,
            );
            step = "backend-register";
            console.warn(
              `${AUTH_LOG_NS} register:fallback:backend-register:start traceId=${traceId} reason=${getFallbackReason(authError)}`,
            );
            await registerWithBackendCredentials(payload, traceId);

            step = "backend-login";
            console.warn(
              `${AUTH_LOG_NS} register:fallback:backend-login:start traceId=${traceId}`,
            );
            const loginResult = await loginWithBackendCredentials(
              payload.email,
              payload.password,
              traceId,
            );

            step = "store-auth-state";
            setStoredAuth({ token: loginResult.token, user: loginResult.user });
            setUser(loginResult.user);
            setToken(loginResult.token);

            console.info(
              `${AUTH_LOG_NS} register:fallback:backend:success traceId=${traceId} userId=${loginResult.user.id} role=${loginResult.user.role}`,
            );
            return { autoLoggedIn: true };
          }
          console.error(
            `${AUTH_LOG_NS} register:sign-up-email:error traceId=${traceId} status=${authError.status ?? "na"} statusText=${authError.statusText ?? "na"} code=${authError.code ?? "na"} message=${authError.message} raw=${authError.raw}`,
          );
          throw new Error(
            toUserFacingAuthMessage(authError, "Registration failed"),
          );
        }

        console.info(`${AUTH_LOG_NS} register:sign-up-email:success`, {
          traceId,
        });

        step = "resolve-session-token";
        const sessionToken = await resolveSessionTokenFromAuthClient();
        if (!sessionToken) {
          console.warn(`${AUTH_LOG_NS} register:auto-login:skipped`, {
            traceId,
            reason: "No active session token after signup",
          });
          return { autoLoggedIn: false };
        }

        step = "exchange-session-token";
        const result = await exchangeSessionToken(
          sessionToken,
          traceId,
          payload.role,
        );

        step = "store-auth-state";
        setStoredAuth({ token: result.token, user: result.user });
        setUser(result.user);
        setToken(result.token);

        console.info(`${AUTH_LOG_NS} register:auto-login:success`, {
          traceId,
          userId: result.user.id,
          role: result.user.role,
        });

        return { autoLoggedIn: true };
      } catch (error) {
        console.error(
          `${AUTH_LOG_NS} register:error traceId=${traceId} step=${step} message=${getErrorMessage(error)}`,
        );

        if (
          step === "resolve-session-token" ||
          step === "exchange-session-token"
        ) {
          return { autoLoggedIn: false };
        }

        throw error;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    void authClient.signOut().catch(() => {});
    clearStoredAuth();
    setUser(null);
    setToken(null);
  }, []);

  const socialLogin = useCallback((provider: SocialProvider) => {
    void authClient.signIn.social({
      provider,
      callbackURL: "/social-callback",
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      socialLogin,
      logout,
    }),
    [user, token, loading, login, register, socialLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
