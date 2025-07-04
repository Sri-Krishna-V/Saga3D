/**
 * Core diagram type definitions for Saga3D
 * 
 * These types define the structure of diagrams, nodes, connections, and related entities.
 * All types are immutable (readonly) to ensure data integrity and predictable state updates.
 */

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Color {
  readonly id: string;
  readonly value: string; // Hex color value
}

export interface DiagramMetadata {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string;
  readonly author?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
}

export type NodeType = 
  | 'isoflow__person'
  | 'isoflow__web_app'
  | 'isoflow__api'
  | 'isoflow__microservice'
  | 'isoflow__database'
  | 'isoflow__redis'
  | 'isoflow__gateway'
  | 'isoflow__load_balancer'
  | 'isoflow__authentication'
  | 'isoflow__shield'
  | 'isoflow__bank'
  | 'isoflow__notification'
  | 'isoflow__monitoring'
  | 'isoflow__cdn'
  | 'isoflow__mobile'
  | 'isoflow__backup'
  | 'isoflow__analytics'
  | 'isoflow__queue'
  | 'isoflow__logs'
  | string; // Allow custom types

export interface DiagramNode {
  readonly id: string;
  readonly type: NodeType;
  readonly position: Position;
  readonly name: string;
  readonly description?: string;
  readonly metadata?: Record<string, unknown>;
  readonly color?: Color;
  readonly size?: Size;
}

export type ConnectionStyle = 'solid' | 'dashed' | 'dotted';

export interface DiagramConnection {
  readonly id: string;
  readonly from: string; // Node ID
  readonly to: string;   // Node ID
  readonly name?: string;
  readonly color?: Color;
  readonly style?: ConnectionStyle;
  readonly metadata?: Record<string, unknown>;
}

export interface DiagramView {
  readonly id: string;
  readonly name: string;
  readonly viewport: Viewport;
  readonly visibleNodes?: readonly string[]; // If specified, only these nodes are visible
  readonly description?: string;
}

export interface Viewport {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
  readonly width: number;
  readonly height: number;
}

export interface Diagram {
  readonly id: string;
  readonly title: string;
  readonly version: string;
  readonly nodes: readonly DiagramNode[];
  readonly connections: readonly DiagramConnection[];
  readonly colors: readonly Color[];
  readonly views: readonly DiagramView[];
  readonly metadata: DiagramMetadata;
  readonly fitToScreen?: boolean;
  // Note: icons are handled separately and not persisted with diagrams
}

// Saved diagram (persisted in storage)
export interface SavedDiagram {
  readonly id: string;
  readonly name: string;
  readonly data: Diagram;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Draft types for creating new entities
export interface NodeCreationData {
  readonly type: NodeType;
  readonly position: Position;
  readonly name: string;
  readonly description?: string;
}

export interface ConnectionCreationData {
  readonly from: string;
  readonly to: string;
  readonly name?: string;
  readonly color?: Color;
  readonly style?: ConnectionStyle;
}

// Icon and icon collection types
export interface Icon {
  readonly id: string;
  readonly name?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Record<string, unknown>;
  // Additional properties that isoflow icons might have (flexible for compatibility)
  readonly [key: string]: unknown;
}

export interface IconPackInfo {
  readonly name: string;
  readonly count: number;
}

export interface IconCollection {
  readonly total: number;
  readonly essential: number;
  readonly packs: readonly IconPackInfo[];
}

// Export formats
export type ExportFormat = 'json' | 'png' | 'svg' | 'pdf';

// Validation result
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}
