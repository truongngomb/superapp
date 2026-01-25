import { Outlet, useLocation } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { StandardHeader, StandardHeaderProps } from './StandardHeader';
import { StandardSidebar } from './StandardSidebar';
import { IMenuItem } from '@superapp/shared-types';

export interface StandardLayoutProps extends Omit<StandardHeaderProps, 'menuOpen' | 'onMenuToggle'> {
  // Sidebar items
  items: IMenuItem[];
  currentPath: string;
  children?: React.ReactNode;
}

export function StandardLayout({ 
  items, 
  currentPath, 
  children,
  ...headerProps 
}: StandardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StandardHeader 
        {...headerProps} 
        menuOpen={sidebarOpen} 
        onMenuToggle={toggleSidebar}
        menuItems={items} 
      />
      <StandardSidebar 
        open={sidebarOpen} 
        onClose={closeSidebar} 
        items={items}
        currentPath={currentPath}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 safe-area-bottom">
        <div className="pb-6">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
