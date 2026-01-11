/**
 * Admin Dashboard Page
 * Overview and quick stats for administrators
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, FolderTree, Activity, TrendingUp, Clock, Cpu, HardDrive, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, Skeleton } from '@/components/common';
import { roleService, userService, categoryService, activityLogService } from '@/services';
import { systemService } from '@/services/system.service';
import type { SystemStats } from '@/types/system';
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



// ============================================================================
// Component
// ============================================================================

export default function AdminDashboard() {
  const { t } = useTranslation(['common']);
  const [stats, setStats] = useState<DashboardStats>({ users: 0, roles: 0, categories: 0, activityLogs: 0 });
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemLoading, setSystemLoading] = useState(true);
  const [systemError, setSystemError] = useState(false);

  useEffect(() => {
    const fetchMainStats = async () => {
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

    const fetchSystemStats = async () => {
      try {
        setSystemLoading(true);
        const systemRes = await systemService.getStats();
        setSystemStats(systemRes);
      } catch (error) {
        logger.warn('AdminDashboard', 'Failed to fetch system stats', error);
        setSystemError(true);
      } finally {
        setSystemLoading(false);
      }
    }

    void fetchMainStats();
    void fetchSystemStats();
  }, []);




  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* User & Access Section Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-5">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                  <div className="h-1 bg-muted/20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Content & System Section Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-5">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                  <div className="h-1 bg-muted/20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Status Section Skeleton */}
        <div>
           <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
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
          {t('admin_dashboard.user_access')}
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
          {t('admin_dashboard.content_system')}
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

      {/* System Status Section */}
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          {t('admin_dashboard.system_status')}
        </h2>

        {systemLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : systemError ? (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center py-12">
              <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('admin_dashboard.system_access_denied')}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {t('admin_dashboard.system_access_denied_desc')}
              </p>
            </CardContent>
          </Card>
        ) : systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted">{t('admin_dashboard.cpu')}</p>
                    <p className="font-medium text-sm line-clamp-1" title={`${systemStats.cpu.manufacturer} ${systemStats.cpu.brand}`}>
                      {systemStats.cpu.manufacturer} {systemStats.cpu.brand}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  {/* System Load */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">{t('admin_dashboard.system_load')}</span>
                      <span className="font-medium">{Math.round(systemStats.cpu.usage.system)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Math.round(systemStats.cpu.usage.system), 100).toString()}%` }}
                      />
                    </div>
                  </div>

                  {/* Server Load */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">{t('admin_dashboard.server_load')}</span>
                      <span className="font-medium">{Math.round(systemStats.cpu.usage.server)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div 
                        className="bg-sky-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Math.round(systemStats.cpu.usage.server), 100).toString()}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between text-xs text-muted">
                    <span>{t('admin_dashboard.cores')}: {systemStats.cpu.cores}</span>
                    <span>{systemStats.cpu.speed} GHz</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted">{t('admin_dashboard.memory')}</p>
                    <p className="font-medium text-sm">
                      {Math.round((systemStats.memory.active / 1024 / 1024 / 1024) * 100) / 100} / {Math.round((systemStats.memory.total / 1024 / 1024 / 1024) * 100) / 100} GB
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  {/* System Memory */}
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                      <span className="text-muted">{t('admin_dashboard.system_memory')}</span>
                      <span className="font-medium">{Math.round((systemStats.memory.active / systemStats.memory.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${((systemStats.memory.active / systemStats.memory.total) * 100).toString()}%` }}
                      />
                    </div>
                  </div>

                  {/* Server Memory */}
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs">
                      <span className="text-muted">{t('admin_dashboard.server_memory')}</span>
                      <span className="font-medium">
                        {Math.round((systemStats.memory.serverUsed / 1024 / 1024) * 100) / 100} MB
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div 
                        className="bg-fuchsia-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${((systemStats.memory.serverUsed / systemStats.memory.total) * 100).toString()}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border flex justify-between text-xs text-muted">
                    <span>{t('admin_dashboard.free')}: {Math.round((systemStats.memory.free / 1024 / 1024 / 1024) * 100) / 100} GB</span>
                    <span>{Math.round((systemStats.memory.serverUsed / systemStats.memory.total) * 1000) / 10}% {t('admin_dashboard.used')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OS & Disk */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted">{t('admin_dashboard.os')}</p>
                      <p className="font-medium">{systemStats.os.distro} {systemStats.os.release}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                    <span className="text-muted">{t('admin_dashboard.platform')}</span>
                    <span className="font-medium">{systemStats.os.platform} ({systemStats.os.arch})</span>
                  </div>
                    <div className="flex justify-between">
                    <span className="text-muted">{t('admin_dashboard.hostname')}</span>
                    <span className="font-medium">{systemStats.os.hostname}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>


    </div>
  );
}
