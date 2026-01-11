import { createContext } from 'react';
import type { SettingsContextType } from './SettingsContext.types';

export const SettingsContext = createContext<SettingsContextType | null>(null);
