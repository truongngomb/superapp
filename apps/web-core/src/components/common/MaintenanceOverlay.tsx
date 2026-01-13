import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, AlertOctagon } from 'lucide-react';
import { Button } from '@superapp/ui-kit';
import { api } from '@/config';

export const MAINTENANCE_EVENT = 'maintenance_mode_event';

export function MaintenanceOverlay() {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Proactively check system health/maintenance status on mount
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // If system is in maintenance, this will trigger 503 exception
        // which global handler catches -> dispatches event
        await api.get('/health');
      } catch {
        // Error already handled by api.ts interceptor
      }
    };

    if (!isLoginPage) {
      void checkMaintenance();
    }
  }, [isLoginPage]);

  useEffect(() => {
    const handleMaintenanceEvent = () => {
      // Show overlay if not on login page
      // OR if on login page but we decide to enforce it (currently hiding on login)
      if (!isLoginPage) {
        setIsVisible(true);
      }
    };

    window.addEventListener(MAINTENANCE_EVENT, handleMaintenanceEvent);

    return () => {
      window.removeEventListener(MAINTENANCE_EVENT, handleMaintenanceEvent);
    };
  }, [isLoginPage]);

  // Logic: 
  // 1. If we are on Login page -> Hide overlay (allow Admin to login)
  // 2. If not visible -> return null
  if (isLoginPage) return null;
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
        <SettingsIcon className="w-10 h-10 text-amber-600 dark:text-amber-500 animate-[spin_10s_linear_infinite]" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
        {t('maintenance.title', 'System Under Maintenance')}
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        {t('maintenance.message', 'We are currently performing scheduled maintenance to improve our services. Please check back soon.')}
      </p>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => { window.location.reload(); }}
        >
          {t('maintenance.retry', 'Try Again')}
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => { window.location.href = '/login'; }}
        >
          {t('auth.login_admin', 'Admin Login')}
        </Button>
      </div>

      <div className="absolute bottom-8 text-sm text-muted-foreground flex items-center gap-2">
        <AlertOctagon className="w-4 h-4" />
        <span>Error 503: Service Unavailable</span>
      </div>
    </div>
  );
}
