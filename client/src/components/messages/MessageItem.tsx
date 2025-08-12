import React from 'react';
import { Bot, User } from 'lucide-react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';

interface Message {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface MessageItemProps {
  message: Message;
  onAction?: (message: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onAction }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const isLoading = message.text === '...';

  return (
    <div className={`message ${message.sender}`}>
      <div className="message-avatar">
        {message.sender === 'user' ? (
          <User size={16} />
        ) : (
          <Bot size={16} />
        )}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {isLoading ? (
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <div className="message-text">
              <MarkdownRenderer content={message.text} onAction={onAction} />
            </div>
          )}
        </div>
        {!isLoading && (
          <div className="message-timestamp">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;


