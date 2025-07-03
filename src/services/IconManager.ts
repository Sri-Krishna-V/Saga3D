// Lazy-loaded icon management service
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import { DiagramIcon } from '../types';

class IconManagerService {
  private static instance: IconManagerService;
  private iconCache: Map<string, DiagramIcon[]> = new Map();
  private loadedPacks: Set<string> = new Set();

  static getInstance(): IconManagerService {
    if (!IconManagerService.instance) {
      IconManagerService.instance = new IconManagerService();
    }
    return IconManagerService.instance;
  }

  /**
   * Get essential system icons only (for initial load)
   */
  getEssentialIcons(): DiagramIcon[] {
    const cached = this.iconCache.get('essential');
    if (cached) return cached;

    // Load only essential system icons
    const essentialIds = ['arrow', 'connector', 'line', 'path'];
    const essential = this.getAllIcons().filter(icon => 
      essentialIds.some(id => icon.id.toLowerCase().includes(id))
    );

    this.iconCache.set('essential', essential);
    return essential;
  }

  /**
   * Lazy load icon pack when needed
   */
  async loadIconPack(packName: 'aws' | 'gcp' | 'azure' | 'kubernetes' | 'isoflow'): Promise<DiagramIcon[]> {
    if (this.loadedPacks.has(packName)) {
      return this.iconCache.get(packName) || [];
    }

    try {
      let pack;
      switch (packName) {
        case 'aws':
          pack = await import('@isoflow/isopacks/dist/aws');
          break;
        case 'gcp':
          pack = await import('@isoflow/isopacks/dist/gcp');
          break;
        case 'azure':
          pack = await import('@isoflow/isopacks/dist/azure');
          break;
        case 'kubernetes':
          pack = await import('@isoflow/isopacks/dist/kubernetes');
          break;
        case 'isoflow':
          pack = await import('@isoflow/isopacks/dist/isoflow');
          break;
        default:
          throw new Error(`Unknown icon pack: ${packName}`);
      }

      const icons = flattenCollections([pack.default]);
      this.iconCache.set(packName, icons);
      this.loadedPacks.add(packName);
      return icons;
    } catch (error) {
      console.error(`Failed to load icon pack ${packName}:`, error);
      return [];
    }
  }

  /**
   * Get all currently loaded icons
   */
  getAllLoadedIcons(): DiagramIcon[] {
    const allIcons: DiagramIcon[] = [];
    this.iconCache.forEach((icons) => {
      allIcons.push(...icons);
    });
    return allIcons;
  }

  /**
   * Get all icons (load everything - use sparingly)
   */
  private getAllIcons(): DiagramIcon[] {
    // This is the heavy operation - only used for filtering essentials
    try {
      const isoflowIsopack = require('@isoflow/isopacks/dist/isoflow').default;
      const awsIsopack = require('@isoflow/isopacks/dist/aws').default;
      const gcpIsopack = require('@isoflow/isopacks/dist/gcp').default;
      const azureIsopack = require('@isoflow/isopacks/dist/azure').default;
      const kubernetesIsopack = require('@isoflow/isopacks/dist/kubernetes').default;

      return flattenCollections([
        isoflowIsopack,
        awsIsopack,
        azureIsopack,
        gcpIsopack,
        kubernetesIsopack
      ]);
    } catch (error) {
      console.error('Failed to load icon packs:', error);
      return [];
    }
  }

  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.iconCache.clear();
    this.loadedPacks.clear();
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): { totalIcons: number; loadedPacks: string[] } {
    const totalIcons = this.getAllLoadedIcons().length;
    return {
      totalIcons,
      loadedPacks: Array.from(this.loadedPacks)
    };
  }
}

export const iconManager = IconManagerService.getInstance();
