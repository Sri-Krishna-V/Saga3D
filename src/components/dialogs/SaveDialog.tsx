// src/components/dialogs/SaveDialog.tsx
import React from 'react';
import { DiagramHookState, DiagramHookActions, DialogState } from '../../types';
import { theme } from '../../styles/theme';

interface SaveDialogProps {
  diagramState: DiagramHookState & DiagramHookActions;
  dialogState: DialogState;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({ 
  diagramState,
  dialogState
}) => {
  const { diagramName, setDiagramName, saveDiagram } = diagramState;
  const { closeDialog } = dialogState;
  
  const handleSave = async () => {
    const success = await saveDiagram();
    if (success) {
      closeDialog();
    }
  };
  
  return (
    <div className="dialog-overlay">
      <div className="dialog fade-in">
        <h2>💾 Save Diagram</h2>
        <div className="alert warning">
          <strong>⚠️ Important:</strong> This save is temporary and will be lost when you close the browser.
          <br />
          Use <strong>Export File</strong> to permanently save your work.
        </div>
        <input
          type="text"
          placeholder="Enter diagram name"
          value={diagramName}
          onChange={(e) => setDiagramName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        <div className="dialog-buttons">
          <button onClick={handleSave} className="primary">Save to Session</button>
          <button onClick={closeDialog} className="secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};
