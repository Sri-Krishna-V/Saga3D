import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, Theme } from '../styles/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme from localStorage or use system preference
  const getInitialTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem('saga3d-theme');
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light'; // Default to light mode
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);
  const [theme, setThemeState] = useState<Theme>(mode === 'light' ? lightTheme : darkTheme);

  // Apply theme to document
  useEffect(() => {
    const newTheme = mode === 'light' ? lightTheme : darkTheme;
    setThemeState(newTheme);
    
    // Update body class
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${mode}`);
    
    // Update CSS variables on root element
    const root = document.documentElement;
    
    // Apply all theme color variables
    Object.entries(newTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--saga-${key}`, value);
    });
    
    // Save to localStorage
    localStorage.setItem('saga3d-theme', mode);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('saga3d-theme');
      
      // Only auto-switch if user hasn't explicitly set a theme
      if (!savedTheme) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
