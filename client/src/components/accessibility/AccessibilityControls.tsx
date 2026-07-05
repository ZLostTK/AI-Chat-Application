import React from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { Type, Move, Eye, EyeOff, ZoomIn, ZoomOut, Cog } from 'lucide-react';

const btnBase = 'flex items-center gap-3 px-4 py-3 bg-surface-elevated border-2 border-border rounded-lg text-text-primary text-sm font-medium w-full text-left cursor-pointer transition-all hover:bg-brand-500 hover:text-white hover:border-brand-500 active:translate-y-0';
const btnActive = 'bg-brand-500 text-white border-brand-500';
const sizeBtnBase = 'w-10 h-10 flex items-center justify-center bg-surface-elevated border-2 border-border rounded-lg text-text-primary cursor-pointer transition-all hover:bg-brand-500 hover:text-white hover:border-brand-500';

export const AccessibilityControls: React.FC = () => {
  const { highContrast, fontSize, reducedMotion, toggleHighContrast, setFontSize, toggleReducedMotion } = useAccessibility();

  return (
    <div className="fixed top-5 right-5 z-[1000] bg-surface border-2 border-border rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] min-w-[280px] backdrop-blur-md max-md:left-5 max-md:min-w-auto" role="toolbar" aria-label="Controles de accesibilidad">
      <div className="flex flex-col gap-4">
        <h3 className="m-0 mb-3 text-lg font-semibold text-text-primary text-center border-b-2 border-border pb-2">Accesibilidad</h3>

        {/* High Contrast Toggle */}
        <button
          onClick={toggleHighContrast}
          className={`${btnBase} ${highContrast ? btnActive : ''}`}
          aria-pressed={highContrast}
          aria-label={`${highContrast ? 'Desactivar' : 'Activar'} alto contraste`}
        >
          {highContrast ? <EyeOff size={20} /> : <Eye size={20} />}
          <span>Alto Contraste</span>
        </button>

        {/* Font Size Controls */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary text-center">Tamaño de texto:</span>
          <div className="flex gap-2 justify-center">
            {([
              ['small', ZoomOut],
              ['medium', Type],
              ['large', ZoomIn],
            ] as const).map(([size, Icon]) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`${sizeBtnBase} ${fontSize === size ? btnActive : ''}`}
                aria-label={`Texto ${size === 'small' ? 'pequeño' : size === 'medium' ? 'mediano' : 'grande'}`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Reduced Motion Toggle */}
        <button
          onClick={toggleReducedMotion}
          className={`${btnBase} ${reducedMotion ? btnActive : ''}`}
          aria-pressed={reducedMotion}
          aria-label={`${reducedMotion ? 'Desactivar' : 'Activar'} movimiento reducido`}
        >
          <Move size={20} />
          <span>Movimiento Reducido</span>
          {reducedMotion && (
            <span className="ml-auto text-xs opacity-80" title="Activado por preferencia del sistema" aria-hidden="true">
              <Cog size={14} />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};


