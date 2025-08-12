import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface UseWebSocketReturn {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Generate unique ID for messages
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const connect = () => {
      try {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
          console.log('Connected to WebSocket');
          setIsConnected(true);
          // Clear any pending reconnection
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            
            if (data.sender === 'ai') {
              setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                
                // Find and remove loading message
                const loadingIndex = newMessages.findIndex(msg => msg.text === '...' && msg.sender === 'ai');
                if (loadingIndex !== -1) {
                  newMessages.splice(loadingIndex, 1);
                }
                
                // Add the actual AI response
                newMessages.push({
                  id: generateId(),
                  sender: 'ai',
                  text: data.text || data.message || 'No response received',
                  timestamp: new Date()
                });
                
                return newMessages;
              });
              setIsLoading(false);
            }
          } catch (error) {
            console.error('Error parsing message:', error, 'Raw data:', event.data);
            setIsLoading(false);
            
            // Add error message
            setMessages((prevMessages) => {
              const newMessages = [...prevMessages];
              const loadingIndex = newMessages.findIndex(msg => msg.text === '...' && msg.sender === 'ai');
              if (loadingIndex !== -1) {
                newMessages.splice(loadingIndex, 1);
              }
              
              newMessages.push({
                id: generateId(),
                sender: 'ai',
                text: 'Sorry, I encountered an error processing your message.',
                timestamp: new Date()
              });
              
              return newMessages;
            });
          }
        };

        ws.current.onclose = () => {
          console.log('Disconnected from WebSocket');
          setIsConnected(false);
          setIsLoading(false);
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          // Don't immediately set disconnected on error - let onclose handle it
          // This prevents rapid connection state changes
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);
        
        // Retry connection after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && message.trim() && !isLoading) {
      try {
        // Send message to server
        ws.current.send(JSON.stringify({ message: message.trim() }));
        
        // Add user message immediately
        const userMessage: Message = {
          id: generateId(),
          sender: 'user',
          text: message.trim(),
          timestamp: new Date()
        };
        
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        
        // Add loading indicator
        setIsLoading(true);
        const loadingMessage: Message = {
          id: generateId(),
          sender: 'ai',
          text: '...',
          timestamp: new Date()
        };
        
        setMessages((prevMessages) => [...prevMessages, loadingMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
      }
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isConnected,
    isLoading,
    sendMessage,
    clearMessages
  };
};