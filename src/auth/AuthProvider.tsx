import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type AuthContextValue = {
  user: string | null;
  isAuthed: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  register: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUsername(u: string) {
  return u.trim();
}

function authBaseUrl() {
  // Default to same-origin (if you reverse-proxy backend), else allow override.
  return (import.meta.env.VITE_AUTH_BASE_URL as string | undefined)?.trim() || "";
}

async function jsonFetch<T>(path: string, init: RequestInit): Promise<T> {
  const url = `${authBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include",
  });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const parsed = isJson ? ((await res.json().catch(() => null)) as unknown) : null;
  if (!res.ok) {
    const serverError =
      parsed &&
      typeof parsed === "object" &&
      parsed !== null &&
      "error" in parsed &&
      typeof (parsed as { error?: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : null;

    const hint = authBaseUrl()
      ? `Check VITE_AUTH_BASE_URL (${authBaseUrl()}).`
      : "In dev, ensure Vite proxy for /auth points to your backend.";

    throw new Error(serverError || `HTTP ${res.status} ${res.statusText}. ${hint}`);
  }

  if (!parsed) {
    const hint = authBaseUrl()
      ? `Check VITE_AUTH_BASE_URL (${authBaseUrl()}).`
      : "In dev, ensure Vite proxy for /auth points to your backend.";
    throw new Error(`Expected JSON but got ${res.status}. ${hint}`);
  }

  return parsed as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await jsonFetch<{ ok: true; user: null | { username: string } }>("/auth/me", {
          method: "GET",
        });
        if (cancelled) return;
        setUser(me.user?.username ?? null);
      } catch {
        if (cancelled) return;
        setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAuthed: !!user,
      isLoading,
      login: async (username: string, password: string) => {
        const u = normalizeUsername(username);
        if (!u) return { ok: false, error: "Username is required." };
        if (!password) return { ok: false, error: "Password is required." };
        try {
          const out = await jsonFetch<
            { ok: true; user: { username: string } } | { ok: false; error: string }
          >("/auth/login", { method: "POST", body: JSON.stringify({ username: u, password }) });
          if (!out.ok) return out;
          setUser(out.user.username);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "Login failed." };
        }
      },
      logout: async () => {
        try {
          await jsonFetch<{ ok: true }>("/auth/logout", { method: "POST", body: JSON.stringify({}) });
        } catch {
          // ignore
        } finally {
          setUser(null);
        }
      },
      register: async (username: string, password: string) => {
        const u = normalizeUsername(username);
        if (!u) return { ok: false, error: "Username is required." };
        if (u.length < 2) return { ok: false, error: "Username must be at least 2 characters." };
        if (!password) return { ok: false, error: "Password is required." };
        if (password.length < 3) return { ok: false, error: "Password must be at least 3 characters." };
        try {
          const out = await jsonFetch<
            { ok: true; user: { username: string } } | { ok: false; error: string }
          >("/auth/register", { method: "POST", body: JSON.stringify({ username: u, password }) });
          if (!out.ok) return out;
          setUser(out.user.username);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "Register failed." };
        }
      },
    };
  }, [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with AuthProvider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

