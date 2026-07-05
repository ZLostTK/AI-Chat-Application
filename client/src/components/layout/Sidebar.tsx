import React from 'react';
import {
  MessageSquare, Plus, Settings, PanelLeftClose, PanelLeftOpen,
  Bot, FlaskConical, NotebookText,
} from 'lucide-react';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onNavigate: (page: number) => void;
  currentPage: number;
}

const demoLinks = [
  { id: 0, label: 'Chat', icon: MessageSquare },
  { id: 1, label: 'Markdown Demo', icon: NotebookText },
  { id: 2, label: 'Simple Test', icon: FlaskConical },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({
  expanded, onToggle, onNewChat, onOpenSettings, onNavigate, currentPage,
}) => (
  <aside className="h-full bg-surface border-r border-border flex flex-col">
    {/* Header */}
    <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
      <Bot size={24} className="text-brand-400 shrink-0" />
      {expanded && <span className="text-text-primary font-semibold truncate">AI ChatBot</span>}
    </div>

    {/* New Chat button */}
    <div className="p-3">
      <button
        onClick={onNewChat}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-white font-medium transition-colors"
      >
        <Plus size={18} />
        {expanded && <span>New Chat</span>}
      </button>
    </div>

    {/* Chat history placeholder */}
    <div className="flex-1 overflow-y-auto px-3">
      {expanded && (
        <>
          {[
            { heading: 'Today', items: ['What is AI?', 'How do I use this?'] },
            { heading: 'Yesterday', items: ['Previous conversation'] },
          ].map((group) => (
            <div key={group.heading}>
              <div className="text-xs text-text-muted font-medium uppercase tracking-wider px-2 py-2">
                {group.heading}
              </div>
              {group.items.map((title) => (
                <button
                  key={title}
                  className="w-full text-left px-2 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors truncate"
                >
                  {title}
                </button>
              ))}
            </div>
          ))}
        </>
      )}
    </div>

    {/* Demo links */}
    <div className="px-3 py-2 border-t border-border">
      {demoLinks.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg transition-colors ${
            currentPage === id
              ? 'text-brand-400 bg-surface-elevated'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
          }`}
          title={!expanded ? label : undefined}
        >
          <Icon size={16} className="shrink-0" />
          {expanded && <span className="truncate">{label}</span>}
        </button>
      ))}
    </div>

    {/* Bottom bar: settings + collapse */}
    <div className="flex items-center gap-1 px-3 h-14 border-t border-border shrink-0">
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-2 px-2 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
        title="Settings"
      >
        <Settings size={18} />
        {expanded && <span className="text-sm">Settings</span>}
      </button>
      <div className="flex-1" />
      <button
        onClick={onToggle}
        className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>
    </div>
  </aside>
);
