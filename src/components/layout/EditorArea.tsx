// src/components/layout/EditorArea.tsx
import React, { useState, ReactNode } from 'react';
import { Isoflow } from 'isoflow';
import { DiagramHookState, DiagramHookActions } from '../../types';
import { ErrorBoundary } from '../ErrorBoundary';
import { ZoomableCanvas } from '../viewport/ZoomableCanvas';
import { useTheme } from '../../contexts/ThemeContext';
import { adaptToIsoflow, adaptFromIsoflow } from '../../adapters/isoflowAdapter';

interface EditorAreaProps {
  diagramState: DiagramHookState & DiagramHookActions;
  children?: ReactNode;
}

export const EditorArea: React.FC<EditorAreaProps> = ({ diagramState, children }) => {
  const { diagramData, handleModelUpdated } = diagramState;
  const [saga3dKey, setSaga3dKey] = useState(0);
  const { theme } = useTheme();
  
  // Reset the editor if needed
  const resetEditor = () => {
    setSaga3dKey(prev => prev + 1);
  };
  
  // Handle model updates, adapting from Isoflow format to our internal format
  const handleIsoflowUpdate = (isoflowData: any) => {
    const adaptedData = adaptFromIsoflow(isoflowData);
    handleModelUpdated(adaptedData);
  };
  
  return (
    <div className="editor-area">
      <div className="editor-controls">
        {children}
      </div>
      
      <ZoomableCanvas>
        <ErrorBoundary 
          fallbackUI={
            <div className="error-fallback">
              <h3>Something went wrong with the editor</h3>
              <p>Try refreshing the page or resetting the editor</p>
              <button 
                onClick={resetEditor} 
                className="btn btn-primary"
              >
                Reset Editor
              </button>
            </div>
          }
        >
          <Isoflow 
            key={saga3dKey}
            initialData={adaptToIsoflow(diagramData) as any}
            onModelUpdated={handleIsoflowUpdate}
            editorMode="EDITABLE"
          />
        </ErrorBoundary>
      </ZoomableCanvas>
    </div>
  );
};
