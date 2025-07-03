// Centralized storage service with comprehensive error handling and data validation
import { SavedDiagram, DiagramData, StorageInfo } from '../types';

/**
 * StorageService - A robust, singleton service for managing local storage operations
 * Features:
 * - Comprehensive error handling and recovery
 * - Data validation and sanitization
 * - Automatic corruption detection and repair
 * - Storage quota management
 * - Memory-efficient operations
 * - Type-safe data persistence
 */
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
   * Handle storage quota exceeded with intelligent cleanup
   */
  private handleQuotaExceeded(): void {
    console.warn('Storage quota exceeded, attempting cleanup...');
    
    try {
      // Try to clear temporary data first
      const tempKeys = ['saga3d-temp-data', 'saga3d-backup-data', 'saga3d-cache-data'];
      let freedSpace = 0;
      
      tempKeys.forEach(key => {
        const value = this.safeGetItem(key);
        if (value) {
          freedSpace += new TextEncoder().encode(value).length;
          this.safeRemoveItem(key);
        }
      });

      // If still not enough space, try clearing old last-opened data
      if (freedSpace < 100 * 1024) { // Less than 100KB freed
        this.clearLastOpened();
      }

      // Notify user through custom event with recovery info
      window.dispatchEvent(new CustomEvent('saga3d:storage-quota-exceeded', {
        detail: { 
          message: 'Storage quota exceeded. Please manage your diagrams.',
          freedSpace,
          recoveryAttempted: true
        }
      }));
    } catch (error) {
      console.error('Failed to handle quota exceeded:', error);
      
      // Fallback notification
      window.dispatchEvent(new CustomEvent('saga3d:storage-quota-exceeded', {
        detail: { 
          message: 'Storage quota exceeded. Manual cleanup required.',
          freedSpace: 0,
          recoveryAttempted: false
        }
      }));
    }
  }

  /**
   * Save diagrams array to storage with validation
   */
  saveDiagrams(diagrams: SavedDiagram[]): boolean {
    // Validate input
    if (!Array.isArray(diagrams)) {
      console.error('Invalid diagrams input: expected array');
      return false;
    }

    try {
      // Validate and sanitize diagrams before storage
      const validDiagrams = diagrams.filter(diagram => {
        if (!diagram || typeof diagram !== 'object') return false;
        if (!diagram.id || typeof diagram.id !== 'string') return false;
        if (!diagram.name || typeof diagram.name !== 'string') return false;
        if (!diagram.data || typeof diagram.data !== 'object') return false;
        return true;
      });

      if (validDiagrams.length !== diagrams.length) {
        console.warn(`Filtered out ${diagrams.length - validDiagrams.length} invalid diagrams`);
      }

      // Remove icons from diagram data before storage to save space
      const diagramsForStorage = validDiagrams.map(diagram => ({
        id: diagram.id,
        name: diagram.name,
        createdAt: diagram.createdAt,
        updatedAt: diagram.updatedAt,
        data: {
          title: diagram.data.title || 'Untitled',
          version: diagram.data.version,
          description: diagram.data.description,
          icons: [], // Don't store icons with each diagram
          colors: Array.isArray(diagram.data.colors) ? diagram.data.colors : [],
          items: Array.isArray(diagram.data.items) ? diagram.data.items : [],
          views: Array.isArray(diagram.data.views) ? diagram.data.views : [],
          fitToScreen: diagram.data.fitToScreen
        }
      }));

      const serialized = JSON.stringify(diagramsForStorage);
      
      // Check size before saving
      const sizeBytes = new TextEncoder().encode(serialized).length;
      if (sizeBytes > 2 * 1024 * 1024) { // 2MB warning threshold
        console.warn(`Large diagram data detected: ${Math.round(sizeBytes / 1024)}KB`);
      }

      return this.safeSetItem(this.DIAGRAMS_KEY, serialized);
    } catch (error) {
      console.error('Failed to serialize diagrams:', error);
      return false;
    }
  }

  /**
   * Load diagrams from storage with validation
   */
  loadDiagrams(): SavedDiagram[] {
    try {
      const data = this.safeGetItem(this.DIAGRAMS_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        console.warn('Invalid diagrams data format, resetting to empty array');
        this.saveDiagrams([]);
        return [];
      }

      // Validate and sanitize each diagram
      const validDiagrams = parsed.filter(diagram => {
        return diagram && 
               typeof diagram.id === 'string' && 
               typeof diagram.name === 'string' && 
               diagram.data && 
               typeof diagram.data === 'object';
      });

      // If we filtered out invalid diagrams, save the cleaned version
      if (validDiagrams.length !== parsed.length) {
        console.warn(`Filtered out ${parsed.length - validDiagrams.length} invalid diagrams`);
        this.saveDiagrams(validDiagrams);
      }

      return validDiagrams;
    } catch (error) {
      console.error('Failed to parse diagrams from storage:', error);
      // Attempt recovery by clearing corrupted data
      this.safeRemoveItem(this.DIAGRAMS_KEY);
      return [];
    }
  }

  /**
   * Save last opened diagram info with validation
   */
  saveLastOpened(diagramId: string, diagramData: DiagramData): boolean {
    // Validate inputs
    if (!diagramId || typeof diagramId !== 'string' || diagramId.length === 0) {
      console.error('Invalid diagram ID provided to saveLastOpened');
      return false;
    }

    if (!diagramData || typeof diagramData !== 'object') {
      console.error('Invalid diagram data provided to saveLastOpened');
      return false;
    }

    try {
      // Save data without icons to reduce storage and sanitize
      const dataToSave: DiagramData = {
        title: diagramData.title || 'Untitled',
        version: diagramData.version,
        description: diagramData.description,
        icons: [], // Don't store icons
        colors: Array.isArray(diagramData.colors) ? diagramData.colors : [],
        items: Array.isArray(diagramData.items) ? diagramData.items : [],
        views: Array.isArray(diagramData.views) ? diagramData.views : [],
        fitToScreen: diagramData.fitToScreen
      };

      const success1 = this.safeSetItem(this.LAST_OPENED_KEY, diagramId);
      const success2 = this.safeSetItem(this.LAST_OPENED_DATA_KEY, JSON.stringify(dataToSave));
      
      return success1 && success2;
    } catch (error) {
      console.error('Failed to save last opened diagram:', error);
      return false;
    }
  }

  /**
   * Load last opened diagram info with validation
   */
  loadLastOpened(): { id: string; data: DiagramData } | null {
    try {
      const id = this.safeGetItem(this.LAST_OPENED_KEY);
      const dataStr = this.safeGetItem(this.LAST_OPENED_DATA_KEY);

      if (!id || !dataStr) return null;

      // Validate ID format
      if (typeof id !== 'string' || id.length === 0) {
        console.warn('Invalid last opened diagram ID');
        this.clearLastOpened();
        return null;
      }

      const data = JSON.parse(dataStr);
      
      // Validate diagram data structure
      if (!data || typeof data !== 'object') {
        console.warn('Invalid last opened diagram data');
        this.clearLastOpened();
        return null;
      }

      // Ensure required properties exist
      const validatedData: DiagramData = {
        title: data.title || 'Untitled',
        version: data.version,
        description: data.description,
        icons: Array.isArray(data.icons) ? data.icons : [],
        colors: Array.isArray(data.colors) ? data.colors : [],
        items: Array.isArray(data.items) ? data.items : [],
        views: Array.isArray(data.views) ? data.views : [],
        fitToScreen: data.fitToScreen
      };

      return { id, data: validatedData };
    } catch (error) {
      console.error('Failed to load last opened diagram:', error);
      // Clear corrupted data
      this.clearLastOpened();
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
   * Get storage usage information with optimized calculation
   */
  getStorageInfo(): StorageInfo {
    let totalUsed = 0;
    let diagramsSize = 0;
    let otherSize = 0;

    try {
      // Use a more efficient approach to avoid potential memory issues
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        try {
          const value = localStorage.getItem(key);
          if (!value) continue;

          // Use TextEncoder for more accurate byte calculation
          const size = new TextEncoder().encode(value).length;
          totalUsed += size;

          if (key.startsWith(this.STORAGE_PREFIX)) {
            diagramsSize += size;
          } else {
            otherSize += size;
          }
        } catch (itemError) {
          console.warn(`Failed to process storage item ${key}:`, itemError);
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }

    // Detect actual quota if possible
    let quota = 5 * 1024 * 1024; // 5MB fallback
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.quota) {
          quota = estimate.quota;
        }
      }).catch(() => {
        // Use fallback quota
      });
    }

    return {
      used: totalUsed,
      diagrams: diagramsSize,
      otherData: otherSize,
      quota
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
   * Check if storage is healthy with comprehensive tests
   */
  isStorageHealthy(): boolean {
    try {
      const testKey = 'saga3d-health-check';
      const testValue = JSON.stringify({ 
        timestamp: Date.now(), 
        test: 'health-check',
        random: Math.random() 
      });
      
      // Test write
      if (!this.safeSetItem(testKey, testValue)) {
        return false;
      }

      // Test read
      const retrieved = this.safeGetItem(testKey);
      if (!retrieved) {
        this.safeRemoveItem(testKey);
        return false;
      }

      // Test parse
      try {
        const parsed = JSON.parse(retrieved);
        if (parsed.test !== 'health-check') {
          this.safeRemoveItem(testKey);
          return false;
        }
      } catch {
        this.safeRemoveItem(testKey);
        return false;
      }

      // Test remove
      if (!this.safeRemoveItem(testKey)) {
        return false;
      }

      // Verify removal
      const afterRemoval = this.safeGetItem(testKey);
      return afterRemoval === null;
    } catch {
      return false;
    }
  }

  /**
   * Perform data integrity check on stored diagrams
   */
  checkDataIntegrity(): { isValid: boolean; issues: string[]; autoFixed: boolean } {
    const issues: string[] = [];
    let autoFixed = false;

    try {
      // Check diagrams data
      const diagrams = this.loadDiagrams();
      if (diagrams.length === 0) {
        return { isValid: true, issues: [], autoFixed: false };
      }

      const validDiagrams: SavedDiagram[] = [];
      
      for (const diagram of diagrams) {
        const diagramIssues: string[] = [];

        // Check required fields
        if (!diagram.id) diagramIssues.push('Missing ID');
        if (!diagram.name) diagramIssues.push('Missing name');
        if (!diagram.data) diagramIssues.push('Missing data');
        
        // Check data structure
        if (diagram.data) {
          if (!diagram.data.title) diagramIssues.push('Missing title');
          if (!Array.isArray(diagram.data.items)) diagramIssues.push('Invalid items array');
          if (!Array.isArray(diagram.data.views)) diagramIssues.push('Invalid views array');
          if (!Array.isArray(diagram.data.colors)) diagramIssues.push('Invalid colors array');
        }

        if (diagramIssues.length === 0) {
          validDiagrams.push(diagram);
        } else {
          issues.push(`Diagram "${diagram.name || diagram.id}": ${diagramIssues.join(', ')}`);
        }
      }

      // Auto-fix by saving only valid diagrams
      if (validDiagrams.length !== diagrams.length && validDiagrams.length > 0) {
        if (this.saveDiagrams(validDiagrams)) {
          autoFixed = true;
          issues.push(`Auto-fixed: Removed ${diagrams.length - validDiagrams.length} corrupted diagrams`);
        }
      }

      // Check last opened data
      const lastOpened = this.loadLastOpened();
      if (lastOpened) {
        if (!lastOpened.id || !lastOpened.data) {
          issues.push('Last opened data is corrupted');
          this.clearLastOpened();
          autoFixed = true;
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        autoFixed
      };
    } catch (error) {
      issues.push(`Integrity check failed: ${error}`);
      return { isValid: false, issues, autoFixed: false };
    }
  }

  /**
   * Attempt to recover corrupted storage data
   */
  recoverStorage(): { success: boolean; message: string; recoveredItems: number } {
    try {
      let recoveredItems = 0;
      
      // Try to recover individual diagrams from localStorage
      const allKeys = Object.keys(localStorage);
      const diagramKeys = allKeys.filter(key => key.startsWith(this.STORAGE_PREFIX));
      
      const recoveredDiagrams: SavedDiagram[] = [];
      
      for (const key of diagramKeys) {
        if (key === this.DIAGRAMS_KEY) continue; // Skip main storage
        
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            // Try to reconstruct diagram structure
            if (parsed && typeof parsed === 'object') {
              const diagram: SavedDiagram = {
                id: key.replace(this.STORAGE_PREFIX, ''),
                name: parsed.name || `Recovered ${recoveredItems + 1}`,
                createdAt: parsed.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                data: parsed.data || parsed
              };
              recoveredDiagrams.push(diagram);
              recoveredItems++;
            }
          }
        } catch (error) {
          console.warn(`Failed to recover data from key ${key}:`, error);
        }
      }
      
      if (recoveredDiagrams.length > 0) {
        // Save recovered diagrams
        if (this.saveDiagrams(recoveredDiagrams)) {
          return {
            success: true,
            message: `Successfully recovered ${recoveredItems} diagrams`,
            recoveredItems
          };
        }
      }
      
      return {
        success: false,
        message: 'No recoverable data found',
        recoveredItems: 0
      };
    } catch (error) {
      return {
        success: false,
        message: `Recovery failed: ${error}`,
        recoveredItems: 0
      };
    }
  }

  /**
   * Create a backup of current storage data
   */
  createBackup(): string | null {
    try {
      const diagrams = this.loadDiagrams();
      const lastOpened = this.loadLastOpened();
      const storageInfo = this.getStorageInfo();
      
      const backup = {
        timestamp: Date.now(),
        version: '1.0',
        data: {
          diagrams,
          lastOpened,
          storageInfo
        }
      };
      
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Failed to create backup:', error);
      return null;
    }
  }

  /**
   * Restore from backup data
   */
  restoreFromBackup(backupData: string): { success: boolean; message: string; restoredCount: number } {
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.data || !Array.isArray(backup.data.diagrams)) {
        return {
          success: false,
          message: 'Invalid backup format',
          restoredCount: 0
        };
      }
      
      // Clear existing data first
      this.clearAllData();
      
      // Restore diagrams
      const success = this.saveDiagrams(backup.data.diagrams);
      
      // Restore last opened if available
      if (backup.data.lastOpened) {
        this.saveLastOpened(backup.data.lastOpened.id, backup.data.lastOpened.data);
      }
      
      return {
        success,
        message: success ? 'Backup restored successfully' : 'Failed to restore backup',
        restoredCount: success ? backup.data.diagrams.length : 0
      };
    } catch (error) {
      return {
        success: false,
        message: `Restore failed: ${error}`,
        restoredCount: 0
      };
    }
  }
}

export const storageService = StorageService.getInstance();
