// src/adapters/isoflowAdapter.ts
import { DiagramData, DiagramItem } from '../types';

/**
 * Adapts our internal DiagramData to Isoflow's expected format
 */
export const adaptToIsoflow = (data: DiagramData): any => {
  // Ensure diagram items have the required name property for Isoflow
  const adaptedItems = data.items.map(item => ({
    ...item,
    name: item.label || 'Unnamed Item'
  }));

  return {
    ...data,
    items: adaptedItems
  };
};

/**
 * Adapts Isoflow data updates back to our internal format
 */
export const adaptFromIsoflow = (isoflowData: any): DiagramData => {
  // Convert back from Isoflow format to our internal format
  // This ensures compatibility with our storage and state management
  return {
    title: isoflowData.title || 'Untitled',
    version: isoflowData.version,
    description: isoflowData.description,
    icons: Array.isArray(isoflowData.icons) ? isoflowData.icons : [],
    colors: Array.isArray(isoflowData.colors) ? isoflowData.colors : [],
    items: Array.isArray(isoflowData.items) ? isoflowData.items.map((item: any) => ({
      id: item.id,
      type: item.type || 'default',
      x: item.x || 0,
      y: item.y || 0,
      z: item.z,
      iconId: item.iconId,
      label: item.name || item.label,
      properties: item.properties
    })) : [],
    views: Array.isArray(isoflowData.views) ? isoflowData.views : [],
    fitToScreen: isoflowData.fitToScreen,
    connectors: Array.isArray(isoflowData.connectors) ? isoflowData.connectors : []
  };
};
