/**
 * Admin Dashboard Page
 * Overview and quick stats for administrators
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, FolderTree, Activity, TrendingUp, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, LoadingSpinner } from '@/components/common';
import { roleService, userService, categoryService, activityLogService } from '@/services';
import { formatDateTime, logger } from '@/utils';

// ============================================================================
// Types
// ============================================================================

interface DashboardStats {
  users: number;
  roles: number;
  categories: number;
  activityLogs: number;
}

interface QuickLink {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

// ============================================================================
// Component
// ============================================================================

export default function AdminDashboard() {
  const { t } = useTranslation(['common']);
  const [stats, setStats] = useState<DashboardStats>({ users: 0, roles: 0, categories: 0, activityLogs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, rolesRes, categoriesRes, activityLogsRes] = await Promise.all([
          userService.getPage({ limit: 1 }),
          roleService.getPage({ limit: 1 }),
          categoryService.getPage({ limit: 1 }),
          activityLogService.getPage({ limit: 1 }),
        ]);

        setStats({
          users: usersRes.total,
          roles: rolesRes.total,
          categories: categoriesRes.total,
          activityLogs: activityLogsRes.total,
        });
      } catch {
        logger.warn('AdminDashboard', 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);


  const quickLinks: QuickLink[] = [
    {
      to: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      label: t('admin_dashboard.manage_users'),
      description: t('admin_dashboard.manage_users_desc'),
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      to: '/admin/roles',
      icon: <Shield className="w-5 h-5" />,
      label: t('admin_dashboard.manage_roles'),
      description: t('admin_dashboard.manage_roles_desc'),
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" text={t('loading')} className="py-20" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('admin_dashboard.dashboard')}
        </h1>
        <p className="text-muted mt-1 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {formatDateTime(new Date().toISOString())}
        </p>
      </div>

      {/* User & Access Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t('admin_dashboard.user_access', { defaultValue: 'User & Access Control' })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: t('users'),
              value: stats.users,
              icon: <Users className="w-6 h-6" />,
              color: 'from-blue-500 to-blue-600',
              link: '/admin/users',
            },
            {
              label: t('roles'),
              value: stats.roles,
              icon: <Shield className="w-6 h-6" />,
              color: 'from-purple-500 to-purple-600',
              link: '/admin/roles',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={stat.link}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-5">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                        {stat.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-muted" />
                    </div>
                    <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content & System Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FolderTree className="w-5 h-5" />
          {t('admin_dashboard.content_system', { defaultValue: 'Content & System' })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: t('categories'),
              value: stats.categories,
              icon: <FolderTree className="w-6 h-6" />,
              color: 'from-emerald-500 to-emerald-600',
              link: '/categories',
            },
            {
              label: t('activity_logs'),
              value: stats.activityLogs,
              icon: <Activity className="w-6 h-6" />,
              color: 'from-amber-500 to-amber-600',
              link: '/admin/activity-logs',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link to={stat.link}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-5">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                        {stat.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-muted" />
                    </div>
                    <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {t('admin_dashboard.quick_actions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link to={link.to}>
                <Card className="hover:shadow-md transition-all hover:bg-muted/30 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${link.color}`}>
                        {link.icon}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{link.label}</p>
                        <p className="text-sm text-muted">{link.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
