// src/hooks/useDiagramState.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  DiagramData, 
  SavedDiagram, 
  DiagramHookState, 
  DiagramHookActions,
  DiagramIcon 
} from '../types';
import { useNotifications } from '../components/NotificationSystem';
import { storageService } from '../services/StorageService';

// Import icon collections
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';
import awsIsopack from '@isoflow/isopacks/dist/aws';
import gcpIsopack from '@isoflow/isopacks/dist/gcp';
import azureIsopack from '@isoflow/isopacks/dist/azure';
import kubernetesIsopack from '@isoflow/isopacks/dist/kubernetes';

// Create a singleton instance of icons to avoid recreating on each render
const iconCollections = [
  isoflowIsopack,
  awsIsopack,
  azureIsopack,
  gcpIsopack,
  kubernetesIsopack
];

// Type-safe conversion from Isoflow icon format to our DiagramIcon format
const convertIcons = (): DiagramIcon[] => {
  const flattenedIcons = flattenCollections(iconCollections);
  // Type assertion to make TS happy - we know these will conform to our DiagramIcon interface
  return flattenedIcons as unknown as DiagramIcon[];
};

// Get all icons with proper typing
const allIcons = convertIcons();

// Default colors for diagrams
const defaultColors = [
  { id: 'blue', value: '#0066cc' },
  { id: 'green', value: '#00aa00' },
  { id: 'red', value: '#cc0000' },
  { id: 'orange', value: '#ff9900' },
  { id: 'purple', value: '#9900cc' },
  { id: 'black', value: '#000000' },
  { id: 'gray', value: '#666666' }
];

// Create an empty diagram template
const createEmptyDiagram = (): DiagramData => ({
  title: 'Untitled Diagram',
  icons: allIcons,
  colors: defaultColors,
  items: [],
  views: [],
  fitToScreen: true
});

