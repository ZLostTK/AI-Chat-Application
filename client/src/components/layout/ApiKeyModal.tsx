import React, { useState } from 'react';
import { Key, ExternalLink, X } from 'lucide-react';

interface ApiKeyModalProps {
  open: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onSave, onClose }) => {
  const [key, setKey] = useState(() => localStorage.getItem('gemini:apiKey') || '');
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    localStorage.setItem('gemini:apiKey', trimmed);
    setSaved(true);
    setTimeout(() => {
      onSave(trimmed);
      onClose();
    }, 600);
  };

  const handleRemove = () => {
    localStorage.removeItem('gemini:apiKey');
    setKey('');
    setSaved(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="API Key">
        <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-xl">
          <div className="flex items-center justify-between px-5 h-14 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Key size={18} className="text-brand-400" />
              Gemini API Key
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors" aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-text-secondary">
              Enter your Gemini API key to enable AI responses. Your key is stored locally and never sent to our servers.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-500 underline"
            >
              Get a free API key <ExternalLink size={12} />
            </a>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your API key here..."
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 font-mono"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!key.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saved ? 'Saved!' : 'Save Key'}
              </button>
              {localStorage.getItem('gemini:apiKey') && (
                <button onClick={handleRemove} className="px-4 py-2.5 rounded-xl border border-border text-text-secondary text-sm hover:text-text-primary hover:bg-surface-elevated transition-colors">
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
