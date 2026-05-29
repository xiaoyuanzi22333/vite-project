import { formatChatHttpError } from "./formatChatError";

export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | { type: "status"; message: string }
  | { type: "tool_start"; name: string; args: Record<string, string>; label: string }
  | { type: "tool_done"; name: string; label: string }
  | { type: "done"; session_id: string }
  | { type: "error"; message: string };

/** Same-origin prefix for bot_backend (Vite dev proxies /api/chat → :12000/chat). */
export function chatApiPrefix(): string {
  const override = (import.meta.env.VITE_CHAT_BASE_URL as string | undefined)?.trim();
  if (override) return override.replace(/\/$/, "");
  return "/api";
}

function parseSsePayload(raw: string): ChatStreamEvent | null {
  try {
    const obj = JSON.parse(raw) as unknown;
    if (typeof obj !== "object" || obj === null || !("type" in obj)) return null;
    const t = (obj as { type: unknown }).type;

    if (t === "delta" && typeof (obj as { text?: unknown }).text === "string") {
      return { type: "delta", text: (obj as { text?: unknown }).text as string };
    }
    if (t === "status" && typeof (obj as { message?: unknown }).message === "string") {
      return {
        type: "status",
        message: (obj as { message?: unknown }).message as string,
      };
    }
    if (t === "tool_start") {
      const o = obj as { name?: unknown; args?: unknown; label?: unknown };
      const args =
        o.args && typeof o.args === "object" && o.args !== null
          ? Object.fromEntries(
              Object.entries(o.args as Record<string, unknown>).map(([k, v]) => [k, String(v)]),
            )
          : {};
      return {
        type: "tool_start",
        name: String(o.name ?? "tool"),
        args,
        label: String(o.label ?? o.name ?? "正在调用工具…"),
      };
    }
    if (t === "tool_done") {
      const o = obj as { name?: unknown; label?: unknown };
      return {
        type: "tool_done",
        name: String(o.name ?? "tool"),
        label: String(o.label ?? "完成"),
      };
    }
    if (t === "done") {
      return {
        type: "done",
        session_id: String((obj as { session_id?: unknown }).session_id ?? ""),
      };
    }
    if (t === "error") {
      return {
        type: "error",
        message: String((obj as { message?: unknown }).message ?? "Chat stream failed"),
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Stream assistant reply from bot_backend POST /chat/stream (SSE).
 */
export async function streamChatReply(
  sessionId: string,
  message: string,
  signal: AbortSignal,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  const url = `${chatApiPrefix()}/chat/stream`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ session_id: sessionId, message }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(formatChatHttpError(res.status, res.statusText, errText));
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Response body is null");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";

    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const raw = trimmed.slice(trimmed.indexOf(":") + 1).trim();
      if (!raw) continue;

      const event = parseSsePayload(raw);
      if (!event) continue;
      onEvent(event);
      if (event.type === "error") throw new Error(event.message);
      if (event.type === "done") return;
    }
  }
}
