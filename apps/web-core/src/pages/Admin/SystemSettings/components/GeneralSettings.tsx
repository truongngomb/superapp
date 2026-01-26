import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, FileText, Settings as SettingsIcon, Trash2, Database, Zap, Code, GitBranch, Activity, Play } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Toggle, 
  Button, 
  ConfirmModal,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input
} from '@superapp/ui-kit';
import { useSettings } from '@/hooks';
import { settingsService, useToast } from '@superapp/core-logic';
import { BackupManager } from './BackupManager';
import { SYSTEM_METRICS_SNAPSHOT_INTERVAL } from '@superapp/shared-types';

export function GeneralSettings() {
  const { t } = useTranslation(['settings', 'uikit']);
  const { getSettingValue, updateSetting, loading, submitting } = useSettings();
  const { success, error: showError } = useToast();
  
  const [maintenanceMode, setMaintenanceMode] = useState(() => 
    getSettingValue<boolean>('system_maintenance', false)
  );

  const [pruneDays, setPruneDays] = useState<string>('30');
  const [processing, setProcessing] = useState(false);
  const [snapshotProcessing, setSnapshotProcessing] = useState(false);
  
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

  const handleTriggerSnapshot = async () => {
    try {
      setSnapshotProcessing(true);
      await settingsService.triggerSnapshot();
      success(t('settings:monitoring.trigger_success'));
    } catch {
      showError(t('settings:monitoring.trigger_error'));
    } finally {
      setSnapshotProcessing(false);
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

      {/* Application Version */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('settings:version.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings:version.description')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/50 gap-4">
             <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  {t('settings:version.system_version')}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface border">
                    Client: {__APP_VERSION__}
                  </span>
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-400">
                  {t('settings:version.system_version_desc')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-40">
               <Input 
                  type="text" 
                  className="w-full"
                  placeholder="1.0.0"
                  defaultValue={getSettingValue<string>('system_version', '1.0.0')}
                  onBlur={(e) => {
                    if (e.target.value !== getSettingValue<string>('system_version', '1.0.0')) {
                       void updateSetting('system_version', e.target.value, 'public');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
               />
            </div>
              
              <Button 
                variant="danger"
                className="whitespace-nowrap gap-2"
                onClick={() => {
                  const currentVersion = getSettingValue<string>('system_version', '1.0.0');
                  const parts = currentVersion.split('.').map(Number);
                  
                  // Increment patch version safely
                  if (parts.length >= 3) {
                     // Ensure parts[2] is a number before incrementing
                     const patchKey = 2;
                     const patchVal = parts[patchKey];
                     if (patchVal !== undefined && isFinite(patchVal)) {
                        parts[patchKey] = patchVal + 1;
                     } else {
                        parts[patchKey] = 1;
                     }
                  } else {
                    // Fallback if version format is weird
                     if (parts.length > 0) {
                        const lastIndex = parts.length - 1;
                        const lastPart = parts[lastIndex];
                        if (lastPart !== undefined && isFinite(lastPart)) {
                           parts[lastIndex] = lastPart + 1;
                        } else {
                           parts.push(1);
                        }
                     } else {
                        parts.push(1);
                     }
                  }
                  
                  const newVersion = parts.join('.');
                  void updateSetting('system_version', newVersion, 'public');
                  success(t('settings:version.force_reload_success', { version: newVersion }));
                  
                  // Update input value manually to reflect change immediately
                  const input = document.querySelector('input[placeholder="1.0.0"]') as HTMLInputElement;
                  input.value = newVersion;
                }}
                title={t('settings:version.force_reload_title')}
              >
                <Zap className="w-4 h-4" />
                {t('settings:version.force_reload')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring & Snapshots */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('settings:monitoring.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings:monitoring.description')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900/50 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-green-900 dark:text-green-100">
                  {t('settings:monitoring.snapshot_interval')}
                </div>
                <div className="text-xs text-green-700 dark:text-green-400">
                  {t('settings:monitoring.snapshot_interval_desc')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={String(getSettingValue<number>(SYSTEM_METRICS_SNAPSHOT_INTERVAL, 30))}
                onValueChange={(value) => {
                  void updateSetting(SYSTEM_METRICS_SNAPSHOT_INTERVAL, Number(value), 'public');
                }}
                disabled={loading || submitting}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 {t('uikit:minutes')}</SelectItem>
                  <SelectItem value="30">30 {t('uikit:minutes')}</SelectItem>
                  <SelectItem value="60">60 {t('uikit:minutes')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                title={t('settings:monitoring.trigger_now')}
                onClick={() => void handleTriggerSnapshot()}
                disabled={snapshotProcessing || loading}
                className="shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
              >
                <Play className={`w-4 h-4 ${snapshotProcessing ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
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
              <Select
                value={pruneDays}
                onValueChange={(value) => {
                  setPruneDays(value);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('settings:utilities.days_30')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">{t('settings:utilities.days_30')}</SelectItem>
                  <SelectItem value="60">{t('settings:utilities.days_60')}</SelectItem>
                  <SelectItem value="90">{t('settings:utilities.days_90')}</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Backup Manager */}
      <BackupManager />
      
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
        confirmText={t('uikit:confirm')}
        cancelText={t('uikit:cancel')}
        variant="warning"
        loading={processing}
      />
    </div>
  );
}
