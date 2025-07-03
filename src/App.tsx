import { useState, useEffect } from 'react';
import { Isoflow } from 'isoflow';
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';
import awsIsopack from '@isoflow/isopacks/dist/aws';
import gcpIsopack from '@isoflow/isopacks/dist/gcp';
import azureIsopack from '@isoflow/isopacks/dist/azure';
import kubernetesIsopack from '@isoflow/isopacks/dist/kubernetes';
import { DiagramData } from './diagramUtils';
import { StorageManager } from './StorageManager';
import { EnhancedFileImport } from './components/EnhancedFileImport';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { KeyboardShortcuts, useKeyboardShortcuts } from './components/KeyboardShortcuts';
import './App.css';

const icons = flattenCollections([
  isoflowIsopack,
  awsIsopack,
  azureIsopack,
  gcpIsopack,
  kubernetesIsopack
]);


interface SavedDiagram {
  id: string;
  name: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
  const [currentDiagram, setCurrentDiagram] = useState<SavedDiagram | null>(null);
  const [diagramName, setDiagramName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [saga3dKey, setSaga3dKey] = useState(0); // Key to force re-render of Saga3D
  const [currentModel, setCurrentModel] = useState<DiagramData | null>(null); // Store current model state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotifications();
  
  // Initialize with empty diagram data
  // Create default colors for connectors
  const defaultColors = [
    { id: 'blue', value: '#0066cc' },
    { id: 'green', value: '#00aa00' },
    { id: 'red', value: '#cc0000' },
    { id: 'orange', value: '#ff9900' },
    { id: 'purple', value: '#9900cc' },
    { id: 'black', value: '#000000' },
    { id: 'gray', value: '#666666' }
  ];
  
  
  const [diagramData, setDiagramData] = useState<DiagramData>({
    title: 'Untitled Diagram',
    icons: icons, // Keep full icon set for Saga3D
    colors: defaultColors,
    items: [],
    views: [],
    fitToScreen: true
  });

  // Load diagrams from localStorage on component mount
  useEffect(() => {
    const savedDiagrams = localStorage.getItem('saga3d-diagrams');
    if (savedDiagrams) {
      setDiagrams(JSON.parse(savedDiagrams));
    }
    
    // Load last opened diagram
    const lastOpenedId = localStorage.getItem('saga3d-last-opened');
    const lastOpenedData = localStorage.getItem('saga3d-last-opened-data');
    
    if (lastOpenedId && lastOpenedData) {
      try {
        const data = JSON.parse(lastOpenedData);
        // Always include full icon set
        const dataWithIcons = {
          ...data,
          icons: icons // Replace with full icon set
        };
        setDiagramData(dataWithIcons);
        setCurrentModel(dataWithIcons);
        
        // Find and set the diagram metadata
        if (savedDiagrams) {
          const allDiagrams = JSON.parse(savedDiagrams);
          const lastDiagram = allDiagrams.find((d: SavedDiagram) => d.id === lastOpenedId);
          if (lastDiagram) {
            setCurrentDiagram(lastDiagram);
            setDiagramName(lastDiagram.name);
          }
        }
      } catch (e) {
        console.error('Failed to restore last diagram:', e);
      }
    }
  }, []);

    // Save diagrams to localStorage whenever they change
  useEffect(() => {
    try {
      // Store diagrams without the full icon data
      const diagramsToStore = diagrams.map(d => ({
        ...d,
        data: {
          ...d.data,
          icons: [] // Don't store icons with each diagram
        }
      }));
      localStorage.setItem('saga3d-diagrams', JSON.stringify(diagramsToStore));
    } catch (e) {
      console.error('Failed to save diagrams:', e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please export important diagrams and clear some space.');
      }
    }
  }, [diagrams]);

  const saveDiagram = () => {
    if (!diagramName.trim()) {
      addNotification('error', 'Save Error', 'Please enter a diagram name');
      return;
    }

    // Construct save data WITHOUT icons (they're loaded separately)
    const savedData = {
      title: diagramName,
      icons: [], // Don't save icons with diagram
      colors: currentModel?.colors || diagramData.colors || [],
      items: currentModel?.items || diagramData.items || [],
      views: currentModel?.views || diagramData.views || [],
      fitToScreen: true
    };
    

    const newDiagram: SavedDiagram = {
      id: currentDiagram?.id || Date.now().toString(),
      name: diagramName,
      data: savedData,
      createdAt: currentDiagram?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (currentDiagram) {
      // Update existing diagram
      setDiagrams(diagrams.map((d: any) => d.id === currentDiagram.id ? newDiagram : d));
      addNotification('success', 'Diagram Updated', `"${diagramName}" has been saved to session storage`);
    } else {
      // Add new diagram
      setDiagrams([...diagrams, newDiagram]);
      addNotification('success', 'Diagram Saved', `"${diagramName}" has been saved to session storage`);
    }

    setCurrentDiagram(newDiagram);
    setShowSaveDialog(false);
    setHasUnsavedChanges(false);
    setLastAutoSave(new Date());
    
    // Save as last opened
    try {
      localStorage.setItem('saga3d-last-opened', newDiagram.id);
      localStorage.setItem('saga3d-last-opened-data', JSON.stringify(newDiagram.data));
    } catch (e) {
      console.error('Failed to save diagram:', e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        addNotification('error', 'Storage Full', 'Please use Storage Manager to free up space');
        setShowStorageManager(true);
      }
    }
  };

  const loadDiagram = (diagram: SavedDiagram) => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Continue loading?')) {
      return;
    }
    
    // Always ensure icons are present when loading
    const dataWithIcons = {
      ...diagram.data,
      icons: icons // Replace with full icon set
    };
    
    setCurrentDiagram(diagram);
    setDiagramName(diagram.name);
    setDiagramData(dataWithIcons);
    setCurrentModel(dataWithIcons);
    setSaga3dKey(prev => prev + 1); // Force re-render of Saga3D
    setShowLoadDialog(false);
    setHasUnsavedChanges(false);
    
    // Save as last opened (without icons)
    try {
      localStorage.setItem('saga3d-last-opened', diagram.id);
      localStorage.setItem('saga3d-last-opened-data', JSON.stringify(diagram.data));
    } catch (e) {
      console.error('Failed to save last opened:', e);
    }
  };

