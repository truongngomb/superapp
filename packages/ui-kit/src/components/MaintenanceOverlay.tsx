import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, AlertOctagon } from 'lucide-react';
import { Button } from './Button';

export const MAINTENANCE_EVENT = 'maintenance_mode_event';

export interface MaintenanceOverlayProps {
  /**
   * Callback to check system health.
   * Should throw an error or handle dispatching the event if maintenance is active.
   */
  onCheckHealth: () => Promise<void>;
  
  /**
   * Path to admin login (to hide overlay).
   * Default: '/login'
   */
  adminLoginPath?: string;
}

export function MaintenanceOverlay({ 
  onCheckHealth, 
  adminLoginPath = '/login' 
}: MaintenanceOverlayProps) {
  const { t } = useTranslation('uikit');
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === adminLoginPath;

  // Proactively check system health/maintenance status on mount
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        await onCheckHealth();
      } catch {
        // Error handling depends on the global interceptor dispatching event
      }
    };

    if (!isLoginPage) {
      void checkMaintenance();
    }
  }, [isLoginPage, onCheckHealth]);

  useEffect(() => {
    const handleMaintenanceEvent = () => {
      if (!isLoginPage) {
        setIsVisible(true);
      }
    };

    window.addEventListener(MAINTENANCE_EVENT, handleMaintenanceEvent);

    return () => {
      window.removeEventListener(MAINTENANCE_EVENT, handleMaintenanceEvent);
    };
  }, [isLoginPage]);

  if (isLoginPage) return null;
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
        <SettingsIcon className="w-10 h-10 text-amber-600 dark:text-amber-500 animate-[spin_10s_linear_infinite]" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
        {t('maintenance.title')}
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        {t('maintenance.message')}
      </p>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => { window.location.reload(); }}
        >
          {t('maintenance.retry')}
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => { window.location.href = adminLoginPath; }}
        >
          {t('auth.login_admin')}
        </Button>
      </div>

      <div className="absolute bottom-8 text-sm text-muted-foreground flex items-center gap-2">
        <AlertOctagon className="w-4 h-4" />
        <span>Error 503: Service Unavailable</span>
      </div>
    </div>
  );
}
