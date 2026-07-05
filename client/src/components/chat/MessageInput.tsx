import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isConnected: boolean;
}

const models = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, isConnected }) => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 128) + 'px';
  }, []);

  const handleSend = () => {
    if (input.trim() && !isLoading && isConnected) {
      onSendMessage(input.trim());
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const disabled = isLoading || !isConnected;
  const placeholder = !isConnected ? 'Connecting...' : isLoading ? 'AI is typing...' : 'Type your message...';

  return (
    <div className="p-4 bg-surface border-t border-border shrink-0">
      <div className="flex gap-3 items-end">
        {/* Model selector */}
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="h-11 px-3 rounded-xl border border-border bg-surface text-text-secondary text-xs font-medium appearance-none cursor-pointer hover:border-brand-400/50 focus:outline-none focus:border-brand-400 shrink-0"
          disabled={disabled}
          aria-label="Select model"
        >
          {models.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={1000}
            rows={1}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-surface text-slate-100 resize-none min-h-[44px] max-h-32 leading-relaxed focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-text-muted transition-colors"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="bg-brand-500 text-white rounded-xl p-3 min-w-[44px] h-11 flex items-center justify-center hover:bg-brand-400 hover:scale-105 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all"
          title="Send message"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;


