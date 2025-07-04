/**
 * Hook for safe localStorage operations with error handling and recovery
 */

import { useCallback } from 'react';
import { Result, success, error, SaveError, LoadError } from '../types';

export interface StorageOperations {
  readonly setItem: (key: string, value: string) => Result<void, SaveError>;
  readonly getItem: (key: string) => Result<string | null, LoadError>;
  readonly removeItem: (key: string) => Result<void, Error>;
  readonly clear: () => Result<void, Error>;
  readonly getStorageInfo: () => StorageInfo;
}

export interface StorageInfo {
  readonly used: number;
  readonly available: number;
  readonly quota: number;
  readonly percentage: number;
}

/**
 * Custom hook for safe localStorage operations with comprehensive error handling
 * 
 * Features:
 * - Automatic error recovery by clearing temporary data
 * - Storage quota monitoring
 * - Type-safe error handling with Result types
 * - Detailed storage usage information
 * 
 * @example
 * ```tsx
 * const storage = useLocalStorage();
 * 
 * const saveResult = storage.setItem('key', 'value');
 * if (!saveResult.success) {
 *   console.error('Save failed:', saveResult.error.message);
 * }
 * ```
 */
export const useLocalStorage = (): StorageOperations => {
  const setItem = useCallback((key: string, value: string): Result<void, SaveError> => {
    try {
      localStorage.setItem(key, value);
      return success(undefined);
    } catch (e) {
      console.error(`Failed to save to localStorage (${key}):`, e);
      
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        // Attempt recovery by clearing temporary data
        const recoveryResult = attemptStorageRecovery(key);
        if (recoveryResult) {
          try {
            localStorage.setItem(key, value);
            return success(undefined);
          } catch (e2) {
            return error(new SaveError('Still failed after storage recovery', e2 as Error));
          }
        }
        return error(new SaveError('Storage quota exceeded and recovery failed', e as Error));
      }
      
      return error(new SaveError(`Failed to save item: ${key}`, e as Error));
    }
  }, []);

  const getItem = useCallback((key: string): Result<string | null, LoadError> => {
    try {
      const value = localStorage.getItem(key);
      return success(value);
    } catch (e) {
      console.error(`Failed to read from localStorage (${key}):`, e);
      return error(new LoadError(`Failed to load item: ${key}`, e as Error));
    }
  }, []);

  const removeItem = useCallback((key: string): Result<void, Error> => {
    try {
      localStorage.removeItem(key);
      return success(undefined);
    } catch (e) {
      console.error(`Failed to remove from localStorage (${key}):`, e);
      return error(e as Error);
    }
  }, []);

  const clear = useCallback((): Result<void, Error> => {
    try {
      localStorage.clear();
      return success(undefined);
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
      return error(e as Error);
    }
  }, []);

  const getStorageInfo = useCallback((): StorageInfo => {
    let used = 0;
    const quota = 5 * 1024 * 1024; // Assume 5MB quota for localStorage

    try {
      // Calculate used storage
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          if (value) {
            used += new Blob([value]).size;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to calculate storage usage:', e);
    }

    const available = Math.max(0, quota - used);
    const percentage = (used / quota) * 100;

    return {
      used,
      available,
      quota,
      percentage
    };
  }, []);

  return {
    setItem,
    getItem,
    removeItem,
    clear,
    getStorageInfo
  };
};

/**
 * Attempt to recover storage space by clearing temporary and less important data
 * 
 * @param excludeKey - Key to exclude from cleanup (the one we're trying to save)
 * @returns True if recovery was attempted
 */
function attemptStorageRecovery(excludeKey: string): boolean {
  try {
    // Keys to clean up in order of priority (least important first)
    const cleanupKeys = [
      'saga3d-temp-data',
      'saga3d-last-opened-data',
      'saga3d-cache-',
      'saga3d-preview-'
    ];

    let clearedAny = false;

    for (const keyPattern of cleanupKeys) {
      for (const key in localStorage) {
        if (key !== excludeKey && key.includes(keyPattern)) {
          localStorage.removeItem(key);
          clearedAny = true;
        }
      }
    }

    if (clearedAny) {
      console.log('Storage recovery attempted - cleared temporary data');
    }

    return clearedAny;
  } catch (e) {
    console.error('Storage recovery failed:', e);
    return false;
  }
}

/**
 * Legacy hook for backward compatibility
 * 
 * @deprecated Use useLocalStorage instead
 */
export const usePersistedDiagram = (icons: any[]) => {
  const storage = useLocalStorage();

  const addIconsToDiagram = useCallback((data: any) => {
    return {
      ...data,
      icons: icons
    };
  }, [icons]);

  const removeIconsFromDiagram = useCallback((data: any) => {
    const { icons: _, ...dataWithoutIcons } = data;
    return dataWithoutIcons;
  }, []);

  const safeSetItem = useCallback((key: string, value: string): boolean => {
    const result = storage.setItem(key, value);
    return result.success;
  }, [storage]);

  const safeGetItem = useCallback((key: string): string | null => {
    const result = storage.getItem(key);
    return result.success ? result.data : null;
  }, [storage]);

  return {
    addIconsToDiagram,
    removeIconsFromDiagram,
    safeSetItem,
    safeGetItem
  };
};
