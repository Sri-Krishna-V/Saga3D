/**
 * Icon Manager - Centralized icon loading and management
 * 
 * Handles loading icons from different isopacks and provides
 * optimized icon sets for different use cases.
 */

import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';
import awsIsopack from '@isoflow/isopacks/dist/aws';
import gcpIsopack from '@isoflow/isopacks/dist/gcp';
import azureIsopack from '@isoflow/isopacks/dist/azure';
import kubernetesIsopack from '@isoflow/isopacks/dist/kubernetes';
import type { Icon, IconCollection } from '../types';

/**
 * Available icon packs
 */
export const AVAILABLE_ISOPACKS = {
  isoflow: isoflowIsopack,
  aws: awsIsopack,
  gcp: gcpIsopack,
  azure: azureIsopack,
  kubernetes: kubernetesIsopack,
} as const;

export type IsopackName = keyof typeof AVAILABLE_ISOPACKS;

/**
 * Essential icon identifiers that Isoflow requires for basic functionality
 */
const ESSENTIAL_ICON_IDS = [
  'arrow',
  'connector',
  'line',
  'path',
  '_isoflow_',
  'isoflow-arrow',
  'isoflow-connector',
] as const;

/**
 * Icon Manager class for centralized icon operations
 */
export class IconManager {
  private static instance: IconManager;
  private allIcons: Icon[] = [];
  private essentialIcons: Icon[] = [];
  private iconsByPack: Map<IsopackName, Icon[]> = new Map();
  private initialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): IconManager {
    if (!IconManager.instance) {
      IconManager.instance = new IconManager();
    }
    return IconManager.instance;
  }

  /**
   * Initialize icon manager with all available icons
   */
  initialize(): void {
    if (this.initialized) return;

    try {
      // Load all icons from all packs and transform them to include URLs
      const rawIcons = flattenCollections(Object.values(AVAILABLE_ISOPACKS)) as unknown as any[];
      
      // Transform raw icons to ensure they have the required url property
      this.allIcons = rawIcons.map(rawIcon => this.transformIcon(rawIcon));
      
      // Extract essential icons
      this.essentialIcons = this.getEssentialIcons();
      
      // Group icons by pack
      this.groupIconsByPack();
      
      this.initialized = true;
      console.log(`IconManager initialized with ${this.allIcons.length} total icons`);
    } catch (error) {
      console.error('Failed to initialize IconManager:', error);
      throw new Error('IconManager initialization failed');
    }
  }

  /**
   * Get all available icons
   */
  getAllIcons(): Icon[] {
    this.ensureInitialized();
    return [...this.allIcons];
  }

  /**
   * Get minimal essential icons for basic functionality
   */
  getEssentialIcons(): Icon[] {
    this.ensureInitialized();
    
    if (this.essentialIcons.length > 0) {
      return [...this.essentialIcons];
    }

    // Find essential icons by ID matching
    const essential = this.allIcons.filter(icon => {
      const id = icon.id?.toLowerCase() || '';
      return ESSENTIAL_ICON_IDS.some(essentialId => id.includes(essentialId));
    });

    // Fallback to first 10 icons if no essential ones found
    if (essential.length === 0 && this.allIcons.length > 0) {
      console.warn('No essential icons found, using fallback');
      return this.allIcons.slice(0, 10);
    }

    this.essentialIcons = essential;
    console.log(`Found ${essential.length} essential icons`);
    return [...essential];
  }

  /**
   * Get icons from specific pack
   */
  getIconsFromPack(packName: IsopackName): Icon[] {
    this.ensureInitialized();
    return this.iconsByPack.get(packName) || [];
  }

  /**
   * Get icons from multiple packs
   */
  getIconsFromPacks(packNames: IsopackName[]): Icon[] {
    this.ensureInitialized();
    const icons: Icon[] = [];
    
    packNames.forEach(packName => {
      const packIcons = this.iconsByPack.get(packName);
      if (packIcons) {
        icons.push(...packIcons);
      }
    });
    
    return icons;
  }

  /**
   * Search icons by name or tags
   */
  searchIcons(query: string, limit?: number): Icon[] {
    this.ensureInitialized();
    
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.getAllIcons();

    const matches = this.allIcons.filter(icon => {
      const name = icon.name?.toLowerCase() || '';
      const id = icon.id?.toLowerCase() || '';
      const tags = icon.tags?.map((tag: string) => tag.toLowerCase()) || [];
      
      return name.includes(searchTerm) || 
             id.includes(searchTerm) || 
             tags.some((tag: string) => tag.includes(searchTerm));
    });

    return limit ? matches.slice(0, limit) : matches;
  }

  /**
   * Get icon by ID
   */
  getIconById(id: string): Icon | undefined {
    this.ensureInitialized();
    return this.allIcons.find(icon => icon.id === id);
  }

  /**
   * Add a new icon to the collection
   */
  addIcon(iconData: Partial<Icon> & { name: string }): Icon {
    this.ensureInitialized();
    
    const newIcon: Icon = {
      id: iconData.id || this.generateIconId(iconData),
      name: iconData.name,
      url: iconData.url || this.generateIconUrl(iconData),
      collection: iconData.collection || 'custom',
      isIsometric: iconData.isIsometric !== false,
      tags: iconData.tags || [],
      metadata: iconData.metadata || {},
    };
    
    this.allIcons.push(newIcon);
    return newIcon;
  }

  /**
   * Get icon by name (first match)
   */
  getIconByName(name: string): Icon | undefined {
    this.ensureInitialized();
    return this.allIcons.find(icon => icon.name?.toLowerCase() === name.toLowerCase());
  }

  /**
   * Get available pack names
   */
  getAvailablePacks(): IsopackName[] {
    return Object.keys(AVAILABLE_ISOPACKS) as IsopackName[];
  }

  /**
   * Get statistics about loaded icons
   */
  getStats(): IconCollection {
    this.ensureInitialized();
    
    const packStats = Array.from(this.iconsByPack.entries()).map(([name, icons]) => ({
      name,
      count: icons.length,
    }));

    return {
      total: this.allIcons.length,
      essential: this.essentialIcons.length,
      packs: packStats,
    };
  }

  /**
   * Ensure manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }

  /**
   * Transform raw icon data to ensure it has the required url property
   */
  private transformIcon(rawIcon: any): Icon {
    // Generate URL if not present
    const url = rawIcon.url || rawIcon.src || this.generateIconUrl(rawIcon);
    
    return {
      id: rawIcon.id || this.generateIconId(rawIcon),
      name: rawIcon.name || rawIcon.id || 'Unknown Icon',
      url: url,
      collection: rawIcon.collection || 'default',
      isIsometric: rawIcon.isIsometric !== false, // Default to true
      tags: rawIcon.tags || [],
      metadata: rawIcon.metadata || {},
      ...rawIcon, // Preserve any additional properties
    };
  }

  /**
   * Generate a URL for an icon based on its properties
   */
  private generateIconUrl(icon: any): string {
    const name = icon.name || icon.id || 'default';
    // Create a data URL or placeholder URL
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="12" y="12" text-anchor="middle" font-size="8">${name}</text></svg>`)}`;
  }

  /**
   * Generate an ID for an icon if not present
   */
  private generateIconId(icon: any): string {
    return icon.id || icon.name?.toLowerCase().replace(/\s+/g, '-') || `icon-${Date.now()}`;
  }

  /**
   * Group icons by their pack
   */
  private groupIconsByPack(): void {
    Object.entries(AVAILABLE_ISOPACKS).forEach(([name, pack]) => {
      try {
        const rawPackIcons = flattenCollections([pack]) as unknown as any[];
        const packIcons = rawPackIcons.map(rawIcon => this.transformIcon(rawIcon));
        this.iconsByPack.set(name as IsopackName, packIcons);
      } catch (error) {
        console.error(`Failed to load ${name} isopack:`, error);
        this.iconsByPack.set(name as IsopackName, []);
      }
    });
  }
}

/**
 * Convenience function to get the icon manager instance
 */
export const getIconManager = (): IconManager => IconManager.getInstance();

/**
 * Legacy compatibility function
 */
export const getMinimalIcons = (allIcons: Icon[]): Icon[] => {
  console.warn('getMinimalIcons is deprecated. Use IconManager.getEssentialIcons() instead');
  const manager = getIconManager();
  return manager.getEssentialIcons();
};
