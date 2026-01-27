import { useMemo, useState, useCallback, useContext } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { AppLayout } from './AppLayout';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher'; // Base path
import { Button } from '../components/Button';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { IMenuItem } from '@superapp/shared-types';
import { 
  useAuth, 
  useLayoutMode, 
  ActivityLogContext, 
  useLayout,
  useTheme,
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS
} from '@superapp/core-logic';

interface SharedLayoutAdapterProps {
  menuItems: IMenuItem[];
  onViewAllNotifications?: () => void;
  /** Force a specific layout mode, ignoring user settings */
  forceLayoutMode?: 'standard' | 'modern';
}

export function SharedLayoutAdapter({ menuItems: rawMenuItems, onViewAllNotifications, forceLayoutMode }: SharedLayoutAdapterProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const layoutModeFromSettings = useLayoutMode();
  const { headerContent } = useLayout();
  const location = useLocation();
  const { t } = useTranslation(['uikit', 'home']);
  
  // Use forced layout mode if provided, otherwise use settings
  const layoutMode = forceLayoutMode ?? layoutModeFromSettings;
  
  // Hande optional ActivityLogContext
  const activityLog = useContext(ActivityLogContext);
  const unreadCount = activityLog?.unreadCount || 0;

  const [notifOpen, setNotifOpen] = useState(false);

  // Modern Layout Sidebar State
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    return getStorageItem<boolean>(STORAGE_KEYS.DESKTOP_SIDEBAR_OPEN) ?? true;
  });

  const handleDesktopToggle = useCallback(() => {
    setDesktopSidebarOpen(prev => {
      const newState = !prev;
      setStorageItem(STORAGE_KEYS.DESKTOP_SIDEBAR_OPEN, newState);
      return newState;
    });
  }, []);

  const handleLogout = useCallback(() => {
    void logout().catch(() => {}).finally(() => {
        if (typeof window !== 'undefined') {
             window.location.href = '/';
        }
    });
  }, [logout]);

  // Permissions check local to the layout adapter
  const { checkPermission } = useAuth();
  
  const filteredItems = useMemo(() => {
    const filterFn = (items: IMenuItem[]): IMenuItem[] => {
      return items.filter(item => {
        if (item.permission) {
          const { resource, action } = item.permission;
          if (resource && action && !checkPermission(resource, action)) return false;
        }
        return true;
      }).map(item => ({
        ...item,
        children: item.children ? filterFn(item.children) : undefined,
      }));
    };

    return filterFn(rawMenuItems);
  }, [rawMenuItems, checkPermission]);

  const renderNotifications = () => {
     if (!activityLog) return null;
     
     return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setNotifOpen(true); }}
          className="rounded-lg text-foreground relative hover:bg-surface"
          aria-label={t('uikit:toggle_notifications')}
        >
          <Bell className="w-5 h-5 text-muted" />
          {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
          )}
        </Button>
        <NotificationCenter 
          isOpen={notifOpen} 
          onClose={() => { setNotifOpen(false); }} 
          onViewAll={onViewAllNotifications}
        />
      </div>
  );
  };

  const renderLanguageSwitcher = () => {
    return (
    <LanguageSwitcher className="text-foreground hover:bg-surface" />
  );
  };

  const commonProps = {
    items: filteredItems,
    currentPath: location.pathname,
    user: user || undefined,
    isAuthenticated: isAuthenticated,
    onLogout: handleLogout,
    isDark: isDark,
    onToggleTheme: toggleTheme,
    renderNotifications: renderNotifications,
    renderLanguageSwitcher: renderLanguageSwitcher,
    t: (k: string, opt?: Record<string, unknown>) => t(k, opt),
  };

  if (layoutMode === 'modern') {

    return (
      <AppLayout
        layoutMode="modern"
        {...commonProps}
        headerContent={headerContent}
        desktopSidebarOpen={desktopSidebarOpen}
        onDesktopSidebarToggle={handleDesktopToggle}
      >
        <Outlet />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      layoutMode="standard"
      {...commonProps}
    >
      <Outlet />
    </AppLayout>
  );
}
