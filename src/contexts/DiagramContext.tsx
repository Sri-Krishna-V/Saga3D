/**
 * Diagram Context - Centralized state management for diagrams
 * 
 * Provides a React context for managing diagram state, operations, and persistence.
 * Uses reducer pattern for predictable state updates and better testability.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Diagram, SavedDiagram, DiagramNode, DiagramConnection, ValidationResult } from '../types';
import { getIconManager } from '../utils/iconManager';
import { useLocalStorage } from '../hooks/useLocalStorage';

// State interface
export interface DiagramState {
  readonly currentDiagram: Diagram | null;
  readonly savedDiagrams: readonly SavedDiagram[];
  readonly hasUnsavedChanges: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly metadata: {
    readonly lastSaved: string | null;
    readonly autoSaveEnabled: boolean;
  };
}

// Action types
export type DiagramAction =
  | { type: 'SET_CURRENT_DIAGRAM'; payload: Diagram | null }
  | { type: 'UPDATE_DIAGRAM_TITLE'; payload: string }
  | { type: 'ADD_NODE'; payload: DiagramNode }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<DiagramNode> } }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'ADD_CONNECTION'; payload: DiagramConnection }
  | { type: 'UPDATE_CONNECTION'; payload: { id: string; updates: Partial<DiagramConnection> } }
  | { type: 'REMOVE_CONNECTION'; payload: string }
  | { type: 'SET_SAVED_DIAGRAMS'; payload: readonly SavedDiagram[] }
  | { type: 'ADD_SAVED_DIAGRAM'; payload: SavedDiagram }
  | { type: 'UPDATE_SAVED_DIAGRAM'; payload: SavedDiagram }
  | { type: 'REMOVE_SAVED_DIAGRAM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: DiagramState = {
  currentDiagram: null,
  savedDiagrams: [],
  hasUnsavedChanges: false,
  isLoading: false,
  error: null,
  metadata: {
    lastSaved: null,
    autoSaveEnabled: true,
  },
};

// Reducer
const diagramReducer = (state: DiagramState, action: DiagramAction): DiagramState => {
  switch (action.type) {
    case 'SET_CURRENT_DIAGRAM':
      return {
        ...state,
        currentDiagram: action.payload,
        hasUnsavedChanges: false,
        error: null,
      };

    case 'UPDATE_DIAGRAM_TITLE':
      if (!state.currentDiagram) return state;
      return {
        ...state,
        currentDiagram: {
          ...state.currentDiagram,
          title: action.payload,
        },
        hasUnsavedChanges: true,
      };

    case 'ADD_NODE':
      if (!state.currentDiagram) return state;
      return {
        ...state,
        currentDiagram: {
          ...state.currentDiagram,
          nodes: [...state.currentDiagram.nodes, action.payload],
        },
        hasUnsavedChanges: true,
      };

    case 'UPDATE_NODE':
      if (!state.currentDiagram) return state;
      return {
        ...state,
        currentDiagram: {
          ...state.currentDiagram,
          nodes: state.currentDiagram.nodes.map(node =>
            node.id === action.payload.id
              ? { ...node, ...action.payload.updates }
              : node
          ),
        },
        hasUnsavedChanges: true,
      };

    case 'REMOVE_NODE':
      if (!state.currentDiagram) return state;
      // Also remove connections that reference this node
      const filteredConnections = state.currentDiagram.connections.filter(
        conn => conn.from !== action.payload && conn.to !== action.payload
      );
      return {
        ...state,
        currentDiagram: {
          ...state.currentDiagram,
          nodes: state.currentDiagram.nodes.filter(node => node.id !== action.payload),
          connections: filteredConnections,
        },
        hasUnsavedChanges: true,
      };

    case 'ADD_CONNECTION':
      if (!state.currentDiagram) return state;
      return {
        ...state,
        currentDiagram: {
          ...state.currentDiagram,
          connections: [...state.currentDiagram.connections, action.payload],
        },
        hasUnsavedChanges: true,
      };

    case 'UPDATE_CONNECTION':
      if (!state.currentDiagram) return state;
      return {
        ...state,
        currentDiagram: {
          ...state.currentDiagram,
          connections: state.currentDiagram.connections.map(conn =>
            conn.id === action.payload.id
              ? { ...conn, ...action.payload.updates }
              : conn
          ),
        },
        hasUnsavedChanges: true,
      };

    case 'REMOVE_CONNECTION':
      if (!state.currentDiagram) return state;
      return {
        ...state,
        currentDiagram: {
          ...state.currentDiagram,
          connections: state.currentDiagram.connections.filter(
            conn => conn.id !== action.payload
          ),
        },
        hasUnsavedChanges: true,
      };

    case 'SET_SAVED_DIAGRAMS':
      return {
        ...state,
        savedDiagrams: action.payload,
      };

    case 'ADD_SAVED_DIAGRAM':
      return {
        ...state,
        savedDiagrams: [...state.savedDiagrams, action.payload],
      };

    case 'UPDATE_SAVED_DIAGRAM':
      return {
        ...state,
        savedDiagrams: state.savedDiagrams.map(diagram =>
          diagram.id === action.payload.id ? action.payload : diagram
        ),
      };

    case 'REMOVE_SAVED_DIAGRAM':
      return {
        ...state,
        savedDiagrams: state.savedDiagrams.filter(diagram => diagram.id !== action.payload),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
};

// Context interface
interface DiagramContextValue {
  state: DiagramState;
  
  // Diagram operations
  createNewDiagram: (title?: string) => void;
  loadDiagram: (diagram: SavedDiagram) => void;
  saveDiagram: (name: string) => Promise<boolean>;
  deleteDiagram: (id: string) => void;
  
  // Node operations
  addNode: (node: DiagramNode) => void;
  updateNode: (id: string, updates: Partial<DiagramNode>) => void;
  removeNode: (id: string) => void;
  
  // Connection operations
  addConnection: (connection: DiagramConnection) => void;
  updateConnection: (id: string, updates: Partial<DiagramConnection>) => void;
  removeConnection: (id: string) => void;
  
  // State operations
  updateDiagramTitle: (title: string) => void;
  validateDiagram: () => ValidationResult;
  clearError: () => void;
}

// Create context
const DiagramContext = createContext<DiagramContextValue | null>(null);

// Provider component
interface DiagramProviderProps {
  children: React.ReactNode;
}

export const DiagramProvider: React.FC<DiagramProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(diagramReducer, initialState);
  const storage = useLocalStorage();

  // Helper functions for type-safe storage operations
  const getValue = useCallback(function<T>(key: string): T | null {
    const result = storage.getItem(key);
    if (!result.success || !result.data) return null;
    
    try {
      return JSON.parse(result.data) as T;
    } catch {
      return null;
    }
  }, [storage]);

  const setValue = useCallback(function<T>(key: string, value: T): boolean {
    try {
      const result = storage.setItem(key, JSON.stringify(value));
      return result.success;
    } catch {
      return false;
    }
  }, [storage]);

  const removeValue = useCallback((key: string): boolean => {
    const result = storage.removeItem(key);
    return result.success;
  }, [storage]);

  // Load saved diagrams on mount
  useEffect(() => {
    const loadSavedDiagrams = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const savedDiagrams = getValue<SavedDiagram[]>('saga3d-diagrams') || [];
        dispatch({ type: 'SET_SAVED_DIAGRAMS', payload: savedDiagrams });
        
        // Load last opened diagram if available
        const lastOpenedId = getValue<string>('saga3d-last-opened');
        if (lastOpenedId) {
          const lastDiagram = savedDiagrams.find((d: SavedDiagram) => d.id === lastOpenedId);
          if (lastDiagram) {
            dispatch({ type: 'SET_CURRENT_DIAGRAM', payload: lastDiagram.data });
          }
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved diagrams' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadSavedDiagrams();
  }, [getValue]);

  // Save diagrams whenever they change
  useEffect(() => {
    if (state.savedDiagrams.length > 0) {
      setValue('saga3d-diagrams', state.savedDiagrams);
    }
  }, [state.savedDiagrams, setValue]);

  // Context value implementation
  const createNewDiagram = useCallback((title = 'Untitled Diagram') => {
    const iconManager = getIconManager();
    iconManager.initialize();

    const newDiagram: Diagram = {
      id: `diagram_${Date.now()}`,
      title,
      version: '1.0.0',
      nodes: [],
      connections: [],
      colors: [
        { id: 'blue', value: '#0066cc' },
        { id: 'green', value: '#00aa00' },
        { id: 'red', value: '#cc0000' },
        { id: 'orange', value: '#ff9900' },
        { id: 'purple', value: '#9900cc' },
        { id: 'black', value: '#000000' },
        { id: 'gray', value: '#666666' },
      ],
      views: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
      },
      fitToScreen: true,
    };

    dispatch({ type: 'SET_CURRENT_DIAGRAM', payload: newDiagram });
  }, []);

  const loadDiagram = useCallback((diagram: SavedDiagram) => {
    if (state.hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Continue loading?');
      if (!confirmed) return;
    }

    dispatch({ type: 'SET_CURRENT_DIAGRAM', payload: diagram.data });
    setValue('saga3d-last-opened', diagram.id);
  }, [state.hasUnsavedChanges, setValue]);

  const saveDiagram = useCallback(async (name: string): Promise<boolean> => {
    if (!state.currentDiagram) return false;
    if (!name.trim()) return false;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const savedDiagram: SavedDiagram = {
        id: state.currentDiagram.id,
        name: name.trim(),
        data: {
          ...state.currentDiagram,
          metadata: {
            ...state.currentDiagram.metadata,
            updatedAt: new Date().toISOString(),
          },
        },
        createdAt: state.currentDiagram.metadata.createdAt,
        updatedAt: new Date().toISOString(),
      };

      // Check if updating existing or creating new
      const existingIndex = state.savedDiagrams.findIndex(d => d.id === savedDiagram.id);
      if (existingIndex >= 0) {
        dispatch({ type: 'UPDATE_SAVED_DIAGRAM', payload: savedDiagram });
      } else {
        dispatch({ type: 'ADD_SAVED_DIAGRAM', payload: savedDiagram });
      }

      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
      setValue('saga3d-last-opened', savedDiagram.id);
      
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save diagram' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDiagram, state.savedDiagrams, setValue]);

  const deleteDiagram = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SAVED_DIAGRAM', payload: id });
    
    // If current diagram is being deleted, clear it
    if (state.currentDiagram?.id === id) {
      dispatch({ type: 'SET_CURRENT_DIAGRAM', payload: null });
    }
    
    // Clear last opened if it was this diagram
    const lastOpenedId = getValue<string>('saga3d-last-opened');
    if (lastOpenedId === id) {
      removeValue('saga3d-last-opened');
    }
  }, [state.currentDiagram?.id, getValue, removeValue]);

  const addNode = useCallback((node: DiagramNode) => {
    dispatch({ type: 'ADD_NODE', payload: node });
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<DiagramNode>) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id, updates } });
  }, []);

  const removeNode = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NODE', payload: id });
  }, []);

  const addConnection = useCallback((connection: DiagramConnection) => {
    dispatch({ type: 'ADD_CONNECTION', payload: connection });
  }, []);

  const updateConnection = useCallback((id: string, updates: Partial<DiagramConnection>) => {
    dispatch({ type: 'UPDATE_CONNECTION', payload: { id, updates } });
  }, []);

  const removeConnection = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CONNECTION', payload: id });
  }, []);

  const updateDiagramTitle = useCallback((title: string) => {
    dispatch({ type: 'UPDATE_DIAGRAM_TITLE', payload: title });
  }, []);

  const validateDiagram = useCallback((): ValidationResult => {
    if (!state.currentDiagram) {
      return { isValid: false, errors: ['No diagram loaded'] };
    }

    const errors: string[] = [];

    // Validate title
    if (!state.currentDiagram.title.trim()) {
      errors.push('Diagram title is required');
    }

    // Validate connections reference existing nodes
    const nodeIds = new Set(state.currentDiagram.nodes.map(n => n.id));
    state.currentDiagram.connections.forEach(conn => {
      if (!nodeIds.has(conn.from)) {
        errors.push(`Connection ${conn.id} references non-existent node: ${conn.from}`);
      }
      if (!nodeIds.has(conn.to)) {
        errors.push(`Connection ${conn.id} references non-existent node: ${conn.to}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [state.currentDiagram]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const contextValue: DiagramContextValue = {
    state,
    createNewDiagram,
    loadDiagram,
    saveDiagram,
    deleteDiagram,
    addNode,
    updateNode,
    removeNode,
    addConnection,
    updateConnection,
    removeConnection,
    updateDiagramTitle,
    validateDiagram,
    clearError,
  };

  return (
    <DiagramContext.Provider value={contextValue}>
      {children}
    </DiagramContext.Provider>
  );
};

// Hook for using the context
export const useDiagram = (): DiagramContextValue => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  return context;
};
