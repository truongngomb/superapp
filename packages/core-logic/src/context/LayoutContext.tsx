import { createContext, useContext, ReactNode, useState } from 'react';

export interface LayoutContextType {
  headerContent: ReactNode | null;
  setHeaderContent: (content: ReactNode | null) => void;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<ReactNode | null>(null);

  return (
    <LayoutContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </LayoutContext.Provider>
  );
}
