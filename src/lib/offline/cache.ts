import { get, set } from "idb-keyval";

const CACHE_PREFIX = "beelearn-cache";

function toKey(url: string) {
  return `${CACHE_PREFIX}:${url}`;
}

export function isCacheable(url: string) {
  return (
    url.startsWith("/api/lessons") ||
    url.startsWith("/api/resources") ||
    url.startsWith("/api/modules") ||
    url.startsWith("/api/subjects") ||
    url.startsWith("/api/announcements") ||
    url.startsWith("/api/events") ||
    url.startsWith("/api/attendance") ||
    url.startsWith("/api/parent") ||
    url.startsWith("/api/admin") ||
    url.startsWith("/api/student")
  );
}

export async function setCached<T>(url: string, data: T) {
  await set(toKey(url), { data, storedAt: Date.now() });
}

export async function getCached<T>(url: string): Promise<T | null> {
  const cached = await get<{ data: T }>(toKey(url));
  return cached?.data ?? null;
}
