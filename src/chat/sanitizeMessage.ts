const MAX_MESSAGE_CHARS = 32_000;

/** Detect reverse-proxy / Cloudflare HTML error pages stored as assistant text. */
function isHtmlErrorPage(text: string): boolean {
  const sample = text.slice(0, 4096);
  return (
    /<!DOCTYPE\s+html/i.test(sample) ||
    /<html[\s>]/i.test(sample) ||
    /cf-error-details|cf-wrapper|502:\s*Bad gateway/i.test(sample)
  );
}

function shortHttpError(status: string): string {
  return `请求失败：服务器暂时不可用（HTTP ${status}）。请稍后重试。`;
}

/**
 * Strip HTML error dumps and oversized blobs from chat message text.
 */
export function sanitizeMessageContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return content;

  if (isHtmlErrorPage(trimmed)) {
    const m = trimmed.match(/\b(502|503|504)\b/);
    return shortHttpError(m?.[1] ?? "502");
  }

  if (/^Error:\s*HTTP\s+\d{3}/i.test(trimmed) && trimmed.length > 400) {
    const m = trimmed.match(/HTTP\s+(\d{3})/i);
    if (m && (trimmed.includes("<!DOCTYPE") || trimmed.includes("<html") || trimmed.length > 2000)) {
      return shortHttpError(m[1]);
    }
    if (trimmed.length > 600) {
      return `请求失败（HTTP ${m?.[1] ?? "?"}）。请稍后重试。`;
    }
  }

  if (trimmed.length > MAX_MESSAGE_CHARS) {
    return `${trimmed.slice(0, MAX_MESSAGE_CHARS)}…\n\n（内容过长已截断）`;
  }

  return content;
}

export function isSanitizedErrorMessage(content: string): boolean {
  const t = content.trim();
  return t.startsWith("请求失败") || /^Error:\s*HTTP\s+\d{3}/i.test(t);
}
