export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "STUDENT" | "PARENT" | "ADMIN" | "TUTOR";
};

export type StoredAuth = {
  token: string;
  user: AuthUser;
};

const STORAGE_KEY = "beelearn-auth";
export const AUTH_STORAGE_EVENT = "beelearn-auth-updated";

function dispatchAuthStorageEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(data: StoredAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  dispatchAuthStorageEvent();
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  dispatchAuthStorageEvent();
}
