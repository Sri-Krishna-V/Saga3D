/**
 * Type definitions for React hooks and state management
 */

import { Diagram, DiagramNode, DiagramConnection, SavedDiagram, Viewport } from './diagram';
import { Result, AppError } from './common';

// Diagram context state
export interface DiagramState {
  readonly currentDiagram: Diagram | null;
  readonly savedDiagrams: readonly SavedDiagram[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly hasUnsavedChanges: boolean;
  readonly selectedNodes: readonly string[];
  readonly clipboard: ClipboardData | null;
}

// Diagram actions
export type DiagramAction = 
  | { readonly type: 'DIAGRAM_LOADED'; readonly diagram: Diagram }
  | { readonly type: 'DIAGRAM_CREATED'; readonly diagram: Diagram }
  | { readonly type: 'DIAGRAM_SAVED'; readonly diagram: SavedDiagram }
  | { readonly type: 'NODE_ADDED'; readonly node: DiagramNode }
  | { readonly type: 'NODE_MOVED'; readonly nodeId: string; readonly position: { x: number; y: number } }
  | { readonly type: 'NODE_UPDATED'; readonly nodeId: string; readonly updates: Partial<DiagramNode> }
  | { readonly type: 'NODE_DELETED'; readonly nodeId: string }
  | { readonly type: 'CONNECTION_CREATED'; readonly connection: DiagramConnection }
  | { readonly type: 'CONNECTION_UPDATED'; readonly connectionId: string; readonly updates: Partial<DiagramConnection> }
  | { readonly type: 'CONNECTION_DELETED'; readonly connectionId: string }
  | { readonly type: 'NODES_SELECTED'; readonly nodeIds: readonly string[] }
  | { readonly type: 'CLIPBOARD_SET'; readonly data: ClipboardData }
  | { readonly type: 'ERROR_OCCURRED'; readonly error: AppError }
  | { readonly type: 'LOADING_STARTED' }
  | { readonly type: 'LOADING_FINISHED' }
  | { readonly type: 'UNSAVED_CHANGES_SET'; readonly hasChanges: boolean };

// Clipboard data for copy/paste
export interface ClipboardData {
  readonly nodes: readonly DiagramNode[];
  readonly connections: readonly DiagramConnection[];
  readonly timestamp: string;
}

// Viewport context state
export interface ViewportState {
  readonly viewport: Viewport;
  readonly isDragging: boolean;
  readonly isZooming: boolean;
}

export type ViewportAction =
  | { readonly type: 'VIEWPORT_CHANGED'; readonly viewport: Viewport }
  | { readonly type: 'DRAG_STARTED' }
  | { readonly type: 'DRAG_ENDED' }
  | { readonly type: 'ZOOM_STARTED' }
  | { readonly type: 'ZOOM_ENDED' };

// Hook return types
export interface DiagramOperations {
  readonly addNode: (nodeData: { type: string; position: { x: number; y: number }; name: string }) => Promise<void>;
  readonly moveNode: (nodeId: string, position: { x: number; y: number }) => void;
  readonly updateNode: (nodeId: string, updates: Partial<DiagramNode>) => void;
  readonly deleteNode: (nodeId: string) => void;
  readonly addConnection: (from: string, to: string, name?: string) => void;
  readonly deleteConnection: (connectionId: string) => void;
  readonly selectNodes: (nodeIds: readonly string[]) => void;
  readonly copyNodes: (nodeIds: readonly string[]) => void;
  readonly pasteNodes: (position: { x: number; y: number }) => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export interface StorageOperations {
  readonly saveDiagram: (name: string) => Promise<Result<SavedDiagram, Error>>;
  readonly loadDiagram: (id: string) => Promise<Result<Diagram, Error>>;
  readonly deleteDiagram: (id: string) => Promise<Result<void, Error>>;
  readonly exportDiagram: (format: 'json' | 'png' | 'svg') => Promise<Result<Blob, Error>>;
  readonly importDiagram: (file: File) => Promise<Result<Diagram, Error>>;
}

export interface ViewportOperations {
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly zoomToFit: () => void;
  readonly resetZoom: () => void;
  readonly panTo: (position: { x: number; y: number }) => void;
  readonly centerOnNode: (nodeId: string) => void;
}

// Command pattern for undo/redo
export interface Command {
  readonly id: string;
  readonly type: string;
  readonly timestamp: string;
  execute(): void;
  undo(): void;
  redo(): void;
}

export interface CommandHistory {
  readonly past: readonly Command[];
  readonly present: Command | null;
  readonly future: readonly Command[];
}

// Drag and drop types
export interface DragState {
  readonly isDragging: boolean;
  readonly draggedItem: DiagramNode | null;
  readonly startPosition: { x: number; y: number } | null;
  readonly currentPosition: { x: number; y: number } | null;
}
