// src/components/layout/Toolbar.tsx
import React from 'react';
import { theme } from '../../styles/theme';
import { DiagramHookState, DiagramHookActions, DialogState } from '../../types';

interface ToolbarProps {
  diagramState: DiagramHookState & DiagramHookActions;
  dialogState: DialogState;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  diagramState, 
  dialogState 
}) => {
  const { 
    currentDiagram, 
    diagramName,
    hasUnsavedChanges,
    createNewDiagram,
    saveDiagram
  } = diagramState;
  
  const { openDialog } = dialogState;

  return (
    <div className="toolbar">
      <div className="toolbar-group brand-group">
        <div className="brand-identity">
          <h1 className="brand-title">Saga3D</h1>
          <p className="brand-tagline">Tell your system's saga in 3D</p>
        </div>
      </div>
      
      <div className="toolbar-group">
        <button onClick={createNewDiagram} className="primary">
          📄 New
        </button>
        <button onClick={() => openDialog('save')} className="secondary">
          💾 Save
        </button>
        <button onClick={() => openDialog('load')} className="secondary">
          📁 Load
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          onClick={() => openDialog('import')}
          className="success"
        >
          📂 Import
        </button>
        <button 
          onClick={() => openDialog('export')}
          className="success"
        >
          💾 Export
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          onClick={() => {
            if (currentDiagram && hasUnsavedChanges) {
              saveDiagram();
            }
          }}
          disabled={!currentDiagram || !hasUnsavedChanges}
          className="warning"
          title="Save to current session only"
        >
          ⚡ Quick Save
        </button>
        <button 
          onClick={() => openDialog('keyboard')}
          className="secondary"
          title="Keyboard shortcuts"
        >
          ⌨️ Help
        </button>
      </div>
      
      <div className="toolbar-group">
        <div className="current-diagram">
          <div className={`status-indicator ${hasUnsavedChanges ? 'modified' : ''}`}></div>
          <div>
            <strong>{currentDiagram ? currentDiagram.name : diagramName || 'Untitled Diagram'}</strong>
            {hasUnsavedChanges && <span style={{ 
              color: theme.colors.warning, 
              fontWeight: 'normal' 
            }}> • Modified</span>}
            <div className="session-note">Session storage only - export to save permanently</div>
          </div>
        </div>
      </div>
    </div>
  );
};
