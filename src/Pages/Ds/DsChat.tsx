// DsChat.tsx
import React, { useState, FormEvent } from 'react';
import styles from './DsChat.module.css';
import getChatResponse from './sendMsg.jsx'


// 定义消息的类型
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'other'; // 使用字面量联合类型限制 sender 的值
  timestamp: string;
}

const DsChat : React.FC = () => {
  // 使用类型注解定义状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');

  // 处理消息发送，添加 FormEvent 类型
  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    // 用户的消息
    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    // 自动回复的消息
    const replyMessage: Message = {
      id: Date.now() + 1, // 确保 ID 唯一
      text: 'hello',
      sender: 'other',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages([...messages, userMessage, replyMessage]);
    setInputMessage('');
    // 这里可以添加发送消息到后端的逻辑
    getChatResponse("introduce yourself");
  };

  return (
    <div className={styles.chatContainer}>
      {/* 聊天消息显示区域 */}
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`${styles.message} ${
              message.sender === 'user' ? styles.userMessage : styles.otherMessage
            }`}
          >
            <div className={styles.messageContent}>
              <p>{message.text}</p>
              <span className={styles.timestamp}>{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      {/* 消息输入区域 */}
      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="输入消息..."
          className={styles.messageInput}
          rows={3} // 默认显示3行
        />
        <button type="submit" className={styles.sendButton}>
          发送
        </button>
      </form>
    </div>
  );
}

export default DsChat;