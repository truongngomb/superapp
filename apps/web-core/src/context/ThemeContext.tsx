/**
 * Theme Provider
 * Manages application theme (light/dark mode)
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { THEME, STORAGE_KEYS } from '@/config';
import { getStorageItem, setStorageItem } from '@/utils';
import { ThemeContext } from './themeContext.internal';

// ============================================================================
// Types
// ============================================================================

type Theme = typeof THEME.LIGHT | typeof THEME.DARK;

// ============================================================================
// Provider
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme if none stored */
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = THEME.LIGHT }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check stored preference first
    const stored = getStorageItem<Theme>(STORAGE_KEYS.THEME);
    if (stored) return stored;

    // Then check system preference
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? THEME.DARK : defaultTheme;
    }

    return defaultTheme;
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === THEME.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no stored preference
      const stored = getStorageItem<Theme>(STORAGE_KEYS.THEME);
      if (!stored) {
        setThemeState(e.matches ? THEME.DARK : THEME.LIGHT);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => { mediaQuery.removeEventListener('change', handleChange); };
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setStorageItem(STORAGE_KEYS.THEME, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === THEME.DARK ? THEME.LIGHT : THEME.DARK);
  }, [theme, setTheme]);

  const value = {
    theme,
    isDark: theme === THEME.DARK,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
