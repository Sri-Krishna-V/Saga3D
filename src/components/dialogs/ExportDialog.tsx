// src/components/dialogs/ExportDialog.tsx
import React from 'react';
import { DiagramHookActions, DialogState } from '../../types';

interface ExportDialogProps {
  diagramActions: DiagramHookActions;
  dialogState: DialogState;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ 
  diagramActions,
  dialogState
}) => {
  const { exportDiagram } = diagramActions;
  const { closeDialog } = dialogState;
  
  const handleExport = () => {
    exportDiagram();
    closeDialog();
  };
  
  return (
    <div className="dialog-overlay">
      <div className="dialog fade-in">
        <h2>💾 Export Diagram</h2>
        <div className="alert success">
          <p style={{ margin: '0 0 10px 0' }}>
            <strong>✅ Recommended:</strong> This is the best way to save your work permanently.
          </p>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Exported JSON files can be imported later or shared with others.
          </p>
        </div>
        <div className="dialog-buttons">
          <button onClick={handleExport} className="primary">📥 Download JSON</button>
          <button onClick={closeDialog} className="secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};
