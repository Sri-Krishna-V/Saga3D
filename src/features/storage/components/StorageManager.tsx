import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Button } from '../../../components/ui';

interface StorageInfo {
  readonly used: number;
  readonly diagrams: number;
  readonly otherData: number;
}

interface StorageManagerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/**
 * Storage management component for viewing and managing browser storage usage
 * 
 * Provides functionality to:
 * - View storage usage breakdown
 * - Export all diagrams for backup
 * - Clear storage to free up space
 * - Monitor storage limits
 */
export const StorageManager = React.memo<StorageManagerProps>(({ isOpen, onClose }) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    diagrams: 0,
    otherData: 0
  });

  const calculateStorage = useCallback(() => {
    let totalSize = 0;
    let diagramsSize = 0;
    let otherSize = 0;

    try {
      for (const key in localStorage) {
        const value = localStorage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          totalSize += size;
          
          if (key.startsWith('saga3d-')) {
            diagramsSize += size;
          } else {
            otherSize += size;
          }
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }

    setStorageInfo({
      used: totalSize,
      diagrams: diagramsSize,
      otherData: otherSize
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      calculateStorage();
    }
  }, [isOpen, calculateStorage]);

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const handleClearDiagrams = useCallback(() => {
    if (window.confirm('This will remove all saved diagrams. Are you sure?')) {
      try {
        const keysToRemove: string[] = [];
        for (const key in localStorage) {
          if (key.startsWith('saga3d-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        calculateStorage();
        alert('All diagrams cleared. Please reload the page.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear diagrams:', error);
        alert('Failed to clear diagrams. Please try again.');
      }
    }
  }, [calculateStorage]);

  const handleExportAllDiagrams = useCallback(() => {
    try {
      const diagrams = localStorage.getItem('saga3d-diagrams');
      if (diagrams) {
        const blob = new Blob([diagrams], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `saga3d-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('No diagrams found to export.');
      }
    } catch (error) {
      console.error('Failed to export diagrams:', error);
      alert('Failed to export diagrams. Please try again.');
    }
  }, []);

  const storagePercentage = (storageInfo.used / (5 * 1024 * 1024)) * 100; // Assume 5MB limit

  const getProgressBarColor = (percentage: number): string => {
    if (percentage > 80) return '#f44336'; // Red
    if (percentage > 60) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Storage Manager"
      size="md"
      data-testid="storage-manager-dialog"
    >
      <div className="space-y-6">
        {/* Storage Usage Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Storage Usage</h3>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
            <div 
              className="h-full transition-all duration-300 ease-in-out rounded-full"
              style={{
                width: `${Math.min(storagePercentage, 100)}%`,
                backgroundColor: getProgressBarColor(storagePercentage)
              }}
            />
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Used: {formatBytes(storageInfo.used)} / ~5 MB ({storagePercentage.toFixed(1)}%)
          </p>
          
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Saga3D diagrams: {formatBytes(storageInfo.diagrams)}</li>
            <li>• Other data: {formatBytes(storageInfo.otherData)}</li>
          </ul>
        </div>

        {/* Actions Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
          <div className="flex gap-3">
            <Button 
              variant="primary"
              onClick={handleExportAllDiagrams}
              data-testid="export-all-button"
            >
              📂 Export All Diagrams
            </Button>
            <Button 
              variant="danger"
              onClick={handleClearDiagrams}
              data-testid="clear-all-button"
            >
              🗑️ Clear All Diagrams
            </Button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips to save space:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Export diagrams you don't need immediately</li>
            <li>• Delete old versions of diagrams</li>
            <li>• Clear browser cache if needed</li>
          </ul>
        </div>

        {/* Warning if storage is nearly full */}
        {storagePercentage > 80 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Storage Nearly Full</h4>
            <p className="text-sm text-red-800">
              Your browser storage is {storagePercentage.toFixed(1)}% full. 
              Consider exporting and clearing old diagrams to free up space.
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
});

StorageManager.displayName = 'StorageManager';
