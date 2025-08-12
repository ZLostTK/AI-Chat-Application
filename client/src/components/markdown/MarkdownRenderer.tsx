import React, { useMemo, useState } from 'react';
import { Check, Copy, Play, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/dark.css';
import hljs from 'highlight.js';
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

  const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);

    const canRun = language === 'python' || language === 'py';

    const highlightedHtml = useMemo(() => {
      try {
        if (language && hljs.getLanguage(language)) {
          return hljs.highlight(code, { language }).value;
        }
        return hljs.highlightAuto(code).value;
      } catch (_) {
        const escapeHtml = (s: string) =>
          s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
        return escapeHtml(code);
      }
    }, [code, language]);

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
      if (!onAction) return;
      setIsRunning(true);
      setOutput([`Ejecutando en Gemini...`]);
      // Enviamos una instrucción especial para que el backend ejecute el código con Gemini Code Execution
      const payload = {
        language: language || 'python',
        code
      };
      onAction(`::EXEC_CODE::${JSON.stringify(payload)}`);
    };

    return (
      <div className="code-block-container">
        <div className="code-block-header">
          <span className="code-language">{(language || 'text').toUpperCase()}</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="copy-button inline-flex items-center gap-1" onClick={handleCopy} aria-label="Copiar código" title={copied ? 'Copiado' : 'Copiar código'}>
              {copied ? (
                <>
                  <Check size={14} aria-hidden="true" />
                </>
              ) : (
                <>
                  <Copy size={14} aria-hidden="true" />
                </>
              )}
            </button>
            <button className="copy-button inline-flex items-center gap-1" onClick={handleAskGemini} aria-label="Preguntar a Gemini" title="Preguntar a Gemini">
              <Bot size={14} aria-hidden="true" />
            </button>
            {canRun && (
              <button className="copy-button inline-flex items-center gap-1" onClick={handleRun} disabled={isRunning} aria-label="Ejecutar código" title="Ejecutar en Gemini (solo Python)">
                {isRunning ? (
                  'Ejecutando...'
                ) : (
                  <>
                    <Play size={14} aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <pre className="hljs bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <code
            className={`language-${language || ''}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
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
        rehypePlugins={[rehypeKatex]}
        components={{
          code(compProps) {
            const { node, inline, className, children, ...props } = compProps as any;
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match) {
              // Obtener texto del bloque de forma robusta
              let codeText = '';
              if (Array.isArray(children)) {
                if (children.length === 1 && typeof children[0] === 'string') {
                  codeText = children[0];
                } else if (children.every((c) => typeof c === 'string')) {
                  codeText = (children as string[]).join('');
                }
              } else if (typeof children === 'string') {
                codeText = children;
              }
              // Fallback al árbol del nodo cuando children no son strings (evitar [object Object])
              if (!codeText && node) {
                const anyNode: any = node as any;
                if (typeof anyNode.value === 'string') {
                  codeText = anyNode.value;
                } else if (Array.isArray(anyNode.children)) {
                  const joined = anyNode.children
                    .map((c: any) => (typeof c.value === 'string' ? c.value : ''))
                    .join('');
                  if (joined) codeText = joined;
                } else if ((anyNode as any).children && (anyNode as any).children[0]) {
                  const raw = (anyNode as any).children[0].value;
                  if (typeof raw === 'string') {
                    codeText = raw;
                  }
                }
              }
              if (!codeText) {
                codeText = String(children || '');
              }
              codeText = codeText.replace(/\n$/, '');
              return <CodeBlock code={codeText} language={match[1]} />;
            }
            return (
              <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-sm" {...(props as any)}>
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


