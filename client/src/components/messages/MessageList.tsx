import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../accessibility/AccessibilityProvider';
import MessageItem from './MessageItem';
import { WelcomeScreen } from '../layout/WelcomeScreen';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  onAction?: (message: string) => void;
  onSendMessage?: (message: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onAction, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAccessibility();

  useEffect(() => {
    if (!reducedMotion) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, reducedMotion]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-surface-elevated flex flex-col">
        <WelcomeScreen onSendMessage={onSendMessage} />
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-surface-elevated flex flex-col gap-4">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} onAction={onAction} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;


