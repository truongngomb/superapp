/**
 * Modern Header Component
 * Header with primary color background, branding, and tools
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, 
  Menu, 
  Moon, 
  Sun, 
  User, 
  X, 
  Bell, 
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth, useActivityLogContext } from '@/hooks';
import { useTheme } from '@/context';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Button } from '../common';
import { useLayout } from '@/hooks';

interface ModernHeaderProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function ModernHeader({ onMenuToggle, menuOpen, onSidebarToggle, isSidebarOpen = true }: ModernHeaderProps) {
  const { t } = useTranslation(['common', 'auth']);
  // navigate removed as we use window.location.href for logout
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useActivityLogContext();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { headerContent } = useLayout();

  const handleLogout = useCallback(() => {
    void logout()
      .catch(() => {})
      .finally(() => {
        // Force full reload to verify maintenance status (for Guest)
        window.location.href = '/';
      });
  }, [logout]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
        void document.exitFullscreen();
        setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="h-16 flex items-center justify-between">
        {/* Left: Branding & Mobile Menu Toggle */}
        <div 
          className="flex items-center gap-4 px-4 h-full transition-[width,padding] duration-300 ease-in-out overflow-hidden border-border lg:w-72 lg:px-6 shrink-0"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            {menuOpen ? <X className="w-6 h-6 text-muted-foreground" /> : <Menu className="w-6 h-6 text-muted-foreground" />}
          </Button>
          
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold uppercase tracking-wide hidden sm:inline text-gradient">
              SuperApp
            </span>
          </Link>

          {/* Optional: Horizontal Links could go here if needed, but we'll stick to sidebar for main nav */}
          <div className="hidden md:flex items-center ml-8 gap-6 text-muted-foreground text-sm font-medium">
             {/* Placeholder for top-level nav if we strongly wanted it */}
          </div>
        </div>

        {/* Center: Toggle Sidebar Button & Dynamic Content */}
        <div className="flex-1 hidden lg:flex items-center gap-4 px-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="text-muted-foreground hover:text-foreground shrink-0"
            title={isSidebarOpen ? t('common:hide_sidebar') : t('common:show_sidebar')}
          >
             {isSidebarOpen ? <PanelLeftClose className="w-6 h-6" /> : <PanelLeftOpen className="w-6 h-6" />}
          </Button>

          {/* Dynamic Header Content (e.g., Sub-navigation) */}
          <div className="flex-1 flex items-center overflow-x-auto no-scrollbar py-2 min-w-0">
            <div className="flex items-center gap-1 min-w-max">
              {headerContent}
            </div>
          </div>
        </div>

        {/* Right: Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 px-4 shrink-0">

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher className="text-foreground hover:bg-surface" />

            <Button
               variant="ghost"
               size="icon"
               onClick={toggleTheme}
               className="text-foreground"
               title={isDark ? t('switch_theme_light') : t('switch_theme_dark')}
            >
              {isDark ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </Button>

            <Button
               variant="ghost"
               size="icon"
               onClick={toggleFullscreen}
               className="text-foreground hidden sm:flex"
            >
               {isFullscreen ? <Minimize className="w-5 h-5 text-muted-foreground" /> : <Maximize className="w-5 h-5 text-muted-foreground" />}
            </Button>

            {isAuthenticated && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setIsNotificationsOpen(true); }}
                  className="text-foreground relative"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            )}
            
            {/* User Dropdown / Profile */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 ml-2 pl-2 border-l border-border">
                <div className="text-right hidden sm:block leading-tight">
                  <div className="text-sm font-semibold text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground max-w-[100px] truncate">{user.email}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface text-primary flex items-center justify-center font-bold text-sm ring-2 ring-border overflow-hidden">
                   {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-5 h-5" />
                   )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-1 text-muted-foreground hover:text-red-500"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="ml-2">
                <Button
                  type="button"
                  className="px-4 py-2"
                >
                  {t('auth:login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-navigation Row (Visible only on small screens when headerContent exists) */}
      {headerContent && (
        <div className="lg:hidden border-t border-border bg-background/50 backdrop-blur-md overflow-x-auto no-scrollbar transition-all duration-300">
          <div className="flex items-center gap-1 px-4 py-2 min-w-max">
            {headerContent}
          </div>
        </div>
      )}

      {isAuthenticated && (
        <NotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => { setIsNotificationsOpen(false); }}
        />
      )}
    </header>
  );
}
