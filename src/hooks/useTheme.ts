'use client'
import { useState, useEffect, useCallback } from 'react';
import { Theme, ThemeColors } from '@/types';

// Default themes
const defaultThemes: Theme[] = [
  {
    id: 'default-dark',
    name: 'Dark',
    colors: {
      background: '#121212',
      text: '#ffffff',
      primary: '#bb86fc',
      secondary: '#03dac6',
      accent: '#cf6679',
      error: '#cf6679',
      success: '#03dac6',
      neutral: '#333333'
    }
  },
  {
    id: 'default-light',
    name: 'Light',
    colors: {
      background: '#ffffff',
      text: '#121212',
      primary: '#6200ee',
      secondary: '#03dac6',
      accent: '#bb86fc',
      error: '#b00020',
      success: '#00c853',
      neutral: '#f5f5f5'
    }
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    colors: {
      background: '#241b2f',
      text: '#f8f8f2',
      primary: '#ff7edb',
      secondary: '#36f9f6',
      accent: '#fede5d',
      error: '#ff5555',
      success: '#50fa7b',
      neutral: '#414558'
    }
  }
];

export function useTheme() {
  // Try to load theme from localStorage or use default
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('typer99-theme');
      if (savedTheme) {
        try {
          return JSON.parse(savedTheme);
        } catch (e) {
          console.error('Failed to parse saved theme:', e);
        }
      }
    }
    return defaultThemes[0]; // Default to dark theme
  });
  
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    if (typeof window !== 'undefined') {
      const savedThemes = window.localStorage.getItem('typer99-custom-themes');
      if (savedThemes) {
        try {
          return JSON.parse(savedThemes);
        } catch (e) {
          console.error('Failed to parse custom themes:', e);
        }
      }
    }
    return [];
  });
  
  const allThemes = [...defaultThemes, ...customThemes];
  
  // Save theme changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('typer99-theme', JSON.stringify(currentTheme));
    }
  }, [currentTheme]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('typer99-custom-themes', JSON.stringify(customThemes));
    }
  }, [customThemes]);
  
  // Apply theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [currentTheme]);
  
  // Change theme
  const setTheme = useCallback((themeId: string) => {
    const theme = allThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [allThemes]);
  
  // Create custom theme
  const createTheme = useCallback((name: string, colors: ThemeColors) => {
    const newTheme: Theme = {
      id: `custom-${Date.now()}`,
      name,
      colors
    };
    
    setCustomThemes(prev => [...prev, newTheme]);
    setCurrentTheme(newTheme);
    
    return newTheme;
  }, []);
  
  // Delete custom theme
  const deleteTheme = useCallback((themeId: string) => {
    // Only allow deleting custom themes
    if (!themeId.startsWith('custom-')) return;
    
    setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));
    
    // If currently using this theme, switch to default
    if (currentTheme.id === themeId) {
      setCurrentTheme(defaultThemes[0]);
    }
  }, [currentTheme.id]);
  
  return {
    currentTheme,
    setTheme,
    createTheme,
    deleteTheme,
    availableThemes: allThemes
  };
}
