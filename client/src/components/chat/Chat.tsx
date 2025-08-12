import React, { useMemo, useState, useEffect } from 'react';
import { MessageCircle, Trash2, Accessibility } from 'lucide-react';
import { useChatApi } from '../../hooks/useChatApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import MessageList from '../messages/MessageList';
import MessageInput from './MessageInput.tsx';
import { AccessibilityControls } from '../accessibility/AccessibilityControls';
import './Chat.css';

const Chat: React.FC = () => {
  // Modo oscuro por defecto, sin alternancia de tema
  const [demoMode, setDemoMode] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  // Transport selection: api | ws (order of precedence: URL param > localStorage > env > default)
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

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  }, []);

  // Eliminado el toggle de tema (siempre oscuro)

  const handleDemoMessage = (message: string) => {
    if (message.toLowerCase().includes('demo')) {
      setDemoMode(true);
      // Simulate AI response with formatted content
      setTimeout(() => {
        const demoResponse = `# AI Assistant Demo Mode

Welcome to the **enhanced AI chat interface**! Here are some formatting examples:

## Mathematical Expressions
- Inline math: $E = mc^2$ and $\\pi \\approx 3.14159$
- Display math: $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

## Code Examples

\`\`\`python
# dark themed Python code
def fibonacci(n):
    """Calculate fibonacci sequence"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
result = fibonacci(10)
print(f"Fibonacci(10) = {result}")
\`\`\`

\`\`\`javascript
// JavaScript with syntax highlighting
const greetUser = (name) => {
    return \`Hello, \${name}! Welcome to the chat.\`;
};

console.log(greetUser("Developer"));
\`\`\`

## Text Formatting
- **Bold text** for emphasis
- *Italic text* for subtle emphasis  
- ***Bold and italic*** for strong emphasis
- \`inline code\` for technical terms

## Lists and Tables

### Features List:
1. **Markdown Support** - Full markdown rendering
2. **LaTeX Math** - Beautiful mathematical expressions
3. **Code Highlighting** - dark theme syntax highlighting
4. **Dark/Light Mode** - Automatic theme switching
5. **Responsive Design** - Works on all devices

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown | Complete | High |
| LaTeX | Complete | High |
| Code Blocks | Complete | High |
| Dark Mode | Complete | Medium |

> **Note**: This is demo mode for testing formatting capabilities. In production, connect to your AI backend service.

Ready to chat with enhanced formatting!`;

        // You would normally handle this through the WebSocket
        console.log('Demo response generated', { length: demoResponse.length });
      }, 1000);
    } else {
      sendMessage(message);
    }
  };

  return (
    <div className="chat-container">
      {demoMode && (
        <div className="demo-indicator">
          DEMO MODE
        </div>
      )}
      
      <div className="chat-header">
        <h2>
          <MessageCircle size={20} />
          AI Assistant
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="chat-status" title={transport === 'ws' ? `WebSocket: ${wsUrl}` : 'HTTP API'}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{transport.toUpperCase()}</span>
          </div>
          <div className="chat-status">
            <div className="status-indicator" />
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
          <button 
            className="theme-toggle"
            onClick={() => setShowAccessibility(!showAccessibility)}
            title="Toggle accessibility controls"
            aria-label="Toggle accessibility controls"
            aria-pressed={showAccessibility}
          >
            <Accessibility size={18} />
          </button>
          <button 
            className="theme-toggle"
            onClick={clearMessages}
            title="Clear chat history"
          >
            <Trash2 size={18} />
          </button>
          {/* Botón de modo claro eliminado */}
        </div>
      </div>
      
      <MessageList 
        messages={messages}
        onAction={(msg) => {
          // Enviar el mensaje construido por acciones (copiar/explicar/ejecutar) hacia el backend
          sendMessage(msg);
        }}
      />
      
      <MessageInput 
        onSendMessage={demoMode ? handleDemoMessage : sendMessage}
        isLoading={isLoading}
        isConnected={isConnected || demoMode}
      />
      
      {/* Accessibility Controls */}
      {showAccessibility && <AccessibilityControls />}
    </div>
  );
};

export default Chat;


