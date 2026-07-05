import React, { useMemo, useState } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import { useChatApi } from '../../hooks/useChatApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import MessageList from '../messages/MessageList';
import MessageInput from './MessageInput';

const Chat: React.FC = () => {
  const [demoMode, setDemoMode] = useState(false);

  const { transport, wsUrl } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const paramTransport = params.get('transport');
    const storageTransport = localStorage.getItem('chat:transport');
    const envTransport = (import.meta as any).env?.VITE_CHAT_TRANSPORT as string | undefined;
    const selected = (paramTransport || storageTransport || envTransport || 'api').toLowerCase();
    const wsUrlParam = params.get('wsUrl') || (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:3001';
    return {
      transport: (selected === 'ws' ? 'ws' : 'api') as 'api' | 'ws',
      wsUrl: wsUrlParam,
    };
  }, []);

  const chatApi = useChatApi();
  const chatWs = useWebSocket(wsUrl);
  const { messages, isConnected, isLoading, sendMessage, clearMessages } = transport === 'ws' ? chatWs : chatApi;

  const handleSend = (message: string) => {
    if (message.toLowerCase().includes('demo')) {
      setDemoMode(true);
    }
    sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Demo mode indicator */}
      {demoMode && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-medium z-20">
          DEMO MODE
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
        <h2 className="m-0 text-lg font-semibold text-text-primary flex items-center gap-2">
          <MessageCircle size={20} />
          AI Assistant
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted font-medium">{transport.toUpperCase()}</span>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse inline-block" />
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
          <button
            onClick={clearMessages}
            className="p-2 rounded text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
            title="Clear chat history"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        onAction={(msg) => sendMessage(msg)}
        onSendMessage={handleSend}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSend}
        isLoading={isLoading}
        isConnected={isConnected}
      />
    </div>
  );
};

export default Chat;


