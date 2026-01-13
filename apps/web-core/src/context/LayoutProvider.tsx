import { useState, ReactNode } from 'react';
import { LayoutContext } from './LayoutContext';

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<ReactNode | null>(null);

  return (
    <LayoutContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </LayoutContext.Provider>
  );
}
