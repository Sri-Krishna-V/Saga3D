/**
 * Modernized App Component - Clean architecture using new components and context
 * 
 * This replaces the monolithic App.tsx with a clean, modular structure
 * using AppLayout, enhanced components, and optimized state management.
 */

import React, { useState, Suspense } from 'react';
import { DiagramProvider } from './contexts/DiagramContext';
import { AppLayout } from './components/layout';
import { DiagramToolbar } from './components/layout';
import { DiagramCanvas } from './features/diagram/components';
import { StorageManager } from './features/storage';
import { Spinner, ErrorBoundary } from './components/ui';
import { getIconManager } from './utils/iconManager';
import './App.css';

const App: React.FC = () => {
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Initialize icon manager on app startup
  React.useEffect(() => {
    try {
      const iconManager = getIconManager();
      iconManager.initialize();
      console.log('Icon manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize icon manager:', error);
    }
  }, []);

  const handleModelChange = React.useCallback((data: any) => {
    // This would be handled by the diagram context
    // For now, just log the changes
    console.log('Model updated:', data);
  }, []);

  return (
    <DiagramProvider>
      <AppLayout
        toolbar={
          <DiagramToolbar
            onStorageManagerOpen={() => setShowStorageManager(true)}
            onImportDialog={() => setShowImportDialog(true)}
            onExportDialog={() => setShowExportDialog(true)}
          />
        }
      >
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<Spinner size="lg" />}>
            <DiagramCanvas
              className="main-canvas"
              onModelChange={handleModelChange}
            />
          </Suspense>
        </ErrorBoundary>

        {/* Modals */}
        {showStorageManager && (
          <StorageManager 
            isOpen={showStorageManager}
            onClose={() => setShowStorageManager(false)} 
          />
        )}

        {showImportDialog && (
          <div className="dialog-overlay">
            <div className="dialog">
              <h2>Import Diagram</h2>
              <p>Import functionality will be implemented in Phase 2</p>
              <button onClick={() => setShowImportDialog(false)}>Close</button>
            </div>
          </div>
        )}

        {showExportDialog && (
          <div className="dialog-overlay">
            <div className="dialog">
              <h2>Export Diagram</h2>
              <p>Export functionality will be implemented in Phase 2</p>
              <button onClick={() => setShowExportDialog(false)}>Close</button>
            </div>
          </div>
        )}
      </AppLayout>
    </DiagramProvider>
  );
};

export default App;
