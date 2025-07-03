// src/hooks/useDialogState.ts
import { useState, useCallback } from 'react';
import { DialogType, DialogState } from '../types';

export function useDialogState(): DialogState {
  const [currentDialog, setCurrentDialog] = useState<DialogType>('none');
  
  const openDialog = useCallback((dialog: DialogType) => {
    setCurrentDialog(dialog);
  }, []);
  
  const closeDialog = useCallback(() => {
    setCurrentDialog('none');
  }, []);
  
  return {
    currentDialog,
    openDialog,
    closeDialog
  };
}
