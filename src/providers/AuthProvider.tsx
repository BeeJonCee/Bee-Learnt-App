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
import type { AuthUser } from "@/lib/auth/storage";
import {
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
  }) => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, code: string) => Promise<void>;
  socialLogin: (provider: SocialProvider) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

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
    window.addEventListener("storage", onStorage);

    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await backendFetch<{ token: string; user: AuthUser }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );

    setStoredAuth({ token: result.token, user: result.user });
    setUser(result.user);
    setToken(result.token);
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      role: "STUDENT" | "PARENT";
    }) => {
      await backendFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    [],
  );

  const sendEmailOtp = useCallback(async (email: string) => {
    await backendFetch("/api/auth/verify/send", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, code: string) => {
    await backendFetch("/api/auth/verify/confirm", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  }, []);

  const socialLogin = useCallback((provider: SocialProvider) => {
    import("@/lib/auth/client").then(({ authClient }) => {
      authClient.signIn.social({
        provider,
        callbackURL: "/social-callback",
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      sendEmailOtp,
      verifyEmailOtp,
      socialLogin,
      logout,
    }),
    [
      user,
      token,
      loading,
      login,
      register,
      sendEmailOtp,
      verifyEmailOtp,
      socialLogin,
      logout,
    ],
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
