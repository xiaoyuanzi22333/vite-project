/**
 * Turn fetch failure bodies into a short user-facing string (never full HTML pages).
 */
export function formatChatHttpError(status: number, statusText: string, body: string): string {
  const trimmed = body.trim();

  if (
    /<!DOCTYPE\s+html/i.test(trimmed) ||
    /<html[\s>]/i.test(trimmed) ||
    /cf-error|Bad gateway|502:\s*Bad gateway/i.test(trimmed)
  ) {
    return `请求失败：服务器暂时不可用（HTTP ${status}）。请稍后重试。`;
  }

  if (trimmed) {
    try {
      const j = JSON.parse(trimmed) as { error?: string; message?: string };
      const msg = j.error ?? j.message;
      if (typeof msg === "string" && msg.trim()) {
        return `请求失败（HTTP ${status}）：${msg.trim()}`;
      }
    } catch {
      /* not JSON */
    }
    if (trimmed.length <= 240) {
      return `请求失败（HTTP ${status} ${statusText}）：${trimmed}`;
    }
  }

  return `请求失败（HTTP ${status} ${statusText}）。请稍后重试。`;
}
