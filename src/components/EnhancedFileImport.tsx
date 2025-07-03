import React, { useRef, useState, useCallback } from 'react';

interface EnhancedFileImportProps {
  onFileSelect: (file: File) => void;
  onClose: () => void;
  accept?: string;
  maxSize?: number; // in MB
}

export const EnhancedFileImport: React.FC<EnhancedFileImportProps> = ({
  onFileSelect,
  onClose,
  accept = '.json',
  maxSize = 10
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    
    if (accept === '.json' && !file.name.toLowerCase().endsWith('.json')) {
      return 'Please select a JSON file';
    }
    
    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      onFileSelect(file);
    } catch (err) {
      setError('Failed to process file');
    } finally {
      setIsLoading(false);
    }
  }, [onFileSelect, maxSize, accept, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFile]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog fade-in">
        <h2>📂 Import Diagram</h2>
        
        {error && (
          <div className="alert" style={{ 
            backgroundColor: '#fed7d7', 
            borderColor: '#fc8181', 
            color: '#c53030',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div 
          className={`file-drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
          style={{
            cursor: isLoading ? 'wait' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            pointerEvents: isLoading ? 'none' : 'auto'
          }}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner" style={{ marginBottom: '16px' }}></div>
              <h3>Processing file...</h3>
              <p>Please wait while we import your diagram</p>
            </>
          ) : (
            <>
              <h3>
                {isDragOver ? '📥 Drop your file here' : '📁 Choose a JSON file to import'}
              </h3>
              <p>
                Drag and drop a file here, or click to browse
              </p>
              <button type="button" disabled={isLoading}>
                📁 Select File
              </button>
              <div style={{ marginTop: '20px', fontSize: '14px', color: '#718096' }}>
                <p><strong>Supported:</strong> .json files exported from Isoflow</p>
                <p><strong>Max size:</strong> {maxSize}MB</p>
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className="dialog-buttons">
          <button 
            onClick={onClose} 
            className="secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
