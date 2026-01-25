import { Outlet, useLocation } from 'react-router-dom';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ModernHeader, ModernHeaderProps } from './ModernHeader';
import { ModernSidebar } from './ModernSidebar';
import { IMenuItem } from '@superapp/shared-types';

export interface ModernLayoutProps extends Omit<ModernHeaderProps, 'menuOpen' | 'onMenuToggle' | 'isSidebarOpen' | 'onSidebarToggle'> {
  items: IMenuItem[];
  currentPath: string;
  desktopSidebarOpen?: boolean;
  onDesktopSidebarToggle?: () => void;
  footerText?: React.ReactNode;
  children?: React.ReactNode;
}

export function ModernLayout({ 
  items, 
  currentPath, 
  desktopSidebarOpen,
  onDesktopSidebarToggle,
  footerText,
  children,
  ...headerProps 
}: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Internal state fallback if not controlled
  const [internalDesktopOpen, setInternalDesktopOpen] = useState(true);
  const isDesktopOpen = desktopSidebarOpen !== undefined ? desktopSidebarOpen : internalDesktopOpen;

  const handleDesktopToggle = useCallback(() => {
    if (onDesktopSidebarToggle) {
      onDesktopSidebarToggle();
    } else {
      setInternalDesktopOpen(prev => !prev);
    }
  }, [onDesktopSidebarToggle]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <ModernHeader 
        {...headerProps}
        onMenuToggle={toggleSidebar} 
        menuOpen={sidebarOpen} 
        onSidebarToggle={handleDesktopToggle} 
        isSidebarOpen={isDesktopOpen} 
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <ModernSidebar 
          open={sidebarOpen} 
          onClose={closeSidebar} 
          desktopOpen={isDesktopOpen} 
          className="h-full" 
          items={items}
          currentPath={currentPath}
          user={headerProps.user}
          t={headerProps.t}
          footerText={footerText}
        />

        <main ref={mainRef} className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 safe-area-bottom">
           <div className="max-w-7xl mx-auto pb-8">
             {children || <Outlet />}
           </div>
        </main>
      </div>
    </div>
  );
}