  const deleteDiagram = (id: string) => {
    if (window.confirm('Are you sure you want to delete this diagram?')) {
      setDiagrams(diagrams.filter(d => d.id !== id));
      if (currentDiagram?.id === id) {
        setCurrentDiagram(null);
        setDiagramName('');
      }
    }
  };

  const newDiagram = () => {
    const message = hasUnsavedChanges 
      ? 'You have unsaved changes. Export your diagram first to save it. Continue?'
      : 'Create a new diagram?';
      
    if (window.confirm(message)) {
      const emptyDiagram: DiagramData = {
        title: 'Untitled Diagram',
        icons: icons, // Always include full icon set
        colors: defaultColors,
        items: [],
        views: [],
        fitToScreen: true
      };
      setCurrentDiagram(null);
      setDiagramName('');
      setDiagramData(emptyDiagram);
      setCurrentModel(emptyDiagram); // Reset current model too
      setSaga3dKey(prev => prev + 1); // Force re-render of Saga3D
      setHasUnsavedChanges(false);
      
      // Clear last opened
      localStorage.removeItem('saga3d-last-opened');
      localStorage.removeItem('saga3d-last-opened-data');
    }
  };

  const handleModelUpdated = (model: any) => {
    // Store the current model state whenever it updates
    // Model update received
    
    // Deep merge the model update with our current state
    // This handles both complete and partial updates
    setCurrentModel((prevModel: DiagramData | null) => {
      const merged = {
        // Start with previous model or diagram data
        ...(prevModel || diagramData),
        // Override with any new data from the model update
        ...model,
        // Ensure we always have required fields
        title: model.title || prevModel?.title || diagramData.title || diagramName || 'Untitled',
        // Keep icons in the data structure for Saga3D to work
        icons: icons, // Always use full icon set
        colors: model.colors || prevModel?.colors || diagramData.colors || [],
        // These fields likely come from the model update
        items: model.items !== undefined ? model.items : (prevModel?.items || diagramData.items || []),
        views: model.views !== undefined ? model.views : (prevModel?.views || diagramData.views || []),
        fitToScreen: true
      };
      setHasUnsavedChanges(true);
      return merged;
    });
  };

