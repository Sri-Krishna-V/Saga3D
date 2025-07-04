/**
 * Enhanced Diagram Toolbar - Main toolbar for diagram operations
 * 
 * Provides a comprehensive set of diagram management tools with improved
 * performance, accessibility, and user experience.
 */

import React, { useState, useCallback } from 'react';
import { Button, Dialog } from '../ui';
import { useDiagram } from '../../contexts/DiagramContext';
import type { SavedDiagram } from '../../types';
import './DiagramToolbar.css';

interface DiagramToolbarProps {
  readonly className?: string;
  readonly onStorageManagerOpen?: () => void;
  readonly onImportDialog?: () => void;
  readonly onExportDialog?: () => void;
  readonly 'data-testid'?: string;
}

export const DiagramToolbar = React.memo<DiagramToolbarProps>(({
  className = '',
  onStorageManagerOpen,
  onImportDialog,
  onExportDialog,
  'data-testid': testId,
}) => {
  const {
    state,
    createNewDiagram,
    loadDiagram,
    saveDiagram,
    deleteDiagram,
    updateDiagramTitle,
    clearError,
  } = useDiagram();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [diagramName, setDiagramName] = useState('');

  // Initialize diagram name from current diagram
  React.useEffect(() => {
    if (state.currentDiagram) {
      setDiagramName(state.currentDiagram.title);
    }
  }, [state.currentDiagram]);

  // Optimized event handlers with useCallback
  const handleNewDiagram = useCallback(() => {
    if (state.hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Continue creating new diagram?');
      if (!confirmed) return;
    }

    createNewDiagram();
    setDiagramName('Untitled Diagram');
  }, [state.hasUnsavedChanges, createNewDiagram]);

  const handleSave = useCallback(() => {
    if (!state.currentDiagram) return;
    setShowSaveDialog(true);
  }, [state.currentDiagram]);

  const handleSaveConfirm = useCallback(async () => {
    if (!diagramName.trim()) {
      alert('Please enter a diagram name');
      return;
    }

    const success = await saveDiagram(diagramName.trim());
    if (success) {
      setShowSaveDialog(false);
      updateDiagramTitle(diagramName.trim());
    }
  }, [diagramName, saveDiagram, updateDiagramTitle]);

  const handleLoad = useCallback(() => {
    setShowLoadDialog(true);
  }, []);

  const handleLoadDiagram = (diagram: SavedDiagram) => {
    loadDiagram(diagram);
    setShowLoadDialog(false);
    setDiagramName(diagram.name);
  };

  const handleDeleteDiagram = (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (confirmed) {
      deleteDiagram(id);
    }
  };

  const canSave = state.currentDiagram && !state.isLoading;
  const hasUnsavedIndicator = state.hasUnsavedChanges ? ' •' : '';

  return (
    <div className={`diagram-toolbar ${className}`}>
      <div className="toolbar-section">
        <Button
          onClick={handleNewDiagram}
          variant="secondary"
          disabled={state.isLoading}
        >
          New
        </Button>
        
        <Button
          onClick={handleSave}
          variant="primary"
          disabled={!canSave}
        >
          Save{hasUnsavedIndicator}
        </Button>
        
        <Button
          onClick={handleLoad}
          variant="secondary"
          disabled={state.isLoading}
        >
          Load
        </Button>
      </div>

      <div className="toolbar-section">
        <span className="diagram-title">
          {state.currentDiagram?.title || 'No diagram loaded'}
          {hasUnsavedIndicator}
        </span>
      </div>

      <div className="toolbar-section">
        {onImportDialog && (
          <Button
            onClick={onImportDialog}
            variant="secondary"
            disabled={state.isLoading}
          >
            Import
          </Button>
        )}
        
        {onExportDialog && (
          <Button
            onClick={onExportDialog}
            variant="secondary"
            disabled={!state.currentDiagram || state.isLoading}
          >
            Export
          </Button>
        )}
        
        {onStorageManagerOpen && (
          <Button
            onClick={onStorageManagerOpen}
            variant="secondary"
            disabled={state.isLoading}
          >
            Storage
          </Button>
        )}
      </div>

      {/* Error display */}
      {state.error && (
        <div className="toolbar-error">
          <span>{state.error}</span>
          <Button
            onClick={clearError}
            variant="secondary"
            size="sm"
          >
            ×
          </Button>
        </div>
      )}

      {/* Save Dialog */}
      <Dialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        title="Save Diagram"
      >
        <div className="save-dialog-content">
          <label htmlFor="diagram-name">Diagram Name:</label>
          <input
            id="diagram-name"
            type="text"
            value={diagramName}
            onChange={(e) => setDiagramName(e.target.value)}
            placeholder="Enter diagram name"
            autoFocus
          />
          
          <div className="dialog-actions">
            <Button
              onClick={() => setShowSaveDialog(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfirm}
              variant="primary"
              disabled={!diagramName.trim() || state.isLoading}
            >
              {state.isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Load Dialog */}
      <Dialog
        isOpen={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        title="Load Diagram"
      >
        <div className="load-dialog-content">
          {state.savedDiagrams.length === 0 ? (
            <p>No saved diagrams found.</p>
          ) : (
            <div className="diagram-list">
              {state.savedDiagrams.map((diagram) => (
                <div key={diagram.id} className="diagram-item">
                  <div className="diagram-info">
                    <h4>{diagram.name}</h4>
                    <p className="diagram-meta">
                      Created: {new Date(diagram.createdAt).toLocaleDateString()}
                      {diagram.updatedAt !== diagram.createdAt && (
                        <> • Updated: {new Date(diagram.updatedAt).toLocaleDateString()}</>
                      )}
                    </p>
                    <p className="diagram-stats">
                      {diagram.data.nodes.length} nodes, {diagram.data.connections.length} connections
                    </p>
                  </div>
                  
                  <div className="diagram-actions">
                    <Button
                      onClick={() => handleLoadDiagram(diagram)}
                      variant="primary"
                      size="sm"
                    >
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDeleteDiagram(diagram.id, diagram.name)}
                      variant="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="dialog-actions">
            <Button
              onClick={() => setShowLoadDialog(false)}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
});

DiagramToolbar.displayName = 'DiagramToolbar';
