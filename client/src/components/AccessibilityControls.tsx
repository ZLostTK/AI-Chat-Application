import React from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { 
  Type, 
  Move, 
  Eye, 
  EyeOff,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import './AccessibilityControls.css';

export const AccessibilityControls: React.FC = () => {
  const {
    highContrast,
    fontSize,
    reducedMotion,
    toggleHighContrast,
    setFontSize,
    toggleReducedMotion,
  } = useAccessibility();

  return (
    <div className="accessibility-controls" role="toolbar" aria-label="Controles de accesibilidad">
      <div className="accessibility-section">
        <h3 className="accessibility-title">Accesibilidad</h3>
        
        {/* High Contrast Toggle */}
        <button
          onClick={toggleHighContrast}
          className={`accessibility-button ${highContrast ? 'active' : ''}`}
          aria-pressed={highContrast}
          aria-label={`${highContrast ? 'Desactivar' : 'Activar'} alto contraste`}
          title={`${highContrast ? 'Desactivar' : 'Activar'} alto contraste`}
        >
          {highContrast ? <EyeOff size={20} /> : <Eye size={20} />}
          <span>Alto Contraste</span>
        </button>

        {/* Font Size Controls */}
        <div className="font-size-controls">
          <span className="font-size-label">Tamaño de texto:</span>
          <div className="font-size-buttons">
            <button
              onClick={() => setFontSize('small')}
              className={`font-size-btn ${fontSize === 'small' ? 'active' : ''}`}
              aria-label="Texto pequeño"
              title="Texto pequeño"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => setFontSize('medium')}
              className={`font-size-btn ${fontSize === 'medium' ? 'active' : ''}`}
              aria-label="Texto mediano"
              title="Texto mediano"
            >
              <Type size={16} />
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`font-size-btn ${fontSize === 'large' ? 'active' : ''}`}
              aria-label="Texto grande"
              title="Texto grande"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Reduced Motion Toggle */}
        <button
          onClick={toggleReducedMotion}
          className={`accessibility-button ${reducedMotion ? 'active' : ''}`}
          aria-pressed={reducedMotion}
          aria-label={`${reducedMotion ? 'Desactivar' : 'Activar'} movimiento reducido`}
          title={`${reducedMotion ? 'Desactivar' : 'Activar'} movimiento reducido`}
        >
          <Move size={20} />
          <span>Movimiento Reducido</span>
          {reducedMotion && (
            <span className="system-preference-indicator" title="Activado por preferencia del sistema">
              ⚙️
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
