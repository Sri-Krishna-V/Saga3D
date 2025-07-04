// src/styles/theme.ts

// Saga3D Color Palette - New Design System
const palette = {
  // Primary colors
  babyPowder: '#fffffa', // Light off-white for backgrounds
  davysGray: '#515052',  // Medium gray for text and UI elements
  black: '#000103',      // Pure black for contrasts and shadows
  jet: '#333138',        // Dark gray for surfaces
  vermilion: '#ff312e',  // Bright red for accents and CTAs
  
  // Extended palette with shade variations
  babyPowder_light: '#fffffb',
  babyPowder_lighter: '#fffffc',
  davysGray_dark: '#414142',
  davysGray_light: '#747375',
  davysGray_lighter: '#979698',
  jet_dark: '#2a282e',
  jet_light: '#5b5764',
  vermilion_dark: '#f10400',
  vermilion_light: '#ff5b58',
  
  // Functional colors (light mode)
  lightBackground: '#fffffa', // Baby powder
  lightSurface: '#fffffb',    // Lighter baby powder
  lightSurfaceSecondary: '#fffffc', // Even lighter baby powder
  lightBorder: '#979698',     // Light davy's gray
  lightDivider: '#dcdcdd',    // Lightest davy's gray
  
  // Functional colors (dark mode)
  darkBackground: '#333138',  // Jet
  darkSurface: '#414142',     // Davy's gray dark
  darkSurfaceSecondary: '#515052', // Davy's gray
  darkBorder: '#747375',      // Light davy's gray
  darkDivider: '#979698',     // Lighter davy's gray
  
  // Text colors (light mode)
  lightTextPrimary: '#333138',    // Jet
  lightTextSecondary: '#515052',  // Davy's gray
  lightTextTertiary: '#747375',   // Light davy's gray
  
  // Text colors (dark mode)
  darkTextPrimary: '#fffffa',     // Baby powder
  darkTextSecondary: '#dcdcdd',   // Lightest davy's gray
  darkTextTertiary: '#979698',    // Lighter davy's gray
  
  // Semantic colors
  success: '#22c55e',         // Green
  warning: '#ff9800',         // Orange
  error: '#ff312e',           // Vermilion
  info: '#0ea5e9',            // Blue
};

// Base theme with shared properties
const baseTheme = {
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

// Light theme colors
export const lightTheme = {
  ...baseTheme,
  colors: {
    // Primary palette
    primary: palette.jet,
    secondary: palette.davysGray,
    accent: palette.vermilion,
    
    // UI colors
    background: palette.lightBackground,
    surface: palette.lightSurface,
    surfaceSecondary: palette.lightSurfaceSecondary,
    surfaceTertiary: palette.babyPowder_lighter,
    surfaceElevated: '#FFFFFF',
    surfaceOverlay: 'rgba(51, 49, 56, 0.7)', // Jet with opacity
    
    border: palette.lightBorder,
    borderFocus: palette.vermilion,
    divider: palette.lightDivider,
    
    // Text colors
    textPrimary: palette.lightTextPrimary,
    textSecondary: palette.lightTextSecondary,
    textTertiary: palette.lightTextTertiary,
    textOnPrimary: palette.babyPowder,
    textOnAccent: palette.babyPowder,
    
    // Semantic colors
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
    
    // Button colors
    buttonPrimary: palette.jet,
    buttonPrimaryHover: palette.jet_light,
    buttonPrimaryText: palette.babyPowder,
    
    buttonSecondary: palette.davysGray,
    buttonSecondaryHover: palette.davysGray_light,
    buttonSecondaryText: palette.babyPowder,
    
    buttonAccent: palette.vermilion,
    buttonAccentHover: palette.vermilion_light,
    buttonAccentText: palette.babyPowder,
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
    lg: '0 10px 25px rgba(0,0,0,0.05), 0 5px 10px rgba(0,0,0,0.03)',
    accent: `0 0 0 2px ${palette.vermilion_light}`,
  },
};

// Dark theme colors
export const darkTheme = {
  ...baseTheme,
  colors: {
    // Primary palette
    primary: palette.babyPowder,
    secondary: palette.davysGray_light,
    accent: palette.vermilion,
    
    // UI colors
    background: palette.darkBackground,
    surface: palette.darkSurface,
    surfaceSecondary: palette.darkSurfaceSecondary,
    surfaceTertiary: palette.jet_light,
    surfaceElevated: palette.davysGray,
    surfaceOverlay: 'rgba(0, 1, 3, 0.8)', // Black with opacity
    
    border: palette.darkBorder,
    borderFocus: palette.vermilion_light,
    divider: palette.darkDivider,
    
    // Text colors
    textPrimary: palette.darkTextPrimary,
    textSecondary: palette.darkTextSecondary,
    textTertiary: palette.darkTextTertiary,
    textOnPrimary: palette.jet,
    textOnAccent: palette.babyPowder,
    
    // Semantic colors
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
    
    // Button colors
    buttonPrimary: palette.babyPowder,
    buttonPrimaryHover: palette.babyPowder_light,
    buttonPrimaryText: palette.jet,
    
    buttonSecondary: palette.davysGray,
    buttonSecondaryHover: palette.davysGray_light,
    buttonSecondaryText: palette.babyPowder,
    
    buttonAccent: palette.vermilion,
    buttonAccentHover: palette.vermilion_light,
    buttonAccentText: palette.babyPowder,
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.35)',
    md: '0 4px 6px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.2)',
    lg: '0 10px 25px rgba(0,0,0,0.2), 0 5px 10px rgba(0,0,0,0.15)',
    accent: `0 0 0 2px ${palette.vermilion_light}`,
  },
};

// Default theme
export const theme = lightTheme;

export type Theme = typeof lightTheme;
