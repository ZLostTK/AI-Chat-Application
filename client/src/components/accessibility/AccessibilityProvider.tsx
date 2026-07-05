import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';

interface AccessibilityContextType {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  themeMode: ThemeMode;
  toggleHighContrast: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleReducedMotion: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

function getSystemDarkPref(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'system' ? getSystemDarkPref() : mode === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedContrast = localStorage.getItem('a11y:highContrast');
    const storedFont = localStorage.getItem('a11y:fontSize') as 'small' | 'medium' | 'large' | null;
    const storedMotion = localStorage.getItem('a11y:reducedMotion');
    const storedTheme = localStorage.getItem('a11y:themeMode') as ThemeMode | null;

    if (storedContrast !== null) setHighContrast(storedContrast === 'true');
    if (storedFont) setFontSize(storedFont);
    if (storedTheme) setThemeModeState(storedTheme);

    if (storedMotion !== null) {
      setReducedMotion(storedMotion === 'true');
    } else {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Apply a11y attrs + theme
  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', highContrast.toString());
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-reduced-motion', reducedMotion.toString());

    const fontPx = fontSize === 'small' ? 14 : fontSize === 'large' ? 18 : 16;
    document.documentElement.style.fontSize = `${fontPx}px`;

    localStorage.setItem('a11y:highContrast', String(highContrast));
    localStorage.setItem('a11y:fontSize', fontSize);
    localStorage.setItem('a11y:reducedMotion', String(reducedMotion));
  }, [highContrast, fontSize, reducedMotion]);

  // Apply theme
  useEffect(() => {
    applyTheme(themeMode);
    localStorage.setItem('a11y:themeMode', themeMode);
  }, [themeMode]);

  // Listen for system color-scheme changes when in 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (themeMode === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  // Listen for system reduced-motion changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('a11y:reducedMotion');
      if (stored === null) setReducedMotion(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleHighContrast = useCallback(() => setHighContrast(p => !p), []);
  const toggleReducedMotion = useCallback(() => setReducedMotion(p => !p), []);
  const setThemeMode = useCallback((mode: ThemeMode) => setThemeModeState(mode), []);

  return (
    <AccessibilityContext.Provider value={{
      highContrast, fontSize, reducedMotion, themeMode,
      toggleHighContrast, setFontSize, toggleReducedMotion, setThemeMode,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};


