import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, Monitor, Eye, EyeOff, Move, Type, ZoomIn, ZoomOut, Cog, Wifi, Server, Key } from 'lucide-react';
import { useAccessibility } from '../accessibility/AccessibilityProvider';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const sectionTitle = 'text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3';
const radioBase = 'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer';
const radioInactive = 'border-border text-text-secondary hover:text-text-primary hover:border-brand-400/50';
const radioActive = 'border-brand-500 bg-brand-500/10 text-brand-400';

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ open, onClose }) => {
  const { highContrast, fontSize, reducedMotion, themeMode, toggleHighContrast, setFontSize, toggleReducedMotion, setThemeMode } = useAccessibility();
  const [transport, setTransport] = useState(() => localStorage.getItem('chat:transport') || 'api');

  useEffect(() => {
    localStorage.setItem('chat:transport', transport);
  }, [transport]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 w-full md:w-96 h-[85vh] md:h-full bg-surface border-t md:border-l border-border shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
            <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Appearance */}
            <section>
              <h3 className={sectionTitle}>Appearance</h3>
              <div className="flex gap-2">
                {[
                  { value: 'dark' as const, icon: Moon, label: 'Dark' },
                  { value: 'light' as const, icon: Sun, label: 'Light' },
                  { value: 'system' as const, icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setThemeMode(value)}
                    className={`${radioBase} ${themeMode === value ? radioActive : radioInactive}`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Accessibility */}
            <section>
              <h3 className={sectionTitle}>Accessibility</h3>
              <div className="space-y-3">
                {/* High Contrast */}
                <button
                  onClick={toggleHighContrast}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                    highContrast ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                  aria-pressed={highContrast}
                >
                  {highContrast ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span className="text-sm font-medium">High Contrast</span>
                </button>

                {/* Font Size */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-text-muted">Font Size</span>
                  <div className="flex gap-2">
                    {([
                      ['small', ZoomOut],
                      ['medium', Type],
                      ['large', ZoomIn],
                    ] as const).map(([size, Icon]) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          fontSize === size ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="capitalize">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reduced Motion */}
                <button
                  onClick={toggleReducedMotion}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                    reducedMotion ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                  aria-pressed={reducedMotion}
                >
                  <Move size={18} />
                  <span className="text-sm font-medium">Reduced Motion</span>
                  {reducedMotion && <Cog size={14} className="ml-auto opacity-60" />}
                </button>
              </div>
            </section>

            {/* Transport */}
            <section>
              <h3 className={sectionTitle}>Connection</h3>
              <div className="flex gap-2">
                {[
                  { value: 'api', icon: Server, label: 'HTTP API' },
                  { value: 'ws', icon: Wifi, label: 'WebSocket' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTransport(value)}
                    className={`${radioBase} ${transport === value ? radioActive : radioInactive}`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* API Key */}
            <section>
              <h3 className={sectionTitle}>API Key</h3>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border">
                <Key size={18} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-secondary truncate">
                    {localStorage.getItem('gemini:apiKey')
                      ? `••••${localStorage.getItem('gemini:apiKey')!.slice(-4)}`
                      : 'Not configured'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const key = prompt('Enter your Gemini API key:');
                    if (key && key.trim()) {
                      localStorage.setItem('gemini:apiKey', key.trim());
                      window.location.reload();
                    } else if (key === '') {
                      localStorage.removeItem('gemini:apiKey');
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-400 transition-colors shrink-0"
                >
                  {localStorage.getItem('gemini:apiKey') ? 'Change' : 'Add'}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Get a free key at{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline">
                  AI Studio
                </a>
              </p>
            </section>

            {/* About */}
            <section>
              <h3 className={sectionTitle}>About</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>AI ChatBot v1.0.0</p>
                <p className="text-xs text-text-muted">Built with React + Tailwind CSS + Vite</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
