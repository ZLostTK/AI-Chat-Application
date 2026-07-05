import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Bot } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SettingsDrawer } from './SettingsDrawer';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: number;
  onNavigate: (page: number) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [expanded, setExpanded] = useState(() => localStorage.getItem('sidebar:expanded') !== 'false');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar:expanded', String(expanded));
  }, [expanded]);

  const handleNewChat = useCallback(() => {
    setMobileOpen(false);
    // Clear messages via global ref set by Chat component
    (window as any).__chatClearMessages?.();
  }, []);

  const handleOpenSettings = useCallback(() => {
    setMobileOpen(false);
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);

  const handleNavigate = useCallback((page: number) => {
    onNavigate(page);
    setMobileOpen(false);
  }, [onNavigate]);

  // Sidebar toggle: on mobile it opens/closes the sidebar; on desktop it expands/collapses
  const handleToggle = useCallback(() => {
    if (window.innerWidth < 768) {
      setMobileOpen(prev => !prev);
    } else {
      setExpanded(prev => !prev);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <SettingsDrawer open={settingsOpen} onClose={handleCloseSettings} />

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`
          fixed md:relative z-50 md:z-0 h-full
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${expanded ? 'w-72' : 'w-16'}
          shrink-0
        `}
      >
        <Sidebar
          expanded={expanded}
          onToggle={handleToggle}
          onNewChat={handleNewChat}
          onOpenSettings={handleOpenSettings}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <Bot size={20} className="text-brand-400" />
          <span className="text-text-primary font-semibold">AI ChatBot</span>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
