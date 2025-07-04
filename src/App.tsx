import React from 'react';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { useKeyboardShortcuts } from './components/KeyboardShortcuts';
import { Toolbar } from './components/layout/Toolbar';
import { EditorArea } from './components/layout/EditorArea';
import { StatusBar } from './components/layout/StatusBar';
import { DialogManager } from './components/dialogs/DialogManager';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ViewportProvider } from './contexts/ViewportContext';
import { ViewportControls } from './components/viewport/ViewportControls';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { useDiagramState } from './hooks/useDiagramState';
import { useDialogState } from './hooks/useDialogState';
import './App.css';

function App() {
  // Custom hooks for state management
  const diagramState = useDiagramState();
  const dialogState = useDialogState();
  const { notifications, removeNotification } = useNotifications();
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNew: diagramState.createNewDiagram,
    onSave: () => dialogState.openDialog('save'),
    onLoad: () => dialogState.openDialog('load'),
    onImport: () => dialogState.openDialog('import'),
    onExport: () => dialogState.openDialog('export')
  });

  return (
    <ThemeProvider>
      <ErrorBoundary
        fallbackUI={
          <div className="error-container">
            <h1>Critical Error</h1>
            <p>Sorry, the application has encountered a critical error.</p>
            <button onClick={() => window.location.reload()}>
              Reload Application
            </button>
          </div>
        }
      >
        <ViewportProvider>
          <NotificationSystem 
            notifications={notifications}
            onRemove={removeNotification}
          />
          
          <div className="App">
            <Toolbar 
              diagramState={diagramState} 
              dialogState={dialogState} 
            />

            <EditorArea diagramState={diagramState}>
              <ThemeToggle />
              <ViewportControls />
            </EditorArea>

            <StatusBar 
              diagramState={diagramState}
              dialogState={dialogState}
            />

            <DialogManager 
              dialogState={dialogState}
              diagramState={diagramState}
            />
          </div>
        </ViewportProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
