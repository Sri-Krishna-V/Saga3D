/**
 * Enhanced Diagram Canvas - 3D rendering component with performance optimizations
 * 
 * Wraps the Isoflow library and provides integration with our diagram state management.
 * Handles the rendering of 3D isometric diagrams with optimized React patterns.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Isoflow } from 'fossflow';
import { Spinner } from '../../../components/ui';
import { useDiagram } from '../../../contexts/DiagramContext';
import { getIconManager } from '../../../utils/iconManager';
import './DiagramCanvas.css';

interface DiagramCanvasProps {
  readonly className?: string;
  readonly onModelChange?: (data: any) => void;
  readonly 'data-testid'?: string;
}

export const DiagramCanvas = React.memo<DiagramCanvasProps>(({
  className = '',
  onModelChange,
  'data-testid': testId,
}) => {
  const { state, updateDiagramTitle } = useDiagram();
  const [canvasKey, setCanvasKey] = useState(0);

  // Memoized icon manager initialization for performance
  const iconManager = useMemo(() => {
    try {
      const manager = getIconManager();
      manager.initialize();
      return manager;
    } catch (error) {
      console.error('Failed to initialize icon manager:', error);
      return null;
    }
  }, []);

  // Handle model updates from Isoflow with useCallback optimization
  const handleModelUpdated = useCallback((data: any) => {
    if (onModelChange) {
      onModelChange(data);
    }
    
    // Update title if it changed
    if (data.title !== state.currentDiagram?.title) {
      updateDiagramTitle(data.title);
    }
  }, [onModelChange, state.currentDiagram?.title, updateDiagramTitle]);

  // Get diagram data for Isoflow (using legacy format for compatibility)
  const getDiagramData = useCallback((): any => {
    if (state.currentDiagram && iconManager) {
      return {
        title: state.currentDiagram.title,
        icons: iconManager.getAllIcons(),
        colors: state.currentDiagram.colors,
        items: state.currentDiagram.nodes,
        views: state.currentDiagram.views,
        fitToScreen: state.currentDiagram.fitToScreen,
      };
    }

    // Default diagram data
    return {
      title: 'Untitled Diagram',
      icons: iconManager ? iconManager.getAllIcons() : [],
      colors: [
        { id: 'blue', value: '#0066cc' },
        { id: 'green', value: '#00aa00' },
        { id: 'red', value: '#cc0000' },
        { id: 'orange', value: '#ff9900' },
        { id: 'purple', value: '#9900cc' },
        { id: 'black', value: '#000000' },
        { id: 'gray', value: '#666666' },
      ],
      items: [],
      views: [],
      fitToScreen: true,
    };
  }, [state.currentDiagram, iconManager]);

  // Force re-render when diagram changes
  React.useEffect(() => {
    setCanvasKey(prev => prev + 1);
  }, [state.currentDiagram?.id]);

  // Enhanced error handling
  if (state.error) {
    return (
      <div className={`diagram-canvas ${className} diagram-canvas--error`} data-testid={testId}>
        <div className="canvas-error">
          <h3>Failed to Load Diagram</h3>
          <p>{state.error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="error-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!iconManager) {
    return (
      <div className={`diagram-canvas ${className}`} data-testid={testId}>
        <div className="canvas-error">
          <h3>Failed to Initialize</h3>
          <p>Icon manager could not be loaded</p>
          <button 
            onClick={() => window.location.reload()} 
            className="error-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`diagram-canvas ${className}`} data-testid={testId}>
      {state.isLoading && (
        <div className="canvas-loading">
          <Spinner size="lg" />
          <p className="loading-text">Loading diagram...</p>
        </div>
      )}

      <div className="isoflow-container">
        {React.createElement(Isoflow, {
          key: canvasKey,
          initialData: getDiagramData(),
          onModelUpdated: handleModelUpdated,
          editorMode: "EDITABLE"
        })}
      </div>
    </div>
  );
});

DiagramCanvas.displayName = 'DiagramCanvas';
