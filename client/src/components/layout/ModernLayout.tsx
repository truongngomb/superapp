/**
 * Modern Layout Component
 * Layout with top header and fixed desktop sidebar
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useState, useCallback, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '@/config';
import { getStorageItem, setStorageItem } from '@/utils';
import { ModernHeader } from './ModernHeader';
import { ModernSidebar } from './ModernSidebar';

export function ModernLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    return getStorageItem<boolean>(STORAGE_KEYS.DESKTOP_SIDEBAR_OPEN) ?? true;
  });

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

  const toggleDesktopSidebar = useCallback(() => {
    setDesktopSidebarOpen((prev) => {
      const newState = !prev;
      setStorageItem(STORAGE_KEYS.DESKTOP_SIDEBAR_OPEN, newState);
      return newState;
    });
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <ModernHeader onMenuToggle={toggleSidebar} menuOpen={sidebarOpen} onSidebarToggle={toggleDesktopSidebar} isSidebarOpen={desktopSidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <ModernSidebar open={sidebarOpen} onClose={closeSidebar} desktopOpen={desktopSidebarOpen} className="h-full" />

        <main ref={mainRef} className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 safe-area-bottom">
           <div className="max-w-7xl mx-auto pb-8">
             <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
