/**
 * Diagram Canvas - 3D rendering component
 * 
 * Wraps the Isoflow library and provides integration with our diagram state management.
 * Handles the rendering of 3D isometric diagrams and user interactions.
 */

import React, { useState, useCallback } from 'react';
import { Isoflow } from 'fossflow';
import { useDiagram } from '../../../contexts/DiagramContext';
import { getIconManager } from '../../../utils/iconManager';
import './DiagramCanvas.css';

interface DiagramCanvasProps {
  className?: string;
  onModelChange?: (data: any) => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  className = '',
  onModelChange,
}) => {
  const { state, updateDiagramTitle } = useDiagram();
  const [canvasKey, setCanvasKey] = useState(0);

  // Handle model updates from Isoflow
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
    const iconManager = getIconManager();
    iconManager.initialize();

    if (state.currentDiagram) {
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
      icons: iconManager.getAllIcons(),
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
  }, [state.currentDiagram]);

  // Force re-render when diagram changes
  React.useEffect(() => {
    setCanvasKey(prev => prev + 1);
  }, [state.currentDiagram?.id]);

  return (
    <div className={`diagram-canvas ${className}`}>
      {state.isLoading && (
        <div className="canvas-loading">
          <div className="loading-spinner">Loading diagram...</div>
        </div>
      )}
      
      {state.error && (
        <div className="canvas-error">
          <p>Error loading diagram: {state.error}</p>
        </div>
      )}

      <div className="isoflow-container">
        <Isoflow
          key={canvasKey}
          initialData={getDiagramData()}
          onModelUpdated={handleModelUpdated}
          editorMode="EDITABLE"
        />
      </div>
    </div>
  );
};
