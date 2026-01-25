import { useMemo, useState, useCallback } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout, LanguageSwitcher } from '@superapp/ui-kit';
import { IMenuItem } from '@superapp/shared-types';
import { useAuth, useAppMenu, useLayoutMode, useLayout } from '@/hooks';
import { useTheme } from '@/context';
import { getStorageItem, setStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/config';

export function SharedLayoutAdapter() {
  const { user, isAuthenticated, logout } = useAuth();
  const { menuItems: rawMenuItems } = useAppMenu();
  const { isDark, toggleTheme } = useTheme();
  const layoutMode = useLayoutMode();
  const { headerContent } = useLayout(); // Get headerContent from context
  const location = useLocation();
  const { t } = useTranslation(['uikit', 'home']);

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

  // Permissions
  const { checkPermission } = useAuth();
  
  const filteredItems = useMemo(() => {
    // Helper to recursively filter items
    const filterFn = (items: unknown): IMenuItem[] => {
      if (!Array.isArray(items)) return [];
      
      const castedItems = items as IMenuItem[];

      return castedItems.filter(item => {
        // PERMISSION CHECK
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

    return filterFn(rawMenuItems as unknown[]);
  }, [rawMenuItems, checkPermission]);

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
