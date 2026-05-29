import { sanitizeMessageContent } from "./sanitizeMessage";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
};

/** `{username}_{ISO timestamp with safe chars}` */
export function buildSessionId(username: string, firstMessageAt: Date): string {
  const ts = firstMessageAt.toISOString().replace(/[:.]/g, "-");
  return `${username}_${ts}`;
}

function storageKey(username: string): string {
  return `assistant_chat_sessions_${username}`;
}

function sanitizeSession(session: ChatSession): ChatSession {
  return {
    ...session,
    title: sanitizeMessageContent(session.title).slice(0, 80) || "New chat",
    messages: session.messages.map((m) => ({
      ...m,
      content: sanitizeMessageContent(m.content),
    })),
  };
}

export function loadSessions(username: string): ChatSession[] {
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const sessions = parsed
      .filter(
        (s): s is ChatSession =>
          typeof s === "object" &&
          s !== null &&
          typeof (s as ChatSession).id === "string" &&
          Array.isArray((s as ChatSession).messages),
      )
      .map(sanitizeSession);

    const cleaned = JSON.stringify(sessions);
    if (cleaned !== raw) {
      localStorage.setItem(storageKey(username), cleaned);
    }
    return sessions;
  } catch {
    return [];
  }
}
export function saveSessions(username: string, sessions: ChatSession[]): void {
  localStorage.setItem(storageKey(username), JSON.stringify(sessions));
}

export function sessionTitleFromFirstMessage(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return "New chat";
  return t.length > 48 ? `${t.slice(0, 48)}…` : t;
}
