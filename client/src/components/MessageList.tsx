import React, { useEffect, useRef } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import MessageItem from './MessageItem';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  onAction?: (message: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onAction }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAccessibility();

  const scrollToBottom = () => {
    if (reducedMotion) return; // Evitar desplazamientos en modo de movimiento reducido
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="messages">
        <div className="welcome-message">
          <h3>Welcome to AI Chat</h3>
          <p>Start a conversation by typing a message below.</p>
        </div>
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="messages">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} onAction={onAction} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;