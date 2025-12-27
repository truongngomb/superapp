import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={toggleSidebar} menuOpen={sidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <main className="container mx-auto px-4 py-6 safe-area-bottom">
        <Outlet />
      </main>
    </div>
  );
}
