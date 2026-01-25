/**
 * Theme Context Definition (Internal)
 * This file is internal and should not be exported from the context module.
 * Use ThemeProvider and useTheme instead.
 */

import { createContext } from 'react';
import { THEME } from '@/config';

// ============================================================================
// Types
// ============================================================================

type Theme = typeof THEME.LIGHT | typeof THEME.DARK;

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

// ============================================================================
// Context
// ============================================================================

export const ThemeContext = createContext<ThemeContextType | null>(null);
