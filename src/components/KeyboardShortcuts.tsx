import React, { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + N', description: 'Create new diagram' },
    { key: 'Ctrl + S', description: 'Save diagram' },
    { key: 'Ctrl + O', description: 'Load diagram' },
    { key: 'Ctrl + I', description: 'Import file' },
    { key: 'Ctrl + E', description: 'Export diagram' },
    { key: 'Delete', description: 'Delete selected elements' },
    { key: 'Ctrl + Z', description: 'Undo' },
    { key: 'Ctrl + Y', description: 'Redo' },
    { key: 'Ctrl + A', description: 'Select all' },
    { key: 'Ctrl + D', description: 'Duplicate selection' },
    { key: 'Mouse Wheel', description: 'Zoom in/out' },
    { key: 'Mouse Drag', description: 'Pan canvas' },
    { key: 'Shift + Mouse Drag', description: 'Select multiple' },
    { key: 'Escape', description: 'Deselect all' }
  ];

  return (
    <div className="dialog-overlay">
      <div className="dialog fade-in" style={{ maxWidth: '500px' }}>
        <h2>⌨️ Keyboard Shortcuts</h2>
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          border: '1px solid var(--saga-border)', // Use CSS variable instead of #e2e8f0
          borderRadius: 'var(--saga-radius-md)' // Use CSS variable instead of 8px
        }}>
          {shortcuts.map((shortcut, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--saga-space-sm) var(--saga-space-md)', // Use CSS variables instead of 12px 16px
                borderBottom: index < shortcuts.length - 1 ? '1px solid var(--saga-border)' : 'none', // Use CSS variable
                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)' // Use theme colors
              }}
            >
              <span style={{ fontSize: '14px', color: 'var(--saga-text-secondary)' }}> {/* Use CSS variable */}
                {shortcut.description}
              </span>
              <kbd style={{
                background: 'linear-gradient(135deg, var(--saga-accent) 0%, var(--saga-warning) 100%)', // Consistent with Saga3D branding
                color: 'var(--saga-text-primary)', // Use CSS variable
                padding: 'var(--saga-space-xs) var(--saga-space-sm)', // Use CSS variables
                borderRadius: 'var(--saga-radius-sm)', // Use CSS variable
                fontSize: '12px',
                fontWeight: '500',
                fontFamily: 'monospace'
              }}>
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="dialog-buttons" style={{ marginTop: '24px' }}>
          <button onClick={onClose} className="secondary" style={{ width: '100%' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (callbacks: {
  onNew?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onImport?: () => void;
  onExport?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            callbacks.onNew?.();
            break;
          case 's':
            e.preventDefault();
            callbacks.onSave?.();
            break;
          case 'o':
            e.preventDefault();
            callbacks.onLoad?.();
            break;
          case 'i':
            e.preventDefault();
            callbacks.onImport?.();
            break;
          case 'e':
            e.preventDefault();
            callbacks.onExport?.();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};
