import React, { useState, useEffect, FormEvent, ChangeEvent, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import styles from "./AssistantChat.module.css";
import { MarkdownMessage } from "../ui/MarkdownMessage";
import { useAuth } from "../auth/AuthProvider";
import { streamChatReply } from "../api/chatApi";
import {
  buildSessionId,
  loadSessions,
  saveSessions,
  sessionTitleFromFirstMessage,
  type ChatMessage,
  type ChatSession,
} from "../chat/chatSessions";
import { isSanitizedErrorMessage, sanitizeMessageContent } from "../chat/sanitizeMessage";

const AssistantChat: React.FC = () => {
  const { isAuthed, user } = useAuth();
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamActivity, setStreamActivity] = useState<string[]>([]);
  const pendingMessageRef = useRef<string>("");
  const activeSessionIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      return;
    }
    const loaded = loadSessions(user);
    setSessions(loaded);
    if (loaded.length > 0) {
      const latest = loaded[0];
      setActiveSessionId(latest.id);
      setMessages(latest.messages);
    } else {
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [user]);

  const persistSession = useCallback(
    (sessionId: string, nextMessages: ChatMessage[], title?: string) => {
      if (!user) return;
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === sessionId);
        const now = new Date().toISOString();
        let next: ChatSession[];
        const cleanedMessages = nextMessages.map((m) => ({
          ...m,
          content: sanitizeMessageContent(m.content),
        }));
        if (idx >= 0) {
          next = [...prev];
          next[idx] = {
            ...next[idx],
            messages: cleanedMessages,
            title: title ?? next[idx].title,
          };
        } else {
          const firstUser = nextMessages.find((m) => m.role === "user");
          next = [
            {
              id: sessionId,
              title: title ?? sessionTitleFromFirstMessage(firstUser?.content ?? "New chat"),
              createdAt: now,
              messages: cleanedMessages,
            },
            ...prev,
          ];
        }
        next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        saveSessions(user, next);
        return next;
      });
    },
    [user],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
  };

  useEffect(() => {
    let abortController: AbortController | null = null;

    const startStreaming = async () => {
      if (!isAuthed || !user) {
        setIsStreaming(false);
        return;
      }

      const userText = pendingMessageRef.current.trim();
      if (!userText) {
        setIsStreaming(false);
        return;
      }

      const sessionId = activeSessionIdRef.current;
      if (!sessionId) {
        setIsStreaming(false);
        return;
      }

      let assistantContent = "";
      setStreamActivity([]);

      try {
        abortController = new AbortController();
        await streamChatReply(sessionId, userText, abortController.signal, (event) => {
          if (event.type === "status") {
            setStreamActivity((prev) => {
              if (prev[prev.length - 1] === event.message) return prev;
              return [...prev, event.message];
            });
            return;
          }
          if (event.type === "tool_start") {
            setStreamActivity((prev) => {
              if (prev[prev.length - 1] === event.label) return prev;
              return [...prev, event.label];
            });
            return;
          }
          if (event.type === "tool_done") {
            setStreamActivity((prev) => [...prev, `✓ ${event.label}`]);
            return;
          }
          if (event.type === "delta") {
            assistantContent += event.text;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              const nextAssistant: ChatMessage = {
                role: "assistant",
                content: assistantContent,
              };
              if (!last || last.role === "user") updated.push(nextAssistant);
              else updated[updated.length - 1] = nextAssistant;
              persistSession(sessionId!, updated);
              return updated;
            });
          }
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Fetch error:", error);
        const msg =
          error instanceof Error
            ? sanitizeMessageContent(error.message)
            : "请求失败，请稍后重试。";
        setMessages((prev) => {
          const next = [...prev, { role: "assistant" as const, content: msg }];
          persistSession(sessionId!, next);
          return next;
        });
      } finally {
        setIsStreaming(false);
        setStreamActivity([]);
        setInput("");
        pendingMessageRef.current = "";
      }
    };

    if (isStreaming) startStreaming();

    return () => {
      abortController?.abort();
    };
  }, [isStreaming, isAuthed, user, persistSession]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isAuthed || !user) return;
    const text = input.trim();
    if (!isStreaming && text) {
      pendingMessageRef.current = text;

      let sessionId = activeSessionIdRef.current;
      if (!sessionId) {
        sessionId = buildSessionId(user, new Date());
        setActiveSessionId(sessionId);
        activeSessionIdRef.current = sessionId;
      }

      const title = sessionTitleFromFirstMessage(text);
      setMessages((prev) => {
        const next = [...prev, { role: "user" as const, content: text }];
        persistSession(sessionId!, next, title);
        return next;
      });
      setIsStreaming(true);
    }
  };

  const startNewChat = () => {
    if (isStreaming) return;
    setActiveSessionId(null);
    activeSessionIdRef.current = null;
    setMessages([]);
    setInput("");
  };

  const selectSession = (session: ChatSession) => {
    if (isStreaming || session.id === activeSessionId) return;
    setActiveSessionId(session.id);
    activeSessionIdRef.current = session.id;
    setMessages(session.messages);
    setInput("");
  };

  const formatSessionTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <Link to="/" className={styles.backLink}>
          ← Home
        </Link>
        <h1 className={styles.title}>Assistant</h1>
        <button
          type="button"
          className={styles.sidebarToggleToolbar}
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? "Expand history" : "Collapse history"}
          title={sidebarCollapsed ? "Show history" : "Hide history"}
        >
          {sidebarCollapsed ? "☰" : "◧"}
        </button>
      </header>

      <div
        className={`${styles.layout} ${sidebarCollapsed ? styles.layoutSidebarCollapsed : ""}`}
      >
        <aside
          className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}
          aria-label="Chat history"
        >
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarTitle}>History</span>
              <button
                type="button"
                className={styles.sidebarCollapseBtn}
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse history"
              >
                ‹
              </button>
            </div>
            <button
              type="button"
              className={styles.newChatBtn}
              onClick={startNewChat}
              disabled={!isAuthed || isStreaming}
            >
              + New chat
            </button>
            <ul className={styles.sessionList}>
              {sessions.length === 0 && (
                <li className={styles.sessionEmpty}>No conversations yet</li>
              )}
              {sessions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`${styles.sessionItem} ${
                      s.id === activeSessionId ? styles.sessionItemActive : ""
                    }`}
                    onClick={() => selectSession(s)}
                    disabled={isStreaming}
                    title={s.id}
                  >
                    <span className={styles.sessionItemTitle}>{s.title}</span>
                    <span className={styles.sessionItemMeta}>
                      {formatSessionTime(s.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {sidebarCollapsed && (
          <button
            type="button"
            className={styles.sidebarExpandTab}
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Expand history"
          >
            History
          </button>
        )}

        <div className={styles.mainColumn}>
          <div className={styles.chatContainer}>
            <div className={styles.panel}>
              {activeSessionId && (
                <div className={styles.sessionBar}>
                  <span className={styles.sessionBarLabel}>Session</span>
                  <code className={styles.sessionBarId}>{activeSessionId}</code>
                </div>
              )}
              <div className={styles.messagesContainer}>
                {messages.length === 0 && (
                  <p className={styles.emptyHint}>
                    {isAuthed
                      ? "Send a message to start a new conversation."
                      : "Login Required."}
                  </p>
                )}
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  const isError = !isUser && isSanitizedErrorMessage(msg.content);
                  const isLastAssistant =
                    !isUser && index === messages.length - 1 && isStreaming;
                  return (
                    <div
                      key={index}
                      className={`${styles.message} ${isUser ? styles.userMessage : styles.aiMessage}`}
                    >
                      <div className={styles.messageBubble}>
                        {isLastAssistant && streamActivity.length > 0 && (
                          <div className={styles.activityBlock} aria-live="polite">
                            <div className={styles.activityLabel}>In progress</div>
                            <ul className={styles.activityList}>
                              {streamActivity.map((line, i) => (
                                <li key={`${i}-${line}`}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div
                          className={`${styles.messageText} ${isError ? styles.messageTextError : ""}`}
                        >
                          {isError ? (
                            <p className={styles.errorPlain}>{msg.content}</p>
                          ) : msg.content ? (
                            <MarkdownMessage content={msg.content} />
                          ) : isLastAssistant ? (
                            <p className={styles.typingHint}>Waiting for response…</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
                  <div className={`${styles.message} ${styles.aiMessage}`}>
                    <div className={styles.messageBubble}>
                      {streamActivity.length > 0 && (
                        <div className={styles.activityBlock} aria-live="polite">
                          <div className={styles.activityLabel}>In progress</div>
                          <ul className={styles.activityList}>
                            {streamActivity.map((line, i) => (
                              <li key={`${i}-${line}`}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className={styles.messageText}>
                        <p className={styles.typingHint}>Waiting for response…</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} aria-hidden />
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
                <button
                  type="submit"
                  disabled={isStreaming || !isAuthed}
                  className={styles.sendButton}
                >
                  {isStreaming ? "…" : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;
