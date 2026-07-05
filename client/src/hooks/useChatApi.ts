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

  // Health check: try hitting Gemini API directly if key exists, else ping /api/health
  useEffect(() => {
    const check = async () => {
      try {
        if (apiKey) {
          const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
            { method: 'GET', signal: AbortSignal.timeout(5000) }
          );
          setIsConnected(resp.ok);
        } else {
          const resp = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(5000) });
          setIsConnected(resp.ok);
        }
      } catch {
        setIsConnected(false);
      }
    };
    check();
    healthCheckRef.current = setInterval(check, 30000);
    return () => clearInterval(healthCheckRef.current);
  }, [apiKey]);

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
      let aiText = '';

      if (apiKey) {
        const modelName = model || 'gemini-2.5-flash';
        const isImageModel = modelName.toLowerCase().includes('image');
        const isTtsModel = modelName.toLowerCase().includes('tts');
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

        // Build generation config based on model type
        const genConfig: any = {};
        if (isImageModel) {
          genConfig.responseModalities = ['TEXT', 'IMAGE'];
        } else if (isTtsModel) {
          genConfig.responseModalities = ['AUDIO'];
          genConfig.speechConfig = {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore',
              },
            },
          };
        }

        const body: any = {
          contents: [{ role: 'user', parts: [{ text: message.trim() }] }],
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        };
        if (Object.keys(genConfig).length > 0) body.generationConfig = genConfig;

        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await resp.json();
        if (!resp.ok) {
          aiText = `API error: ${data?.error?.message || resp.statusText}`;
        } else {
          const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
          const textParts: string[] = [];
          const mediaHtml: string[] = [];
          for (const p of parts) {
            if (p.text) textParts.push(p.text);
            if (p.inlineData) {
              const { mimeType, data: b64 } = p.inlineData;
              if (mimeType?.startsWith('image/')) {
                mediaHtml.push(`![Generated Image](data:${mimeType};base64,${b64})`);
              } else if (mimeType?.startsWith('audio/')) {
                mediaHtml.push(`[audio:data:${mimeType};base64,${b64}]`);
              }
            }
          }
          aiText = [...textParts, ...mediaHtml].join('\n\n').trim();
          if (!aiText) aiText = 'No response from model.';
        }
      } else {
        // Fall back to serverless function
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message.trim() }),
        });
        const data = await resp.json();
        aiText = data?.text || 'Sin respuesta';
      }

      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => m.sender === 'ai' && m.text === '...');
        if (idx !== -1) copy.splice(idx, 1);
        copy.push({ id: generateId(), sender: 'ai', text: aiText, timestamp: new Date() });
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
