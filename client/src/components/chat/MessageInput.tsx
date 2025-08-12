import React, { useState, KeyboardEvent } from 'react';
import { useAccessibility } from '../accessibility/AccessibilityProvider.tsx';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isConnected: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  isConnected 
}) => {
  const [input, setInput] = useState('');
  const { reducedMotion } = useAccessibility();

  const handleSend = () => {
    if (input.trim() && !isLoading && isConnected) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    if (!isConnected) return 'Connecting...';
    if (isLoading) return 'AI is typing...';
    return 'Type your message...';
  };

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading || !isConnected}
          placeholder={getPlaceholder()}
          maxLength={1000}
          {...(reducedMotion ? { inputMode: 'text' } : {})}
        />
      </div>
      <button 
        className="send-button"
        onClick={handleSend} 
        disabled={isLoading || !isConnected || !input.trim()}
        title="Send message"
      >
        <Send />
      </button>
    </div>
  );
};

export default MessageInput;


