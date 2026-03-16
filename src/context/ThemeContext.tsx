// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mall_e_dark_mode';

interface ThemeContextType {
  dark: boolean;
  toggleDark: () => void;
  colors: typeof lightColors;
}

export const lightColors = {
  background:     '#FFFFFF',
  surface:        '#F2F2F7',
  surfaceRaised:  '#FFFFFF',
  border:         '#E5E5EA',
  text:           '#000000',
  textSecondary:  '#666666',
  textTertiary:   '#999999',
  tabBar:         '#FFFFFF',
  tabBarBorder:   '#E5E5EA',
  tabActive:      '#007AFF',
  tabInactive:    '#8E8E93',
  inputBg:        '#F5F5F5',
  inputText:      '#000000',
  error:          '#C62828',
  errorBg:        '#FFEBEE',
  headerBg:       '#FFFFFF',
  headerText:     '#000000',
};

export const darkColors: typeof lightColors = {
  background:     '#000000',
  surface:        '#1C1C1E',
  surfaceRaised:  '#2C2C2E',
  border:         '#3A3A3C',
  text:           '#FFFFFF',
  textSecondary:  '#EBEBF5CC',
  textTertiary:   '#636366',
  tabBar:         '#1C1C1E',
  tabBarBorder:   '#3A3A3C',
  tabActive:      '#0A84FF',
  tabInactive:    '#636366',
  inputBg:        '#2C2C2E',
  inputText:      '#FFFFFF',
  error:          '#FF453A',
  errorBg:        '#3A1A1A',
  headerBg:       '#1C1C1E',
  headerText:     '#FFFFFF',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (value !== null) setDark(value === 'true');
    });
  }, []);

  const toggleDark = () => {
    setDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const colors = dark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}