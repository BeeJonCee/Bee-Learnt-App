import { useCallback, useEffect, useState } from "react";
import { AUTH_STORAGE_EVENT } from "@/lib/auth/storage";
import { getCached, isCacheable, setCached } from "@/lib/offline/cache";
import { apiFetch } from "@/lib/utils/api";

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState<string | null>(null);
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const bumpAuthVersion = () => {
      setAuthVersion((value) => value + 1);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== "beelearn-auth") return;
      bumpAuthVersion();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_STORAGE_EVENT, bumpAuthVersion);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_STORAGE_EVENT, bumpAuthVersion);
    };
  }, []);

  const fetchData = useCallback(async () => {
    void authVersion;
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch<T>(url);
      setData(response);
      if (isCacheable(url)) {
        await setCached(url, response);
      }
    } catch (err) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (isOffline && isCacheable(url)) {
        const cached = await getCached<T>(url);
        if (cached) {
          setData(cached);
          setError("Offline mode: showing cached content.");
        } else {
          setError(err instanceof Error ? err.message : "Request failed");
        }
      } else {
        setError(err instanceof Error ? err.message : "Request failed");
      }
    } finally {
      setLoading(false);
    }
  }, [url, authVersion]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}
