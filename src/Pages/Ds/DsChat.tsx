import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import styles from './DsChat.module.css';

interface Message {
  text: string;
  isUser: boolean;
}

const SendMsg: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
  };

  useEffect(() => {
    let abortController: AbortController | null = null;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    const startStreaming = async () => {
      if (!input.trim()) {
        console.error("Input cannot be empty");
        return;
      }

      setMessages((prev) => [...prev, { text: input, isUser: true }]);
      console.log("Starting stream with input:", input);
      setIsStreaming(true);

      const url = `https://xiaoyuanzi22333hoho.xyz:6060/stream?input=${encodeURIComponent(input)}`;
      console.log("Request URL:", url);

      try {
        abortController = new AbortController();
        const fetchResponse = await fetch(url, {
          method: "GET",
          headers: { "Accept": "text/event-stream" },
          signal: abortController.signal,
        });

        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }

        reader = fetchResponse.body?.getReader();
        if (!reader) throw new Error("Response body is null");

        let aiResponse = "";
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("[Stream Completed]");
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
                console.log("[Stream Completed]");
                setIsStreaming(false);
                setInput("");
                break;
              } else if (data.startsWith("Error: ")) {
                console.error(data);
                setMessages((prev) => [...prev, { text: data, isUser: false }]);
                setIsStreaming(false);
                break;
              } else {
                console.log(data);
                aiResponse += " " + data;
                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated[updated.length - 1]?.isUser) {
                    updated.push({ text: aiResponse.trim(), isUser: false });
                  } else {
                    updated[updated.length - 1] = { text: aiResponse.trim(), isUser: false };
                  }
                  return updated;
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setMessages((prev) => [...prev, { text: "Error occurred", isUser: false }]);
        setIsStreaming(false);
      }
    };

    if (isStreaming) startStreaming();

    return () => {
      if (abortController) abortController.abort();
      if (reader) reader.cancel();
      setIsStreaming(false);
    };
  }, [isStreaming]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isStreaming && input.trim()) setIsStreaming(true);
  };

  return (
    <div className={styles.chatContainer}>
      <h1 className={styles.title}>Chat Here</h1>
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.isUser ? styles.userMessage : styles.aiMessage}`}
          >
            <span className={styles.messageText}>{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your message"
          disabled={isStreaming}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={isStreaming}
          className={styles.sendButton}
        >
          {isStreaming ? "Streaming..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default SendMsg;