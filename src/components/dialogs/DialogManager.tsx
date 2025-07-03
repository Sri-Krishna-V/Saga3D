// src/components/dialogs/DialogManager.tsx
import React from 'react';
import { DialogState, DiagramHookState, DiagramHookActions } from '../../types';
import { SaveDialog } from './SaveDialog';
import { LoadDialog } from './LoadDialog';
import { ExportDialog } from './ExportDialog';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import { StorageManager } from '../../StorageManager';
import { EnhancedFileImport } from '../EnhancedFileImport';

interface DialogManagerProps {
  dialogState: DialogState;
  diagramState: DiagramHookState & DiagramHookActions;
}

export const DialogManager: React.FC<DialogManagerProps> = ({
  dialogState,
  diagramState
}) => {
  const { currentDialog, closeDialog } = dialogState;
  
  // Return the appropriate dialog based on the current state
  const renderDialog = () => {
    switch(currentDialog) {
      case 'save':
        return <SaveDialog diagramState={diagramState} dialogState={dialogState} />;
        
      case 'load':
        return <LoadDialog diagramState={diagramState} dialogState={dialogState} />;
        
      case 'export':
        return <ExportDialog diagramActions={diagramState} dialogState={dialogState} />;
        
      case 'import':
        return (
          <EnhancedFileImport
            onFileSelect={(file) => {
              diagramState.importDiagram(file).then(() => closeDialog());
            }}
            onClose={closeDialog}
            accept=".json"
            maxSize={10}
          />
        );
        
      case 'keyboard':
        return <KeyboardShortcuts onClose={closeDialog} />;
        
      case 'storage':
        return <StorageManager onClose={closeDialog} />;
        
      default:
        return null;
    }
  };
  
  return <>{renderDialog()}</>;
};
