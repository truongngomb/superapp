import { createContext, ReactNode } from 'react';

export interface LayoutContextType {
  headerContent: ReactNode | null;
  setHeaderContent: (content: ReactNode | null) => void;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);
