// src/components/layout/StatusBar.tsx
import React from 'react';
import { DiagramHookState, DialogState } from '../../types';
import { theme } from '../../styles/theme';

interface StatusBarProps {
  diagramState: DiagramHookState;
  dialogState: DialogState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  diagramState,
  dialogState
}) => {
  const { currentModel, lastAutoSave } = diagramState;
  const { openDialog } = dialogState;
  
  return (
    <div className="status-bar">
      <div style={{ display: 'flex', gap: theme.spacing.md }}>
        <div className="status-item">
          📊 Elements: {currentModel?.items?.length || 0}
        </div>
        <div className="status-item">
          🔗 Connections: {(currentModel as any)?.connectors?.length || 0}
        </div>
        {lastAutoSave && (
          <div className="status-item auto-save-indicator">
            💾 Auto-saved: {lastAutoSave.toLocaleTimeString()}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: theme.spacing.md }}>
        <div 
          className="status-item clickable"
          onClick={() => openDialog('storage')}
          title="Manage storage"
        >
          🗄️ Storage
        </div>
        <div 
          className="status-item clickable"
          onClick={() => openDialog('keyboard')}
          title="View keyboard shortcuts"
        >
          ⌨️ Shortcuts
        </div>
        <div className="status-item">
          ⚡ Saga3D v1.0
        </div>
      </div>
    </div>
  );
};
