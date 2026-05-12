import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Switch, Tooltip } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import styles from "./AssistantChat.module.css";
import { MarkdownMessage } from "../ui/MarkdownMessage";
import { useAuth } from "../auth/AuthProvider";

type ChatRole = "user" | "assistant";

interface Message {
  role: ChatRole;
  content: string;
  reasoning?: string;
}

function getReasoningPreview(reasoning: string): string {
  const compact = reasoning.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  // Show a longer live preview so users can see progress, without dumping everything.
  return compact.length > 800 ? `${compact.slice(0, 800)}…` : compact;
}

const AssistantChat: React.FC = () => {
  const { isAuthed } = useAuth();
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [showReasoning, setShowReasoning] = useState<boolean>(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
  };

  useEffect(() => {
    let abortController: AbortController | null = null;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    const startStreaming = async () => {
      if (!isAuthed) {
        setIsStreaming(false);
        return;
      }
      if (!input.trim()) {
        console.error("Input cannot be empty");
        return;
      }

      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setIsStreaming(true);

      const baseUrl = "http://100.100.102.102:8000";
      const model = "glm-4.7-flash";
      const url = `${baseUrl}/v1/chat/completions`;

      try {
        abortController = new AbortController();
        const fetchResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            model,
            stream: true,
            messages: [{ role: "user", content: input }],
          }),
          signal: abortController.signal,
        });

        if (!fetchResponse.ok) {
          const errText = await fetchResponse.text().catch(() => "");
          throw new Error(
            `HTTP ${fetchResponse.status} ${fetchResponse.statusText}${
              errText ? ` — ${errText}` : ""
            }`,
          );
        }

        reader = fetchResponse.body?.getReader() ?? null;
        if (!reader) throw new Error("Response body is null");

        let assistantContent = "";
        let assistantReasoning = "";
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsStreaming(false);
            setInput("");
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice("data: ".length).trim();
              if (data === "[DONE]") {
                setIsStreaming(false);
                setInput("");
                break;
              } else if (data.startsWith("Error: ")) {
                setMessages((prev) => [...prev, { role: "assistant", content: data }]);
                setIsStreaming(false);
                break;
              } else {
                // vLLM OpenAI-compatible stream:
                // data: {"choices":[{"delta":{"content":"...","reasoning":"..."}}], ...}
                try {
                  const payload: unknown = JSON.parse(data);
                  const choice0 =
                    typeof payload === "object" &&
                    payload !== null &&
                    "choices" in payload &&
                    Array.isArray((payload as { choices?: unknown }).choices)
                      ? (payload as { choices: unknown[] }).choices[0]
                      : null;

                  const deltaObj =
                    typeof choice0 === "object" && choice0 !== null && "delta" in choice0
                      ? (choice0 as { delta?: unknown }).delta
                      : null;

                  const deltaContent =
                    typeof deltaObj === "object" &&
                    deltaObj !== null &&
                    "content" in deltaObj &&
                    typeof (deltaObj as { content?: unknown }).content === "string"
                      ? ((deltaObj as { content: string }).content as string)
                      : "";

                  const deltaReasoning =
                    typeof deltaObj === "object" &&
                    deltaObj !== null &&
                    "reasoning" in deltaObj &&
                    typeof (deltaObj as { reasoning?: unknown }).reasoning === "string"
                      ? ((deltaObj as { reasoning: string }).reasoning as string)
                      : "";

                  if (deltaContent) assistantContent += deltaContent;
                  if (deltaReasoning) assistantReasoning += deltaReasoning;

                  if (!deltaContent && !deltaReasoning) continue;
                } catch {
                  // Fallback: append raw data if not JSON
                  assistantContent += (assistantContent ? " " : "") + data;
                }
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  const nextAssistant: Message = {
                    role: "assistant",
                    content: assistantContent.trim(),
                    reasoning: assistantReasoning.trim() || undefined,
                  };

                  if (!last || last.role === "user") updated.push(nextAssistant);
                  else updated[updated.length - 1] = nextAssistant;
                  return updated;
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        const msg =
          error instanceof Error
            ? `Error: ${error.message}`
            : "Error: request failed (unknown)";
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
        setIsStreaming(false);
      }
    };

    if (isStreaming) startStreaming();

    return () => {
      if (abortController) abortController.abort();
      if (reader) reader.cancel();
      setIsStreaming(false);
    };
  // Streaming is started only by toggling isStreaming; including `input` would restart mid-stream.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [isStreaming, isAuthed]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isAuthed) return;
    if (!isStreaming && input.trim()) setIsStreaming(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <Link to="/" className={styles.backLink}>
          ← Home
        </Link>
        <h1 className={styles.title}>Assistant</h1>
        <div className={styles.toolbarRight}>
          <Tooltip title={showReasoning ? "隐藏思维链（只看缩影）" : "显示思维链（摘要/概览）"}>
            <Switch
              checked={showReasoning}
              onChange={setShowReasoning}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </Tooltip>
        </div>
      </header>

      <div className={styles.chatContainer}>
        <div className={styles.panel}>
          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <p className={styles.emptyHint}>
                {isAuthed ? "Send a message to stream a reply from your server." : "Login Required."}
              </p>
            )}
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const reasoningPreview =
                msg.role === "assistant" && msg.reasoning ? getReasoningPreview(msg.reasoning) : "";
              const shouldShowReasoning =
                !isUser && showReasoning && (reasoningPreview || isStreaming);

              return (
                <div
                  key={index}
                  className={`${styles.message} ${isUser ? styles.userMessage : styles.aiMessage}`}
                >
                  <div className={styles.messageBubble}>
                    {shouldShowReasoning ? (
                      <div className={styles.reasoningBlock}>
                        <div className={styles.reasoningLabel}>Reasoning (live preview)</div>
                        <pre className={styles.reasoningText}>
                          {reasoningPreview || "Thinking…"}
                        </pre>
                      </div>
                    ) : null}
                    <div className={styles.messageText}>
                      <MarkdownMessage content={msg.content} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={isAuthed ? "Message…" : "Login required"}
              disabled={isStreaming || !isAuthed}
              className={styles.input}
              autoComplete="off"
            />
            <button type="submit" disabled={isStreaming || !isAuthed} className={styles.sendButton}>
              {isStreaming ? "…" : "Send"}
            </button>
          </form>
        </div>
        <p className={styles.hint}>
          Replies stream from your configured endpoint. If nothing appears, check the network and
          server logs.
        </p>
      </div>
    </div>
  );
};

export default AssistantChat;
