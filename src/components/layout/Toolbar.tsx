// src/components/layout/Toolbar.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { theme } = useTheme();

  return (
    <div className="toolbar">
      <div className="toolbar-group brand-group">
        <div className="brand-identity">
          <h1 className="brand-title">Saga3D</h1>
          <p className="brand-tagline">Tell your system's saga in 3D</p>
        </div>
      </div>
      
      <div className="toolbar-group">
        <button onClick={createNewDiagram} className="btn btn-primary">
          📄 New
        </button>
        <button onClick={() => openDialog('save')} className="btn btn-secondary">
          💾 Save
        </button>
        <button onClick={() => openDialog('load')} className="btn btn-secondary">
          📁 Load
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          onClick={() => openDialog('import')}
          className="btn btn-success"
        >
          📂 Import
        </button>
        <button 
          onClick={() => openDialog('export')}
          className="btn btn-success"
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
          className="btn btn-warning"
          title="Save to current session only"
        >
          ⚡ Quick Save
        </button>
        <button 
          onClick={() => openDialog('keyboard')}
          className="btn btn-secondary"
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
            {hasUnsavedChanges && <span className="modified-indicator"> • Modified</span>}
            <div className="session-note">Session storage only - export to save permanently</div>
          </div>
        </div>
      </div>
    </div>
  );
};
