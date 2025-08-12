import { useState } from 'react';
import { Chat, MarkdownDemo, SimpleMarkdownTest, AccessibilityProvider } from './components';
import { Bot, MessageCircle, NotebookText, FlaskConical } from 'lucide-react';

function App() {
  const [showDemo, setShowDemo] = useState(0);

  return (
    <AccessibilityProvider>
      {/* Skip Link for Keyboard Navigation */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      
      <div className="a11y-root min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div id="main-content" className="a11y-main max-w-6xl mx-auto">
          <div className="a11y-hide-in-reduced-motion text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-100 mb-4 flex items-center justify-center gap-2">
              <Bot size={32} aria-hidden="true" />
              <span>AI ChatBot con Markdown</span>
            </h1>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDemo(0)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  showDemo === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle size={18} aria-hidden="true" />
                  <span>Chat</span>
                </span>
              </button>
              <button
                onClick={() => setShowDemo(1)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  showDemo === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <NotebookText size={18} aria-hidden="true" />
                  <span>Demo Markdown</span>
                </span>
              </button>
              <button
                onClick={() => setShowDemo(2)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  showDemo === 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FlaskConical size={18} aria-hidden="true" />
                  <span>Test Simple</span>
                </span>
              </button>
            </div>
          </div>
          
          {showDemo === 0 ? <Chat /> : showDemo === 1 ? <MarkdownDemo /> : <SimpleMarkdownTest />}
        </div>
      </div>
    </AccessibilityProvider>
  );
}

export default App;