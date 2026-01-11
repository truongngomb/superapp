/**
 * Standard Layout Component
 * The original/classic layout with header, mobile sidebar, and main content area
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

// ============================================================================
// Component
// ============================================================================

export function StandardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={toggleSidebar} menuOpen={sidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <main className="max-w-7xl mx-auto px-4 py-6 safe-area-bottom">
        <div className="pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
