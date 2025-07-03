// Centralized storage service with error handling
import { SavedDiagram, DiagramData, StorageInfo } from '../types';

export class StorageService {
  private static instance: StorageService;
  private readonly STORAGE_PREFIX = 'saga3d-';
  private readonly DIAGRAMS_KEY = 'saga3d-diagrams';
  private readonly LAST_OPENED_KEY = 'saga3d-last-opened';
  private readonly LAST_OPENED_DATA_KEY = 'saga3d-last-opened-data';

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Safe localStorage operations with proper error handling
   */
  private safeSetItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to save to localStorage (${key}):`, error);
      
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }
      return false;
    }
  }

  private safeGetItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to read from localStorage (${key}):`, error);
      return null;
    }
  }

  private safeRemoveItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove from localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Handle storage quota exceeded
   */
  private handleQuotaExceeded(): void {
    // Try to clear temporary data first
    const tempKeys = ['saga3d-temp-data', 'saga3d-backup-data'];
    tempKeys.forEach(key => this.safeRemoveItem(key));

    // Notify user through custom event
    window.dispatchEvent(new CustomEvent('saga3d:storage-quota-exceeded', {
      detail: { message: 'Storage quota exceeded. Please manage your diagrams.' }
    }));
  }

  /**
   * Save diagrams array to storage
   */
  saveDiagrams(diagrams: SavedDiagram[]): boolean {
    try {
      // Remove icons from diagram data before storage to save space
      const diagramsForStorage = diagrams.map(diagram => ({
        ...diagram,
        data: {
          ...diagram.data,
          icons: [] // Don't store icons with each diagram
        }
      }));

      const serialized = JSON.stringify(diagramsForStorage);
      return this.safeSetItem(this.DIAGRAMS_KEY, serialized);
    } catch (error) {
      console.error('Failed to serialize diagrams:', error);
      return false;
    }
  }

  /**
   * Load diagrams from storage
   */
  loadDiagrams(): SavedDiagram[] {
    try {
      const data = this.safeGetItem(this.DIAGRAMS_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse diagrams from storage:', error);
      return [];
    }
  }

  /**
   * Save last opened diagram info
   */
  saveLastOpened(diagramId: string, diagramData: DiagramData): boolean {
    // Save data without icons to reduce storage
    const dataToSave = {
      ...diagramData,
      icons: []
    };

    const success1 = this.safeSetItem(this.LAST_OPENED_KEY, diagramId);
    const success2 = this.safeSetItem(this.LAST_OPENED_DATA_KEY, JSON.stringify(dataToSave));
    
    return success1 && success2;
  }

  /**
   * Load last opened diagram info
   */
  loadLastOpened(): { id: string; data: DiagramData } | null {
    try {
      const id = this.safeGetItem(this.LAST_OPENED_KEY);
      const dataStr = this.safeGetItem(this.LAST_OPENED_DATA_KEY);

      if (!id || !dataStr) return null;

      const data = JSON.parse(dataStr);
      return { id, data };
    } catch (error) {
      console.error('Failed to load last opened diagram:', error);
      return null;
    }
  }

  /**
   * Clear last opened info
   */
  clearLastOpened(): boolean {
    const success1 = this.safeRemoveItem(this.LAST_OPENED_KEY);
    const success2 = this.safeRemoveItem(this.LAST_OPENED_DATA_KEY);
    return success1 && success2;
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): StorageInfo {
    let totalUsed = 0;
    let diagramsSize = 0;
    let otherSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const value = this.safeGetItem(key);
        if (!value) continue;

        const size = new Blob([value]).size;
        totalUsed += size;

        if (key.startsWith(this.STORAGE_PREFIX)) {
          diagramsSize += size;
        } else {
          otherSize += size;
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }

    return {
      used: totalUsed,
      diagrams: diagramsSize,
      otherData: otherSize,
      quota: 5 * 1024 * 1024 // 5MB typical limit
    };
  }

  /**
   * Clear all Saga3D data
   */
  clearAllData(): boolean {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => this.safeRemoveItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * Export all diagrams as JSON
   */
  exportAllDiagrams(): string | null {
    try {
      const diagrams = this.loadDiagrams();
      return JSON.stringify(diagrams, null, 2);
    } catch (error) {
      console.error('Failed to export diagrams:', error);
      return null;
    }
  }

  /**
   * Check if storage is healthy
   */
  isStorageHealthy(): boolean {
    try {
      const testKey = 'saga3d-health-check';
      const testValue = 'test';
      
      this.safeSetItem(testKey, testValue);
      const retrieved = this.safeGetItem(testKey);
      this.safeRemoveItem(testKey);
      
      return retrieved === testValue;
    } catch {
      return false;
    }
  }
}

export const storageService = StorageService.getInstance();
