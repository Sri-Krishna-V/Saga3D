// src/styles/theme.ts
export const theme = {
  colors: {
    // Base colors
    primary: '#0066cc',
    secondary: '#4a5568',
    success: '#38a169',
    warning: '#ed8936',
    danger: '#e53e3e',
    info: '#4299e1',
    
    // UI colors
    background: '#ffffff',
    surface: '#f7fafc',
    border: '#e2e8f0',
    divider: '#edf2f7',
    
    // Text colors
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    textTertiary: '#718096',
    textLight: '#a0aec0',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    round: '9999px',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
    lg: '0 10px 25px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.05)',
  },
  
  animation: {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
  },
  
  zIndex: {
    base: 0,
    dialog: 100,
    tooltip: 200,
    notification: 300,
  }
};

export type Theme = typeof theme;
