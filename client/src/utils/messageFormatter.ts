import { marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';

// Extender `marked` con renderers tipados a la API v9
marked.use({
  renderer: {
    code({ text, lang }) {
      const validLanguage = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language: validLanguage }).value;
      return `
        <div class="code-block-container">
          <div class="code-block-header">
            <span class="code-language">${validLanguage}</span>
            <button class="copy-button" onclick="copyToClipboard(this)" title="Copy code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="m5 15-4-4 4-4"></path>
              </svg>
            </button>
          </div>
          <pre class="hljs dark-theme"><code class="language-${validLanguage}">${highlighted}</code></pre>
        </div>
      `;
    },
    codespan({ text }) {
      return `<code class="inline-code">${text}</code>`;
    },
  },
  gfm: true,
  breaks: true,
});

// LaTeX rendering function
const renderMath = (text: string): string => {
  // Handle display math ($$...$$)
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    try {
      return `<div class="math-display">${katex.renderToString(math, { displayMode: true })}</div>`;
    } catch (error) {
      return `<div class="math-error">Math Error: ${match}</div>`;
    }
  });

  // Handle inline math ($...$)
  text = text.replace(/\$([^$\n]+?)\$/g, (match, math) => {
    try {
      return `<span class="math-inline">${katex.renderToString(math, { displayMode: false })}</span>`;
    } catch (error) {
      return `<span class="math-error">Math Error: ${match}</span>`;
    }
  });

  return text;
};

// Main message formatting function
export const formatMessage = (text: string): string => {
  try {
    // First, render LaTeX math
    let formattedText = renderMath(text);
    
    // Then, render Markdown (v9 devuelve string)
    formattedText = marked(formattedText) as string;
    
    return formattedText;
  } catch (error) {
    console.error('Error formatting message:', error);
    return text; // Return original text if formatting fails
  }
};

// Add copy to clipboard functionality to window
declare global {
  interface Window {
    copyToClipboard: (button: HTMLElement) => void;
  }
}

window.copyToClipboard = (button: HTMLElement) => {
  const codeBlock = button.closest('.code-block-container')?.querySelector('code');
  if (codeBlock) {
    navigator.clipboard.writeText(codeBlock.textContent || '').then(() => {
      const originalText = button.innerHTML;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      `;
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    });
  }
};