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
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const isLoading = message.text === '...';
  const isUser = message.sender === 'user';

  return (
    <div className={`group flex gap-3 ${isUser ? 'self-end flex-row-reverse' : 'self-start'} max-w-[85%]`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-brand-500 text-white' : 'bg-surface-elevated text-slate-100 border-2 border-border'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {/* Bubble */}
        <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed break-words ${
          isUser
            ? 'bg-brand-500 text-white rounded-br-sm'
            : 'bg-surface-card text-slate-100 border border-border rounded-bl-sm shadow-sm'
        }`}>
          {isLoading ? (
            <div className="flex gap-1 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '-0.32s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '-0.16s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
            </div>
          ) : (
            <MarkdownRenderer content={message.text} onAction={onAction} />
          )}
        </div>

        {/* Timestamp — visible on hover */}
        {!isLoading && (
          <div className={`text-xs text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;