export function useDiagramState(): DiagramHookState & DiagramHookActions {
  // State management
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
  const [currentDiagram, setCurrentDiagram] = useState<SavedDiagram | null>(null);
  const [diagramName, setDiagramName] = useState('');
  const [diagramData, setDiagramData] = useState<DiagramData>(createEmptyDiagram());
  const [currentModel, setCurrentModel] = useState<DiagramData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [saga3dKey, setSaga3dKey] = useState(0);
  
  const { addNotification } = useNotifications();

  // Load diagrams from storage on mount
  useEffect(() => {
    try {
      const savedDiagrams = storageService.loadDiagrams();
      setDiagrams(savedDiagrams);
      
      // Load last opened diagram
      const lastOpened = storageService.loadLastOpened();
      
      if (lastOpened) {
        try {
          // Always include full icon set
          const dataWithIcons = {
            ...lastOpened.data,
            icons: allIcons
          };
          
          setDiagramData(dataWithIcons);
          setCurrentModel(dataWithIcons);
          
          // Find and set the diagram metadata
          const lastDiagram = savedDiagrams.find(d => d.id === lastOpened.id);
          if (lastDiagram) {
            setCurrentDiagram(lastDiagram);
            setDiagramName(lastDiagram.name);
          }
        } catch (e) {
          console.error('Failed to restore last diagram:', e);
          addNotification('error', 'Load Error', 'Failed to restore your last diagram');
        }
      }
    } catch (error) {
      console.error('Error loading saved diagrams:', error);
      addNotification('error', 'Load Error', 'Failed to load saved diagrams');
    }
  }, []);

  // Save diagrams whenever they change
  useEffect(() => {
    try {
      const success = storageService.saveDiagrams(diagrams);
      if (!success) {
        addNotification('error', 'Save Error', 'Failed to save diagrams');
      }
    } catch (error) {
      console.error('Failed to save diagrams:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        addNotification('error', 'Storage Full', 'Please manage your diagrams to free up space');
      }
    }
  }, [diagrams]);

  // Auto-save functionality
  useEffect(() => {
    if (!currentModel || !hasUnsavedChanges || !currentDiagram) return;
    
    const autoSaveTimer = setTimeout(() => {
      try {
        // Save data without icons to reduce storage
        const savedData: DiagramData = {
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
        const success = storageService.saveLastOpened(currentDiagram.id, savedData);
        if (success) {
          setLastAutoSave(new Date());
          setHasUnsavedChanges(false);
        } else {
          addNotification('error', 'Auto-save Failed', 'Your changes could not be saved automatically');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          addNotification('error', 'Storage Full', 'Please manage your diagrams to free up space');
        } else {
          addNotification('error', 'Auto-save Failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Handle model updates from Isoflow
  const handleModelUpdated = useCallback((model: any) => {
    setCurrentModel(prevModel => {
      const merged = {
        // Start with previous model or diagram data
        ...(prevModel || diagramData),
        // Override with any new data from the model update
        ...model,
        // Ensure we always have required fields
        title: model.title || prevModel?.title || diagramData.title || diagramName || 'Untitled',
        // Keep icons in the data structure for Isoflow to work
        icons: allIcons, // Always use full icon set
        colors: model.colors || prevModel?.colors || diagramData.colors || [],
        // These fields likely come from the model update
        items: model.items !== undefined ? model.items : (prevModel?.items || diagramData.items || []),
        views: model.views !== undefined ? model.views : (prevModel?.views || diagramData.views || []),
        fitToScreen: true
      };
      setHasUnsavedChanges(true);
      return merged;
    });
  }, [diagramData, diagramName]);

  // Create a new diagram
  const createNewDiagram = useCallback(() => {
    const confirmMessage = hasUnsavedChanges 
      ? 'You have unsaved changes. Export your diagram first to save it. Continue?'
      : 'Create a new diagram?';
      
    if (window.confirm(confirmMessage)) {
      const emptyDiagram = createEmptyDiagram();
      setCurrentDiagram(null);
      setDiagramName('');
      setDiagramData(emptyDiagram);
      setCurrentModel(emptyDiagram);
      setSaga3dKey(prev => prev + 1); // Force re-render of Saga3D
      setHasUnsavedChanges(false);
      
      // Clear last opened
      storageService.clearLastOpened();
      return true;
    }
    return false;
  }, [hasUnsavedChanges]);

  // Save diagram
  const saveDiagram = useCallback(async (): Promise<boolean> => {
    if (!diagramName.trim()) {
      addNotification('error', 'Save Error', 'Please enter a diagram name');
      return false;
    }

    try {
      // Construct save data WITHOUT icons (they're loaded separately)
      const savedData: DiagramData = {
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
        setDiagrams(prevDiagrams => 
          prevDiagrams.map(d => d.id === currentDiagram.id ? newDiagram : d)
        );
        addNotification('success', 'Diagram Updated', `"${diagramName}" has been saved to session storage`);
      } else {
        // Add new diagram
        setDiagrams(prevDiagrams => [...prevDiagrams, newDiagram]);
        addNotification('success', 'Diagram Saved', `"${diagramName}" has been saved to session storage`);
      }

      setCurrentDiagram(newDiagram);
      setHasUnsavedChanges(false);
      setLastAutoSave(new Date());
      
      // Save as last opened
      const success = storageService.saveLastOpened(newDiagram.id, savedData);
      if (!success) {
        addNotification('warning', 'Partial Save', 'Diagram saved but last-opened state could not be updated');
      }
      
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        errorMessage = 'Storage quota exceeded. Please manage your diagrams.';
      }
      
      addNotification('error', 'Save Failed', errorMessage);
      return false;
    }
  }, [diagramName, currentDiagram, currentModel, diagramData]);

  // Load diagram
  const loadDiagram = useCallback((diagram: SavedDiagram) => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Continue loading?')) {
      return;
    }
    
    try {
      // Always ensure icons are present when loading
      const dataWithIcons = {
        ...diagram.data,
        icons: allIcons // Replace with full icon set
      };
      
      setCurrentDiagram(diagram);
      setDiagramName(diagram.name);
      setDiagramData(dataWithIcons);
      setCurrentModel(dataWithIcons);
      setSaga3dKey(prev => prev + 1); // Force re-render of Saga3D
      setHasUnsavedChanges(false);
      
      // Save as last opened (without icons)
      const success = storageService.saveLastOpened(diagram.id, diagram.data);
      if (!success) {
        addNotification('warning', 'Load Warning', 'Diagram loaded but last-opened state could not be updated');
      }
    } catch (error) {
      console.error('Load diagram failed:', error);
      addNotification('error', 'Load Failed', `Error loading diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [hasUnsavedChanges]);

  // Delete diagram
  const deleteDiagram = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this diagram?')) {
      try {
        setDiagrams(prevDiagrams => prevDiagrams.filter(d => d.id !== id));
        
        if (currentDiagram?.id === id) {
          setCurrentDiagram(null);
          setDiagramName('');
          storageService.clearLastOpened();
        }
        
        addNotification('info', 'Diagram Deleted', 'The diagram has been removed');
      } catch (error) {
        console.error('Delete diagram failed:', error);
        addNotification('error', 'Delete Failed', `Error deleting diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [currentDiagram]);

  // Import diagram
  const importDiagram = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content);
          
          // Merge imported data with our icons
          const mergedData: DiagramData = {
            ...parsedData,
            title: parsedData.title || 'Imported Diagram',
            icons: allIcons, // Always use app icons
            colors: parsedData.colors?.length ? parsedData.colors : defaultColors,
            fitToScreen: parsedData.fitToScreen !== false
          };
          
          setDiagramData(mergedData);
          setDiagramName(parsedData.title || 'Imported Diagram');
          setCurrentModel(mergedData);
          setSaga3dKey(prev => prev + 1); // Force re-render
          setHasUnsavedChanges(true);
          
          addNotification(
            'success', 
            'Import Successful', 
            `"${parsedData.title || 'Untitled'}" has been imported successfully`
          );
          
          resolve(true);
        } catch (error) {
          console.error('Import failed:', error);
          addNotification('error', 'Import Failed', 'Invalid JSON file. Please check the file format.');
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        addNotification('error', 'Import Failed', 'Error reading file. Please try again.');
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  }, []);

  // Export diagram
  const exportDiagram = useCallback(() => {
    try {
      // For export, DO include icons so the file is self-contained
      const exportData: DiagramData = {
        title: diagramName || currentModel?.title || diagramData.title || 'Exported Diagram',
        icons: allIcons, // Include ALL icons for portability
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
      
      setHasUnsavedChanges(false); // Mark as saved after export
      addNotification('success', 'Export Complete', `"${diagramName || 'diagram'}" has been exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      addNotification('error', 'Export Failed', `Error exporting diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [diagramName, currentModel, diagramData]);

  return {
    // State
    diagrams,
    currentDiagram,
    diagramName,
    diagramData,
    currentModel,
    hasUnsavedChanges,
    lastAutoSave,
    
    // Actions
    setDiagramName,
    createNewDiagram,
    saveDiagram,
    loadDiagram,
    deleteDiagram,
    importDiagram,
    exportDiagram,
    handleModelUpdated
  };
}
