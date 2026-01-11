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
  Minimize
} from 'lucide-react';
import { useAuth, useActivityLogContext } from '@/hooks';
import { useTheme } from '@/context';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationCenter } from '../notifications/NotificationCenter';

interface ModernHeaderProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export function ModernHeader({ onMenuToggle, menuOpen }: ModernHeaderProps) {
  const { t } = useTranslation(['common', 'auth']);
  // navigate removed as we use window.location.href for logout
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useActivityLogContext();
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left: Branding & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-1 rounded-md hover:bg-surface transition-colors lg:hidden"
          >
            {menuOpen ? <X className="w-6 h-6 text-muted-foreground" /> : <Menu className="w-6 h-6 text-muted-foreground" />}
          </button>
          
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

        {/* Right: Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher className="text-foreground hover:bg-surface" />

            <button
               onClick={toggleTheme}
               className="p-2 rounded-full hover:bg-surface transition-colors text-foreground"
               title={isDark ? t('switch_theme_light') : t('switch_theme_dark')}
            >
              {isDark ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>

            <button
               onClick={toggleFullscreen}
               className="p-2 rounded-full hover:bg-surface transition-colors text-foreground hidden sm:block"
            >
               {isFullscreen ? <Minimize className="w-5 h-5 text-muted-foreground" /> : <Maximize className="w-5 h-5 text-muted-foreground" />}
            </button>

            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => { setIsNotificationsOpen(true); }}
                  className="p-2 rounded-full hover:bg-surface transition-colors text-foreground relative"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
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
                
                <button
                  onClick={handleLogout}
                  className="ml-1 p-1.5 rounded-full hover:bg-surface transition-colors text-muted-foreground hover:text-red-500"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="ml-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {t('login', { defaultValue: 'Login' })}
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <NotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => { setIsNotificationsOpen(false); }}
        />
      )}
    </header>
  );
}
