'use client';

import React, { createContext, useContext } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Theme, ThemeColors } from '@/types';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  createTheme: (name: string, colors: ThemeColors) => Theme;
  deleteTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeUtils = useTheme();
  
  return (
    <ThemeContext.Provider value={themeUtils}>
      <div className="bg-background text-foreground min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
