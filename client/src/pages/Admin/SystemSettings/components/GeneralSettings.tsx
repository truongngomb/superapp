import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Settings as SettingsIcon, Trash2, Database, Zap } from 'lucide-react';
import { Card, CardHeader, CardContent, Toggle, Button, ConfirmModal } from '@/components/common';
import { useSettings, useToast } from '@/hooks';
import { settingsService } from '@/services/settings.service';

export function GeneralSettings() {
  const { t } = useTranslation(['settings', 'common']);
  const { getSettingValue, updateSetting, loading, submitting } = useSettings();
  const { success, error: showError } = useToast();
  
  const [maintenanceMode, setMaintenanceMode] = useState(() => 
    getSettingValue<boolean>('system_maintenance', false)
  );

  const [pruneDays, setPruneDays] = useState<string>('30');
  const [processing, setProcessing] = useState(false);
  
  // Confirmation state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'prune' | 'cache' | null;
  }>({ isOpen: false, type: null });

  const handleMaintenanceToggle = async (checked: boolean) => {
    setMaintenanceMode(checked);
    await updateSetting('system_maintenance', checked);
  };

  const handlePruneClick = () => {
    setConfirmState({ isOpen: true, type: 'prune' });
  };

  const handleCacheClick = () => {
    setConfirmState({ isOpen: true, type: 'cache' });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.type) return;

    setProcessing(true);
    // Close modal first or keep it open with loading state? 
    // Usually better to keep it open with loading, but ConfirmModal supports loading prop.
    // However, our current ConfirmModal usage pattern often closes on confirm initiation or handles loading internal.
    // Let's check ConfirmModal again. It has `loading` prop.
    
    try {
      if (confirmState.type === 'prune') {
        if (!pruneDays) return;
        await settingsService.pruneLogs(Number(pruneDays));
        success(t('settings:messages.prune_success'));
      } else {
        await settingsService.clearCache();
        success(t('settings:messages.clear_cache_success'));
      }
    } catch {
      if (confirmState.type === 'prune') {
        showError(t('settings:messages.prune_error'));
      } else {
        showError(t('settings:messages.clear_cache_error'));
      }
    } finally {
      setProcessing(false);
      setConfirmState({ isOpen: false, type: null });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('settings:general.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings:general.description')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
             <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-amber-900 dark:text-amber-100">
                  {t('settings:general.maintenance_mode')}
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-400">
                  {t('settings:general.maintenance_mode_desc')}
                </div>
              </div>
            </div>
            <Toggle 
              checked={maintenanceMode} 
              onChange={(checked) => { 
                void handleMaintenanceToggle(checked); 
              }}
              disabled={loading || submitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Utilities */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('settings:utilities.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings:utilities.description')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Prune Logs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card/50 rounded-xl border gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-muted-foreground">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-foreground">
                  {t('settings:utilities.prune_logs')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('settings:utilities.prune_logs_desc')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={pruneDays}
                onChange={(e) => {
                  setPruneDays(e.target.value);
                }}
                className="w-full sm:w-48 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="30">{t('settings:utilities.days_30')}</option>
                <option value="60">{t('settings:utilities.days_60')}</option>
                <option value="90">{t('settings:utilities.days_90')}</option>
              </select>
              <Button 
                variant="outline" 
                onClick={handlePruneClick}
                disabled={processing || loading}
                className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                {t('settings:utilities.prune_button')}
              </Button>
            </div>
          </div>

          {/* Clear Cache */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card/50 rounded-xl border gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-muted-foreground">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-foreground">
                  {t('settings:utilities.clear_cache')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('settings:utilities.clear_cache_desc')}
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleCacheClick}
              disabled={processing || loading}
              className="w-full sm:w-auto shrink-0"
            >
              {t('settings:utilities.clear_cache_button')}
            </Button>
          </div>

        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onCancel={() => {
          setConfirmState({ ...confirmState, isOpen: false });
        }}
        onConfirm={() => { void handleConfirmAction(); }}
        title={confirmState.type === 'prune' ? t('settings:utilities.prune_confirm_title') : t('settings:utilities.clear_cache_confirm_title')}
        message={confirmState.type === 'prune' 
          ? t('settings:utilities.prune_confirm_message', { days: pruneDays }) 
          : t('settings:utilities.clear_cache_confirm_message')
        }
        confirmText={t('common:confirm')}
        cancelText={t('common:cancel')}
        variant="warning"
        loading={processing}
      />
    </div>
  );
}
