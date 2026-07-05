import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface UseChatApiReturn {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (message: string, model?: string) => void;
  clearMessages: () => void;
  loadMessages: (msgs: Message[]) => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const useChatApi = (apiKey?: string): UseChatApiReturn => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem('chat:activeMessages');
      if (stored) {
        localStorage.removeItem('chat:activeMessages');
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [];
      }
    } catch { /* ignore */ }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const healthCheckRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const check = async () => {
      try {
        const resp = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(5000) });
        setIsConnected(resp.ok);
      } catch {
        setIsConnected(false);
      }
    };
    check();
    healthCheckRef.current = setInterval(check, 15000);
    return () => clearInterval(healthCheckRef.current);
  }, []);

  const sendMessage = async (message: string, model?: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      sender: 'user',
      text: message.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage, { id: generateId(), sender: 'ai', text: '...', timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          model: model || 'gemini-2.5-flash',
          apiKey: apiKey || undefined,
        }),
      });
      const data = await resp.json();
      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => m.sender === 'ai' && m.text === '...');
        if (idx !== -1) copy.splice(idx, 1);
        copy.push({ id: generateId(), sender: 'ai', text: data?.text || 'Sin respuesta', timestamp: new Date() });
        return copy;
      });
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => m.sender === 'ai' && m.text === '...');
        if (idx !== -1) copy.splice(idx, 1);
        copy.push({ id: generateId(), sender: 'ai', text: 'Error al conectar con el servidor.', timestamp: new Date() });
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);
  const loadMessages = (msgs: Message[]) => setMessages(msgs);

  return { messages, isConnected, isLoading, sendMessage, clearMessages, loadMessages };
};
