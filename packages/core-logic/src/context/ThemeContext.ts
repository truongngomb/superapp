import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  /** Current theme */
  theme: Theme;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Set specific theme */
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
     throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
