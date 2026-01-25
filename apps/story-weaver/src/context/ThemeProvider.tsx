import { useState, useEffect, useCallback, useMemo } from 'react';
import { THEME, STORAGE_KEYS } from '@/config';
import { getStorageItem, setStorageItem } from '@/utils';
import { ThemeContext, type ThemeContextType } from './themeContext.internal';

type Theme = typeof THEME.LIGHT | typeof THEME.DARK;

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from storage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = getStorageItem<Theme>(STORAGE_KEYS.THEME);
    if (stored === THEME.LIGHT || stored === THEME.DARK) return stored;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME.DARK;
    }
    return THEME.LIGHT;
  });

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(THEME.LIGHT, THEME.DARK);
    root.classList.add(theme);
    setStorageItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === THEME.DARK ? THEME.LIGHT : THEME.DARK);
  }, []);

  const value = useMemo<ThemeContextType>(() => ({
    theme,
    isDark: theme === THEME.DARK,
    setTheme,
    toggleTheme,
  }), [theme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
