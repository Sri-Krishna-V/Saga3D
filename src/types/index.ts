// Saga3D Type Definitions
export interface DiagramIcon {
  id: string;
  name?: string;
  category?: string;
  // Use the actual structure from Isoflow
  [key: string]: unknown;
}

export interface DiagramColor {
  id: string;
  value: string;
  name?: string;
}

export interface DiagramItem {
  id: string;
  type: string;
  x: number;
  y: number;
  z?: number;
  iconId?: string;
  label?: string;
  properties?: Record<string, unknown>;
}

export interface DiagramView {
  id: string;
  name: string;
  camera?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface DiagramData {
  title: string;
  version?: string;
  description?: string;
  icons: DiagramIcon[];
  colors: DiagramColor[];
  items: DiagramItem[];
  views: DiagramView[];
  fitToScreen?: boolean;
  connectors?: any[]; // Type could be refined based on Isoflow's connector structure
}

export interface SavedDiagram {
  id: string;
  name: string;
  data: DiagramData;
  createdAt: string;
  updatedAt: string;
}

export interface IsoflowModelUpdate {
  title?: string;
  items?: DiagramItem[];
  views?: DiagramView[];
  colors?: DiagramColor[];
  // Add other specific Isoflow update fields as needed
}

export interface StorageInfo {
  used: number;
  diagrams: number;
  otherData: number;
  quota: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// UI types
export interface NotificationType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export type DialogType = 'save' | 'load' | 'import' | 'export' | 'keyboard' | 'storage' | 'none';

// Hook interfaces
export interface DiagramHookState {
  diagrams: SavedDiagram[];
  currentDiagram: SavedDiagram | null;
  diagramName: string;
  diagramData: DiagramData;
  currentModel: DiagramData | null;
  hasUnsavedChanges: boolean;
  lastAutoSave: Date | null;
}

export interface DiagramHookActions {
  setDiagramName: (name: string) => void;
  createNewDiagram: () => void;
  saveDiagram: () => Promise<boolean>;
  loadDiagram: (diagram: SavedDiagram) => void;
  deleteDiagram: (id: string) => void;
  importDiagram: (file: File) => Promise<boolean>;
  exportDiagram: () => void;
  handleModelUpdated: (model: any) => void;
}

export interface DialogState {
  currentDialog: DialogType;
  openDialog: (dialog: DialogType) => void;
  closeDialog: () => void;
}
