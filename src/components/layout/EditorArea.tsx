// src/components/layout/EditorArea.tsx
import React, { useState } from 'react';
import { Isoflow } from 'isoflow';
import { DiagramHookState, DiagramHookActions } from '../../types';
import { ErrorBoundary } from '../ErrorBoundary';
import { theme } from '../../styles/theme';
import { adaptToIsoflow, adaptFromIsoflow } from '../../adapters/isoflowAdapter';

interface EditorAreaProps {
  diagramState: DiagramHookState & DiagramHookActions;
}

export const EditorArea: React.FC<EditorAreaProps> = ({ diagramState }) => {
  const { diagramData, handleModelUpdated } = diagramState;
  const [saga3dKey, setSaga3dKey] = useState(0);
  
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
    <div className="saga3d-container">
      <ErrorBoundary 
        fallbackUI={
          <div className="error-fallback" style={{
            padding: theme.spacing.lg,
            textAlign: 'center',
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            boxShadow: theme.shadows.md
          }}>
            <h3>Something went wrong with the editor</h3>
            <p>Try refreshing the page or resetting the editor</p>
            <button 
              onClick={resetEditor} 
              style={{
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius.sm,
                cursor: 'pointer'
              }}
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
    </div>
  );
};
