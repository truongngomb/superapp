/**
 * Modern Layout Component
 * Layout with top header and fixed desktop sidebar
 */

import { Outlet } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { ModernHeader } from './ModernHeader';
import { ModernSidebar } from './ModernSidebar';

export function ModernLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <ModernHeader onMenuToggle={toggleSidebar} menuOpen={sidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <ModernSidebar open={sidebarOpen} onClose={closeSidebar} className="h-full" />

        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 safe-area-bottom">
           <div className="max-w-7xl mx-auto pb-8">
             <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
