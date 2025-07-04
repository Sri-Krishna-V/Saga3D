/**
 * Utility functions for handling diagram data transformations and validation
 */

import { Diagram, DiagramNode, DiagramConnection, ValidationResult } from '../types';

// Legacy interface for backward compatibility
export interface DiagramData {
  title: string;
  version?: string;
  description?: string;
  icons: any[];
  colors: any[];
  items: any[];
  views: any[];
  fitToScreen?: boolean;
}

/**
 * Deep merge two diagram objects with special handling for arrays
 * 
 * @param base - Base diagram data
 * @param update - Updates to apply
 * @returns Merged diagram data
 */
export function mergeDiagramData(base: DiagramData, update: Partial<DiagramData>): DiagramData {
  return {
    title: update.title !== undefined ? update.title : base.title,
    version: update.version !== undefined ? update.version : base.version,
    description: update.description !== undefined ? update.description : base.description,
    // For arrays, completely replace if provided, otherwise keep base
    icons: update.icons !== undefined ? update.icons : base.icons,
    colors: update.colors !== undefined ? update.colors : base.colors,
    items: update.items !== undefined ? update.items : base.items,
    views: update.views !== undefined ? update.views : base.views,
    fitToScreen: update.fitToScreen !== undefined ? update.fitToScreen : base.fitToScreen
  };
}

/**
 * Extract only the data that should be saved/exported, removing runtime-only data
 * 
 * @param fullData - Complete diagram data including runtime state
 * @returns Cleaned diagram data suitable for persistence
 */
export function extractSavableData(fullData: DiagramData): DiagramData {
  return {
    title: fullData.title,
    version: fullData.version,
    description: fullData.description,
    // Only include non-empty arrays
    icons: fullData.icons || [],
    colors: fullData.colors || [],
    items: fullData.items || [],
    views: fullData.views || [],
    fitToScreen: fullData.fitToScreen !== false
  };
}

/**
 * Validate diagram data structure for legacy compatibility
 * 
 * @param data - Data to validate
 * @returns True if data matches DiagramData interface
 */
export function validateDiagramData(data: any): data is DiagramData {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray(data.icons) &&
    Array.isArray(data.colors) &&
    Array.isArray(data.items) &&
    Array.isArray(data.views)
  );
}

/**
 * Validate a modern Diagram object structure
 * 
 * @param data - Data to validate
 * @returns Validation result with detailed error information
 */
export function validateDiagram(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { isValid: false, errors: ['Diagram must be an object'] };
  }

  const diagram = data as any;

  // Required fields
  if (typeof diagram.id !== 'string' || diagram.id.trim() === '') {
    errors.push('Diagram must have a valid id');
  }

  if (typeof diagram.title !== 'string' || diagram.title.trim() === '') {
    errors.push('Diagram must have a valid title');
  }

  if (typeof diagram.version !== 'string') {
    errors.push('Diagram must have a version string');
  }

  // Array fields
  if (!Array.isArray(diagram.nodes)) {
    errors.push('Diagram nodes must be an array');
  }

  if (!Array.isArray(diagram.connections)) {
    errors.push('Diagram connections must be an array');
  }

  if (!Array.isArray(diagram.colors)) {
    errors.push('Diagram colors must be an array');
  }

  if (!Array.isArray(diagram.views)) {
    errors.push('Diagram views must be an array');
  }

  // Metadata validation
  if (typeof diagram.metadata !== 'object' || diagram.metadata === null) {
    errors.push('Diagram metadata must be an object');
  } else {
    if (typeof diagram.metadata.createdAt !== 'string') {
      errors.push('Diagram metadata must include createdAt timestamp');
    }
    if (typeof diagram.metadata.updatedAt !== 'string') {
      errors.push('Diagram metadata must include updatedAt timestamp');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Convert legacy DiagramData to modern Diagram format
 * 
 * @param legacyData - Legacy diagram data
 * @returns Modern Diagram object
 */
export function convertLegacyDiagram(legacyData: DiagramData): Diagram {
  const now = new Date().toISOString();
  
  return {
    id: `diagram-${Date.now()}`,
    title: legacyData.title,
    version: legacyData.version || '1.0.0',
    nodes: legacyData.items?.map((item: any, index: number) => ({
      id: item.id || `node-${index}`,
      type: item.type || 'unknown',
      position: item.position || { x: 0, y: 0 },
      name: item.name || `Node ${index + 1}`,
      description: item.description,
      metadata: item.metadata || {}
    })) || [],
    connections: [], // Legacy data doesn't have structured connections
    colors: legacyData.colors || [],
    views: legacyData.views || [],
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: legacyData.version || '1.0.0',
      description: legacyData.description
    },
    fitToScreen: legacyData.fitToScreen !== false
  };
}

/**
 * Generate a unique ID for diagram entities
 * 
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export function generateId(prefix: string = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone an object, useful for immutable updates
 * 
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  const cloned = {} as any;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}
