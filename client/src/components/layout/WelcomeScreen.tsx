import React from 'react';
import { Bot, Sparkles, Code, Brain } from 'lucide-react';

interface WelcomeScreenProps {
  onSendMessage?: (message: string) => void;
}

const suggestions = [
  { icon: Sparkles, label: 'Explain quantum computing', text: 'Explain quantum computing in simple terms' },
  { icon: Code, label: 'Write Python code', text: 'Write a Python function to sort a list of numbers' },
  { icon: Brain, label: 'Summarize a concept', text: 'Give me a summary of the theory of relativity' },
  { icon: Bot, label: 'Help me study', text: 'Create a study plan for learning TypeScript' },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
      <Bot size={32} className="text-brand-400" />
    </div>
    <h1 className="text-2xl font-bold text-text-primary mb-2">AI ChatBot</h1>
    <p className="text-text-secondary text-sm max-w-md mb-8">
      Start a conversation by typing a message below, or choose a suggestion to get started.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
      {suggestions.map(({ icon: Icon, label, text }) => (
        <button
          key={label}
          onClick={() => onSendMessage?.(text)}
          className="flex items-center gap-3 px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-brand-400/50 hover:bg-surface-card transition-all text-left"
        >
          <Icon size={18} className="shrink-0 text-brand-400" />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  </div>
);
