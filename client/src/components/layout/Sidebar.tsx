import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Plus, Settings, PanelLeftClose, PanelLeftOpen,
  Bot, FlaskConical, NotebookText, X,
} from 'lucide-react';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onNavigate: (page: number) => void;
  currentPage: number;
}

interface ChatEntry {
  id: string;
  title: string;
  timestamp: number;
}

const demoLinks = [
  { id: 0, label: 'Chat', icon: MessageSquare },
  { id: 1, label: 'Markdown Demo', icon: NotebookText },
  { id: 2, label: 'Simple Test', icon: FlaskConical },
] as const;

function getSavedChats(): ChatEntry[] {
  try {
    return JSON.parse(localStorage.getItem('chat:history') || '[]');
  } catch {
    return [];
  }
}

function groupChats(chats: ChatEntry[]): { heading: string; items: ChatEntry[] }[] {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { heading: string; items: ChatEntry[] }[] = [];
  const todayItems = chats.filter(c => c.timestamp >= today.getTime());
  const yesterdayItems = chats.filter(c => c.timestamp >= yesterday.getTime() && c.timestamp < today.getTime());
  const olderItems = chats.filter(c => c.timestamp < yesterday.getTime());

  if (todayItems.length) groups.push({ heading: 'Today', items: todayItems });
  if (yesterdayItems.length) groups.push({ heading: 'Yesterday', items: yesterdayItems });
  if (olderItems.length) groups.push({ heading: 'Older', items: olderItems });
  return groups;
}

export const Sidebar: React.FC<SidebarProps> = ({
  expanded, onToggle, onNewChat, onOpenSettings, onNavigate, currentPage,
}) => {
  const [chats, setChats] = useState<ChatEntry[]>(getSavedChats);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handler = () => setChats(getSavedChats());
    window.addEventListener('storage', handler);
    // Poll for local changes too (same tab, Chat component saves history)
    const poll = setInterval(() => {
      const updated = getSavedChats();
      if (JSON.stringify(updated) !== JSON.stringify(chats)) setChats(updated);
    }, 2000);
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(poll);
    };
  }, [chats]);

  const handleLoadChat = (chatId: string) => {
    // Load chat messages into the active chat
    try {
      const allChats = JSON.parse(localStorage.getItem('chat:conversations') || '{}');
      const msgs = allChats[chatId];
      if (msgs) {
        // Store the loaded chat ID so Chat component picks it up
        localStorage.setItem('chat:activeId', chatId);
        localStorage.setItem('chat:activeMessages', JSON.stringify(msgs));
        // Dispatch custom event for Chat to pick up
        window.dispatchEvent(new CustomEvent('chat:load', { detail: { id: chatId, messages: msgs } }));
      }
    } catch { /* ignore */ }
  };

  const chatGroups = groupChats(chats);

  return (
    <aside className="h-full bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={24} className="text-brand-400 shrink-0" />
          {expanded && <span className="text-text-primary font-semibold truncate">AI ChatBot</span>}
        </div>
        {/* Close button — visible on mobile */}
        <button
          onClick={onToggle}
          className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
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

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-3">
        {expanded && chatGroups.map((group) => (
          <div key={group.heading}>
            <div className="text-xs text-text-muted font-medium uppercase tracking-wider px-2 py-2">
              {group.heading}
            </div>
            {group.items.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleLoadChat(chat.id)}
                className="w-full text-left px-2 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors truncate"
              >
                {chat.title}
              </button>
            ))}
          </div>
        ))}
        {expanded && chats.length === 0 && (
          <p className="px-2 py-4 text-xs text-text-muted text-center">No conversations yet</p>
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
          className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors hidden md:block"
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>
    </aside>
  );
};
