import React from 'react';
import { useViewport } from '../../contexts/ViewportContext';
import './ViewportControls.css';

interface ViewportControlsProps {
  className?: string;
}

export function ViewportControls({ className = '' }: ViewportControlsProps) {
  const { state, zoomIn, zoomOut, resetViewport, fitToView } = useViewport();
  
  const zoomPercentage = Math.round(state.transform.scale * 100);

  const handleFitToView = () => {
    // Get rough diagram bounds - this would need to be connected to actual diagram state
    // For now, using some default values
    fitToView(800, 600);
  };

  return (
    <div className={`viewport-controls ${className}`}>
      <div className="zoom-controls">
        <button 
          className="control-button" 
          onClick={() => zoomOut()}
          title="Zoom Out (Ctrl + -)"
          disabled={state.transform.scale <= state.bounds.minScale}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2zM5 7h6v2H5V7z"/>
          </svg>
        </button>
        
        <div className="zoom-display" title="Current zoom level">
          {zoomPercentage}%
        </div>
        
        <button 
          className="control-button" 
          onClick={() => zoomIn()}
          title="Zoom In (Ctrl + +)"
          disabled={state.transform.scale >= state.bounds.maxScale}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2zM7 5v2H5v2h2v2h2V9h2V7H9V5H7z"/>
          </svg>
        </button>
      </div>

      <div className="view-controls">
        <button 
          className="control-button" 
          onClick={handleFitToView}
          title="Fit to View"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2a1 1 0 0 1 1-1h2.5a.5.5 0 0 1 0 1H2v2.5a.5.5 0 0 1-1 0V2zm11.5-.5a.5.5 0 0 1 .5-.5H15a1 1 0 0 1 1 1v2.5a.5.5 0 0 1-1 0V2h-2.5a.5.5 0 0 1-.5-.5zM1 11.5a.5.5 0 0 1 .5.5V14h2.5a.5.5 0 0 1 0 1H2a1 1 0 0 1-1-1v-2.5a.5.5 0 0 1 .5-.5zm13 0a.5.5 0 0 1 .5.5V14a1 1 0 0 1-1 1h-2.5a.5.5 0 0 1 0-1H14v-2.5a.5.5 0 0 1 .5-.5z"/>
          </svg>
        </button>
        
        <button 
          className="control-button" 
          onClick={resetViewport}
          title="Reset View (Ctrl + 0)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 16a6.966 6.966 0 0 1-1.746-.226 7.024 7.024 0 0 1-6.028-6.028A6.966 6.966 0 0 1 0 8a6.966 6.966 0 0 1 .226-1.746 7.024 7.024 0 0 1 6.028-6.028A6.966 6.966 0 0 1 8 0a6.966 6.966 0 0 1 1.746.226 7.024 7.024 0 0 1 6.028 6.028A6.966 6.966 0 0 1 16 8a6.966 6.966 0 0 1-.226 1.746 7.024 7.024 0 0 1-6.028 6.028A6.966 6.966 0 0 1 8 16zM7 11V5h2v6H7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
