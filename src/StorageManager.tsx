import React, { useState, useEffect } from 'react';

interface StorageInfo {
  used: number;
  diagrams: number;
  otherData: number;
}

export const StorageManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    diagrams: 0,
    otherData: 0
  });

  useEffect(() => {
    calculateStorage();
  }, []);

  const calculateStorage = () => {
    let totalSize = 0;
    let diagramsSize = 0;
    let otherSize = 0;

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

    setStorageInfo({
      used: totalSize,
      diagrams: diagramsSize,
      otherData: otherSize
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearOldDiagrams = () => {
    if (window.confirm('This will remove all saved diagrams. Are you sure?')) {
      const keysToRemove = [];
      for (const key in localStorage) {
        if (key.startsWith('saga3d-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      calculateStorage();
      alert('All diagrams cleared. Please reload the page.');
      window.location.reload();
    }
  };

  const exportAllDiagrams = () => {
    const diagrams = localStorage.getItem('saga3d-diagrams');
    if (diagrams) {
      const blob = new Blob([diagrams], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saga3d-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const storagePercentage = (storageInfo.used / (5 * 1024 * 1024)) * 100; // Assume 5MB limit

  return (
    <div className="dialog-overlay">
      <div className="dialog fade-in" style={{ maxWidth: '600px' }}>
        <h2>🗄️ Storage Manager</h2>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Storage Usage</h3>
          <div style={{
            backgroundColor: '#e2e8f0',
            borderRadius: '8px',
            height: '24px',
            overflow: 'hidden',
            marginBottom: '12px',
            position: 'relative'
          }}>
            <div style={{
              backgroundColor: storagePercentage > 80 ? '#f56565' : storagePercentage > 60 ? '#ed8936' : '#48bb78',
              height: '100%',
              width: `${Math.min(storagePercentage, 100)}%`,
              transition: 'width 0.3s ease',
              borderRadius: '8px'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '12px',
              fontWeight: '600',
              color: storagePercentage > 50 ? 'white' : '#2d3748'
            }}>
              {storagePercentage.toFixed(1)}%
            </div>
          </div>
          <p style={{ margin: '0 0 16px 0', color: '#4a5568' }}>
            <strong>Used:</strong> {formatBytes(storageInfo.used)} / ~5 MB
          </p>
          <div style={{ 
            background: '#f7fafc', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <ul style={{ fontSize: '14px', margin: 0, color: '#718096' }}>
              <li><strong>Saga3D diagrams:</strong> {formatBytes(storageInfo.diagrams)}</li>
              <li><strong>Other data:</strong> {formatBytes(storageInfo.otherData)}</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={exportAllDiagrams}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(72, 187, 120, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(72, 187, 120, 0.3)';
              }}
            >
              📥 Export All Diagrams
            </button>
            <button 
              onClick={clearOldDiagrams}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(245, 101, 101, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 101, 101, 0.3)';
              }}
            >
              🗑️ Clear All Diagrams
            </button>
          </div>
        </div>

        <div className="alert info" style={{ marginBottom: '24px' }}>
          <strong>💡 Tips to save space:</strong>
          <ul style={{ marginBottom: 0, marginTop: '8px' }}>
            <li>Export diagrams you don't need immediately</li>
            <li>Delete old versions of diagrams</li>
            <li>Clear browser cache if needed</li>
          </ul>
        </div>

        <div className="dialog-buttons">
          <button onClick={onClose} className="secondary" style={{ width: '100%' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};