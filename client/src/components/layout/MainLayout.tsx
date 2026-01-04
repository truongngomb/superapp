/**
 * Main Layout Component
 * Root layout with header, sidebar, and main content area
 */

import { Outlet } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

// ============================================================================
// Component
// ============================================================================

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="mb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
