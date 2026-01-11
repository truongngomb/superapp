/**
 * Admin Layout Component
 * Provides sub-navigation for admin pages (Users, Roles)
 */

import { NavLink, Outlet } from 'react-router-dom';
import { Users, Shield, LayoutDashboard, FileClock, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { PermissionGuard } from '@/components/common/PermissionGuard';

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

  const navItems: NavItem[] = [
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
  ];

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <nav className="flex gap-1 p-1 bg-muted/30 rounded-lg w-fit">
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

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
