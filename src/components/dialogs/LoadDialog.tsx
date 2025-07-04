// src/components/dialogs/LoadDialog.tsx
import React from 'react';
import { DiagramHookState, DiagramHookActions, DialogState } from '../../types';
import { theme } from '../../styles/theme';

interface LoadDialogProps {
  diagramState: DiagramHookState & DiagramHookActions;
  dialogState: DialogState;
}

export const LoadDialog: React.FC<LoadDialogProps> = ({ 
  diagramState,
  dialogState
}) => {
  const { diagrams, loadDiagram, deleteDiagram } = diagramState;
  const { closeDialog } = dialogState;
  
  const handleLoad = (diagramId: string) => {
    const diagram = diagrams.find(d => d.id === diagramId);
    if (diagram) {
      loadDiagram(diagram);
      closeDialog();
    }
  };
  
  return (
    <div className="dialog-overlay">
      <div className="dialog fade-in">
        <h2>📁 Load Diagram</h2>
        <div className="alert info">
          <strong>📋 Note:</strong> These saves are temporary. Export your diagrams to keep them permanently.
        </div>
        <div className="diagram-list">
          {diagrams.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing.xl, 
              color: theme.colors.textSecondary 
            }}>
              <p>No saved diagrams found in this session</p>
            </div>
          ) : (
            diagrams.map(diagram => (
              <div key={diagram.id} className="diagram-item">
                <div className="diagram-info">
                  <h3>{diagram.name}</h3>
                  <div className="meta">
                    <span>Created: {new Date(diagram.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(diagram.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="diagram-actions">
                  <button onClick={() => handleLoad(diagram.id)} className="load">Load</button>
                  <button 
                    onClick={() => {
                      deleteDiagram(diagram.id);
                      // Don't close dialog, user might want to load a different diagram
                    }} 
                    className="delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="dialog-buttons">
          <button onClick={closeDialog} className="secondary">Close</button>
        </div>
      </div>
    </div>
  );
};
