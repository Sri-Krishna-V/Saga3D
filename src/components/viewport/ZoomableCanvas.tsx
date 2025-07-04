import React, { ReactNode } from 'react';
import { useViewportControls, useViewportTransform } from '../../hooks/useViewport';
import './ZoomableCanvas.css';

interface ZoomableCanvasProps {
  children: ReactNode;
  className?: string;
}

export function ZoomableCanvas({ children, className = '' }: ZoomableCanvasProps) {
  const { isDragging } = useViewportControls();
  const { transformCSS } = useViewportTransform();

  return (
    <div 
      id="viewport-container"
      className={`zoomable-canvas ${className} ${isDragging ? 'dragging' : ''}`}
    >
      <div 
        className="canvas-content"
        style={{
          transform: transformCSS,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
