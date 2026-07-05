import { useState } from 'react';
import { Chat, MarkdownDemo, SimpleMarkdownTest, AccessibilityProvider } from './components';
import { Layout } from './components/layout/Layout';

function App() {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <AccessibilityProvider>
      {/* Skip Link for Keyboard Navigation */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        <div id="main-content" className="h-full">
          {currentPage === 0 ? <Chat /> : currentPage === 1 ? <MarkdownDemo /> : <SimpleMarkdownTest />}
        </div>
      </Layout>
    </AccessibilityProvider>
  );
}

export default App;