  const exportDiagram = () => {
    // For export, DO include icons so the file is self-contained
    const exportData = {
      title: diagramName || currentModel?.title || diagramData.title || 'Exported Diagram',
      icons: icons, // Include ALL icons for portability
      colors: currentModel?.colors || diagramData.colors || [],
      items: currentModel?.items || diagramData.items || [],
      views: currentModel?.views || diagramData.views || [],
      fitToScreen: true
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName || 'diagram'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setShowExportDialog(false);
    setHasUnsavedChanges(false); // Mark as saved after export
    addNotification('success', 'Export Complete', `"${diagramName || 'diagram'}" has been exported successfully`);
  };

  const handleFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Merge imported data with our icons
        const mergedData: DiagramData = {
          ...parsedData,
          title: parsedData.title || 'Imported Diagram',
          icons: icons, // Always use app icons
          colors: parsedData.colors?.length ? parsedData.colors : defaultColors,
          fitToScreen: parsedData.fitToScreen !== false
        };
        
        setDiagramData(mergedData);
        setDiagramName(parsedData.title || 'Imported Diagram');
        setCurrentModel(mergedData);
        setSaga3dKey((prev: any) => prev + 1); // Force re-render
        setShowImportDialog(false);
        setHasUnsavedChanges(true);
        
        addNotification(
          'success', 
          'Import Successful', 
          `"${parsedData.title || 'Untitled'}" has been imported successfully`
        );
      } catch (error) {
        addNotification('error', 'Import Failed', 'Invalid JSON file. Please check the file format.');
      }
    };
    
    reader.onerror = () => {
      addNotification('error', 'Import Failed', 'Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  };
  // Auto-save functionality
  useEffect(() => {
    if (!currentModel || !hasUnsavedChanges || !currentDiagram) return;
    
    const autoSaveTimer = setTimeout(() => {
      const savedData = {
        title: diagramName || currentDiagram.name,
        icons: [], // Don't save icons in auto-save
        colors: currentModel.colors || [],
        items: currentModel.items || [],
        views: currentModel.views || [],
        fitToScreen: true
      };
      
      const updatedDiagram: SavedDiagram = {
        ...currentDiagram,
        data: savedData,
        updatedAt: new Date().toISOString()
      };
      
      setDiagrams(prevDiagrams => 
        prevDiagrams.map(d => d.id === currentDiagram.id ? updatedDiagram : d)
      );
      
      // Update last opened data
      try {
        localStorage.setItem('saga3d-last-opened-data', JSON.stringify(savedData));
        setLastAutoSave(new Date());
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error('Auto-save failed:', e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          alert('Storage full! Please use Storage Manager to free up space.');
          setShowStorageManager(true);
        }
      }
    }, 5000); // Auto-save after 5 seconds of changes
    
    return () => clearTimeout(autoSaveTimer);
  }, [currentModel, hasUnsavedChanges, currentDiagram, diagramName]);
  
  // Warn before closing if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNew: newDiagram,
    onSave: () => setShowSaveDialog(true),
    onLoad: () => setShowLoadDialog(true),
    onImport: () => setShowImportDialog(true),
    onExport: () => setShowExportDialog(true)
  });

  return (
    <>
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      <div className="App">
        <div className="toolbar">
          <div className="toolbar-group brand-group">
            <div className="brand-identity">
              <h1 className="brand-title">Saga3D</h1>
              <p className="brand-tagline">Tell your system's saga in 3D</p>
            </div>
          </div>
          
          <div className="toolbar-group">
            <button onClick={newDiagram} className="primary">
              📄 New
            </button>
            <button onClick={() => setShowSaveDialog(true)} className="secondary">
              💾 Save
            </button>
            <button onClick={() => setShowLoadDialog(true)} className="secondary">
              📁 Load
            </button>
          </div>
          
          <div className="toolbar-group">
            <button 
              onClick={() => setShowImportDialog(true)}
              className="success"
            >
              📂 Import
            </button>
            <button 
              onClick={() => setShowExportDialog(true)}
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
              onClick={() => setShowKeyboardShortcuts(true)}
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
                {hasUnsavedChanges && <span style={{ color: '#ed8936', fontWeight: 'normal' }}> • Modified</span>}
                <div className="session-note">Session storage only - export to save permanently</div>
              </div>
            </div>
          </div>
        </div>

        <div className="saga3d-container">
          <Isoflow 
            key={saga3dKey}
            initialData={diagramData}
            onModelUpdated={handleModelUpdated}
            editorMode="EDITABLE"
          />
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <div style={{ display: 'flex', gap: '20px' }}>
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
          <div style={{ display: 'flex', gap: '20px' }}>
            <div 
              className="status-item clickable"
              onClick={() => setShowStorageManager(true)}
              title="Manage storage"
            >
              🗄️ Storage
            </div>
            <div 
              className="status-item clickable"
              onClick={() => setShowKeyboardShortcuts(true)}
              title="View keyboard shortcuts"
            >
              ⌨️ Shortcuts
            </div>
            <div className="status-item">
              ⚡ Saga3D v1.0
            </div>
          </div>
        </div>

      {/* Save Dialog */}
      {showSaveDialog && (
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
              onKeyDown={(e) => e.key === 'Enter' && saveDiagram()}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={saveDiagram} className="primary">Save to Session</button>
              <button onClick={() => setShowSaveDialog(false)} className="secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="dialog-overlay">
          <div className="dialog fade-in">
            <h2>📁 Load Diagram</h2>
            <div className="alert info">
              <strong>📋 Note:</strong> These saves are temporary. Export your diagrams to keep them permanently.
            </div>
            <div className="diagram-list">
              {diagrams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                  <p>No saved diagrams found in this session</p>
                </div>
              ) : (
                diagrams.map(diagram => (
                  <div key={diagram.id} className="diagram-item">
                    <div className="diagram-info">
                      <h3>{diagram.name}</h3>
                      <div className="meta">
                        <span>Created: {new Date(diagram.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(diagram.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="diagram-actions">
                      <button onClick={() => loadDiagram(diagram)} className="load">Load</button>
                      <button onClick={() => deleteDiagram(diagram.id)} className="delete">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="dialog-buttons">
              <button onClick={() => setShowLoadDialog(false)} className="secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <EnhancedFileImport
          onFileSelect={handleFileImport}
          onClose={() => setShowImportDialog(false)}
          accept=".json"
          maxSize={10}
        />
      )}

      {/* Export Dialog */}
      {showExportDialog && (
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
              <button onClick={exportDiagram} className="primary">📥 Download JSON</button>
              <button onClick={() => setShowExportDialog(false)} className="secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      {showKeyboardShortcuts && (
        <KeyboardShortcuts onClose={() => setShowKeyboardShortcuts(false)} />
      )}

      {/* Storage Manager */}
      {showStorageManager && (
        <StorageManager onClose={() => setShowStorageManager(false)} />
      )}
    </div>
    </>
  );
}

export default App;
