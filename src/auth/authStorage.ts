export type StoredUser = {
  username: string;
  password: string;
  createdAt?: string;
  lastLoginAt?: string;
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readUsers(): StoredUser[] {
  const parsed = safeJsonParse<unknown>(null);
  if (Array.isArray(parsed)) {
    return parsed.filter(
      (u): u is StoredUser =>
        typeof u === "object" &&
        u !== null &&
        "username" in u &&
        "password" in u &&
        typeof (u as { username?: unknown }).username === "string" &&
        typeof (u as { password?: unknown }).password === "string" &&
        (!("createdAt" in u) || typeof (u as { createdAt?: unknown }).createdAt === "string") &&
        (!("lastLoginAt" in u) || typeof (u as { lastLoginAt?: unknown }).lastLoginAt === "string"),
    );
  }
  return [];
}

export function writeUsers(users: StoredUser[]) {
  void users;
}

export function ensureSeedUsers() {
}

export function readSessionUser(): string | null {
  return null;
}

export function writeSessionUser(username: string | null) {
  void username;
}

