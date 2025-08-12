import React, { useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/dark.css';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onAction?: (message: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content,
  className = '',
  onAction,
}) => {
  const createWorker = useMemo(() => {
    return () => {
      const workerSource = `
        self.console = {
          log: (...args) => self.postMessage({ type: 'log', data: args.map(a => String(a)).join(' ') }),
          error: (...args) => self.postMessage({ type: 'log', data: args.map(a => String(a)).join(' ') }),
          warn: (...args) => self.postMessage({ type: 'log', data: args.map(a => String(a)).join(' ') }),
          info: (...args) => self.postMessage({ type: 'log', data: args.map(a => String(a)).join(' ') }),
        };
        self.onmessage = (e) => {
          const code = e.data && e.data.code ? String(e.data.code) : '';
          try {
            let result;
            try {
              // Wrap in IIFE to avoid leaking variables to worker scope
              result = (function(){ return eval(code); })();
            } catch(innerErr) {
              throw innerErr;
            }
            const serialized = (typeof result === 'undefined') ? 'undefined' : (() => {
              try { return JSON.stringify(result, null, 2); } catch(_) { return String(result); }
            })();
            self.postMessage({ type: 'result', data: serialized });
          } catch (err) {
            self.postMessage({ type: 'error', data: String(err && err.message ? err.message : err) });
          } finally {
            self.postMessage({ type: 'done' });
          }
        };
      `;
      const blob = new Blob([workerSource], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(blob));
    };
  }, []);

  const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    const workerRef = useRef<Worker | null>(null);

    const canRun = language === 'javascript' || language === 'js';

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // ignore
      }
    };

    const handleAskGemini = () => {
      if (!onAction) return;
      const msg = `Analiza y explica el siguiente código, sugiere mejoras y casos de prueba.\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;
      onAction(msg);
    };

    const handleRun = () => {
      if (!canRun || isRunning) return;
      setIsRunning(true);
      setOutput([]);
      const worker = createWorker();
      workerRef.current = worker;
      worker.onmessage = (e: MessageEvent) => {
        const { type, data } = e.data || {};
        if (type === 'log') {
          setOutput(prev => [...prev, String(data)]);
        } else if (type === 'result') {
          setOutput(prev => [...prev, `Resultado: ${String(data)}`]);
        } else if (type === 'error') {
          setOutput(prev => [...prev, `Error: ${String(data)}`]);
        } else if (type === 'done') {
          setIsRunning(false);
          worker.terminate();
          workerRef.current = null;
        }
      };
      worker.postMessage({ code });
    };

    return (
      <div className="code-block-container">
        <div className="code-block-header">
          <span className="code-language">{(language || 'text').toUpperCase()}</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="copy-button" onClick={handleCopy} aria-label="Copiar código" title={copied ? 'Copiado' : 'Copiar código'}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
            <button className="copy-button" onClick={handleAskGemini} aria-label="Preguntar a Gemini" title="Preguntar a Gemini">
              Gemini
            </button>
            {canRun && (
              <button className="copy-button" onClick={handleRun} disabled={isRunning} aria-label="Ejecutar código" title="Ejecutar código (solo JS)">
                {isRunning ? 'Ejecutando...' : 'Ejecutar'}
              </button>
            )}
          </div>
        </div>
        <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <code className={`language-${language || ''}`}>
            {code}
          </code>
        </pre>
        {output.length > 0 && (
          <div style={{ background: '#0f172a', border: '1px solid var(--border-color)', borderTop: 'none', padding: '0.75rem 1rem', fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            {output.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match) {
              const codeText = String(children).replace(/\n$/, '');
              return <CodeBlock code={codeText} language={match[1]} />;
            }
            return (
              <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
