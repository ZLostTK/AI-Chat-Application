import { useState } from 'react';

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
  sendMessage: (message: string) => void;
  clearMessages: () => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const useChatApi = (): UseChatApiReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
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
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await resp.json();

      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => m.sender === 'ai' && m.text === '...');
        if (idx !== -1) copy.splice(idx, 1);
        copy.push({ id: generateId(), sender: 'ai', text: data?.text || 'Sin respuesta', timestamp: new Date() });
        return copy;
      });
    } catch (err) {
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

  return { messages, isConnected: true, isLoading, sendMessage, clearMessages };
};


