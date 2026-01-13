import { useMemo, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, Shield, LayoutDashboard, FileClock, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useLayout, useLayoutMode } from '@/hooks';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  resource: string;
}

// ============================================================================
// Component
// ============================================================================

export default function AdminLayout() {
  const { t } = useTranslation('common');
  const layoutMode = useLayoutMode();
  const { setHeaderContent } = useLayout();

  const navItems: NavItem[] = useMemo(() => [
    {
      to: '/admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: t('admin_dashboard.dashboard'),
      resource: 'dashboard',
    },
    {
      to: '/admin/settings',
      icon: <Settings className="w-4 h-4" />,
      label: t('settings'),
      resource: 'all',
    },
    {
      to: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      label: t('users'),
      resource: 'users',
    },
    {
      to: '/admin/roles',
      icon: <Shield className="w-4 h-4" />,
      label: t('roles'),
      resource: 'roles',
    },
    {
      to: '/admin/activity-logs',
      icon: <FileClock className="w-4 h-4" />,
      label: t('activity_logs'),
      resource: 'activity_logs',
    },
  ], [t]);

  useEffect(() => {
    if (layoutMode === 'modern') {
      setHeaderContent(
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <PermissionGuard key={item.to} resource={item.resource} action="view">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/20 hover:text-foreground'
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </PermissionGuard>
          ))}
        </nav>
      );
    } else {
      setHeaderContent(null);
    }
    
    return () => {
      setHeaderContent(null);
    };
  }, [layoutMode, navItems, setHeaderContent]);

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs - Only show in non-modern layout */}
      {layoutMode !== 'modern' && (
        <nav className="flex gap-1 p-1 bg-muted/30 rounded-lg w-fit transition-all">
          {navItems.map((item) => (
            <PermissionGuard key={item.to} resource={item.resource} action="view">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                    'hover:bg-background/80',
                    isActive
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground'
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </PermissionGuard>
          ))}
        </nav>
      )}

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
