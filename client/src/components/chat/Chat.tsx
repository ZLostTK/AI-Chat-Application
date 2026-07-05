import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { MessageCircle, Trash2, Wifi, WifiOff, Key } from 'lucide-react';
import { useChatApi } from '../../hooks/useChatApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import MessageList from '../messages/MessageList';
import MessageInput from './MessageInput';
import { ApiKeyModal } from '../layout/ApiKeyModal';

interface ChatProps {
  onNewChat?: () => void;
}

function generateId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function saveHistory(messages: any[]) {
  if (messages.length === 0) return;
  const title = messages.find((m: any) => m.sender === 'user')?.text?.slice(0, 50) || 'Chat';
  const chatId = localStorage.getItem('chat:activeId') || generateId();
  localStorage.setItem('chat:activeId', chatId);

  const all = JSON.parse(localStorage.getItem('chat:conversations') || '{}');
  all[chatId] = messages;
  localStorage.setItem('chat:conversations', JSON.stringify(all));

  const history = JSON.parse(localStorage.getItem('chat:history') || '[]');
  const idx = history.findIndex((h: any) => h.id === chatId);
  const entry = { id: chatId, title, timestamp: Date.now() };
  if (idx >= 0) history[idx] = entry;
  else history.unshift(entry);
  localStorage.setItem('chat:history', JSON.stringify(history.slice(0, 50)));
}

const Chat: React.FC<ChatProps> = () => {
  const [demoMode, setDemoMode] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini:apiKey') || '');
  const [showKeyModal, setShowKeyModal] = useState(!apiKey);
  const [models, setModels] = useState<{ value: string; label: string }[]>([]);

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

  const chatApi = useChatApi(apiKey);
  const chatWs = useWebSocket(wsUrl, apiKey);
  const { messages, isConnected, isLoading, sendMessage, clearMessages, loadMessages } = transport === 'ws' ? chatWs : chatApi;

  // Fetch available models from Gemini API
  useEffect(() => {
    if (!apiKey) return;
    const fetchModels = async () => {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
        );
        const data = await resp.json();
        if (data?.models) {
          const geminiModels = data.models
            .filter((m: any) =>
              m.name.startsWith('models/gemini') &&
              m.supportedGenerationMethods?.includes('generateContent')
            )
            .map((m: any) => ({
              value: m.name.replace('models/', ''),
              label: m.displayName || m.name.replace('models/', ''),
            }));
          if (geminiModels.length > 0) setModels(geminiModels);
        }
      } catch { /* keep defaults */ }
    };
    fetchModels();
  }, [apiKey]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) saveHistory(messages);
  }, [messages]);

  // Expose clearMessages globally for sidebar "New Chat"
  useEffect(() => {
    (window as any).__chatClearMessages = () => {
      clearMessages();
      localStorage.removeItem('chat:activeId');
      localStorage.removeItem('chat:activeMessages');
    };
    return () => { delete (window as any).__chatClearMessages; };
  }, [clearMessages]);

  // Listen for chat:load custom event (sidebar history click)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id && detail?.messages) {
        loadMessages(detail.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        localStorage.setItem('chat:activeId', detail.id);
      }
    };
    window.addEventListener('chat:load', handler);
    return () => window.removeEventListener('chat:load', handler);
  }, [loadMessages]);

  const handleSend = useCallback((message: string, model?: string) => {
    if (message.toLowerCase().includes('demo')) setDemoMode(true);
    sendMessage(message, model);
  }, [sendMessage]);

  const handleSaveKey = useCallback((key: string) => {
    setApiKey(key);
    setShowKeyModal(false);
  }, []);

  const showKeyNeeded = !apiKey && transport === 'api';

  return (
    <div className="flex flex-col h-full relative">
      <ApiKeyModal open={showKeyModal} onSave={handleSaveKey} onClose={() => setShowKeyModal(false)} />

      {demoMode && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-medium z-20">
          DEMO MODE
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
        <h2 className="m-0 text-lg font-semibold text-text-primary flex items-center gap-2">
          <MessageCircle size={20} />
          AI Assistant
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted font-medium">{transport.toUpperCase()}</span>

          <div className="flex items-center gap-2 text-sm">
            {showKeyNeeded ? (
              <button
                onClick={() => setShowKeyModal(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              >
                <Key size={14} />
                <span>API Key Needed</span>
              </button>
            ) : isConnected ? (
              <span className="flex items-center gap-1.5 text-semantic-success">
                <Wifi size={14} />
                <span>Connected</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-text-muted">
                <WifiOff size={14} />
                <span>Disconnected</span>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              clearMessages();
              localStorage.removeItem('chat:activeId');
              localStorage.removeItem('chat:activeMessages');
            }}
            className="p-2 rounded text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
            title="Clear chat history"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <MessageList
        messages={messages}
        onAction={(msg) => sendMessage(msg)}
        onSendMessage={handleSend}
      />

      <MessageInput
        onSendMessage={handleSend}
        isLoading={isLoading}
        isConnected={isConnected}
        models={models}
        apiKey={apiKey}
        transport={transport}
      />
    </div>
  );
};

export default Chat;
