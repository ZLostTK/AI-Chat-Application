import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  toggleHighContrast: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleReducedMotion: () => void;
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

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Hydrate from localStorage on mount and detect system preferences
  useEffect(() => {
    const storedContrast = localStorage.getItem('a11y:highContrast');
    const storedFont = localStorage.getItem('a11y:fontSize') as 'small' | 'medium' | 'large' | null;
    const storedMotion = localStorage.getItem('a11y:reducedMotion');
    
    if (storedContrast !== null) setHighContrast(storedContrast === 'true');
    if (storedFont) setFontSize(storedFont);
    
    // Detectar preferencia del sistema para movimiento reducido si no hay valor guardado
    if (storedMotion !== null) {
      setReducedMotion(storedMotion === 'true');
    } else {
      // Detectar preferencia del sistema
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(prefersReducedMotion);
    }
  }, []);

  useEffect(() => {
    // Apply accessibility settings to document
    document.documentElement.setAttribute('data-high-contrast', highContrast.toString());
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-reduced-motion', reducedMotion.toString());

    // Update root font-size so Tailwind rem sizes scale
    const fontPx = fontSize === 'small' ? 14 : fontSize === 'large' ? 18 : 16;
    document.documentElement.style.fontSize = `${fontPx}px`;

    // Persist
    localStorage.setItem('a11y:highContrast', String(highContrast));
    localStorage.setItem('a11y:fontSize', fontSize);
    localStorage.setItem('a11y:reducedMotion', String(reducedMotion));
  }, [highContrast, fontSize, reducedMotion]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Solo actualizar si el usuario no ha configurado manualmente
      const storedMotion = localStorage.getItem('a11y:reducedMotion');
      if (storedMotion === null) {
        setReducedMotion(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleReducedMotion = () => setReducedMotion(prev => !prev);

  const value: AccessibilityContextType = {
    highContrast,
    fontSize,
    reducedMotion,
    toggleHighContrast,
    setFontSize,
    toggleReducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};


