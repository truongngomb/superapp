import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, HardDrive } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, ConfirmModal } from '@/components/common';
import { useToast } from '@/hooks';
import { backupService, BackupItem } from '@/services/backup.service';
import { BackupTable } from './BackupTable';

export function BackupManager() {
  const { t } = useTranslation(['settings', 'common']);
  const { success, error: showError } = useToast();
  
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'restore' | 'delete' | null;
    key: string | null;
  }>({ isOpen: false, type: null, key: null });

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await backupService.list();
      setBackups(data);
    } catch {
      showError('Failed to load backups');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void fetchBackups();
  }, [fetchBackups]);

  const handleCreateBackup = async () => {
    try {
      setProcessing(true);
      await backupService.create();
      success(t('settings:backup.create_success'));
      await fetchBackups();
    } catch {
      showError(t('settings:backup.create_error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (key: string) => {
    // Open in new tab using the constructed URL
    // Note: This relies on browser cookie authentication with PocketBase if calling PB directly
    const url = backupService.getDownloadUrl(key);
    window.open(url, '_blank');
  };

  const confirmAction = (type: 'restore' | 'delete', key: string) => {
    setConfirmState({ isOpen: true, type, key });
  };

  const handleConfirm = async () => {
    if (!confirmState.key || !confirmState.type) return;
    
    setProcessing(true);
    try {
      if (confirmState.type === 'restore') {
        await backupService.restore(confirmState.key);
        success(t('settings:backup.restore_success'));
        // Reload page to reflect restored state? Usually good practice.
        setTimeout(() => { window.location.reload(); }, 1500);
      } else {
        await backupService.delete(confirmState.key);
        success(t('settings:backup.delete_success'));
        await fetchBackups();
      }
    } catch {
      if (confirmState.type === 'restore') {
        showError(t('settings:backup.restore_error'));
      } else {
        showError(t('settings:backup.delete_error'));
      }
    } finally {
      setProcessing(false);
      setConfirmState({ isOpen: false, type: null, key: null });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('settings:backup.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings:backup.description')}</p>
            </div>
          </div>
          <Button 
            onClick={() => { 
              void handleCreateBackup(); 
            }} 
            disabled={processing || loading}
            className="gap-2"
          >
            <HardDrive className="w-4 h-4" />
            {t('settings:backup.create')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <BackupTable
          data={backups}
          loading={loading}
          onDownload={handleDownload}
          onRestore={(key) => { confirmAction('restore', key); }}
          onDelete={(key) => { confirmAction('delete', key); }}
        />
      </CardContent>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onCancel={() => {
          setConfirmState({ ...confirmState, isOpen: false });
        }}
        onConfirm={() => { void handleConfirm(); }}
        title={confirmState.type === 'restore' 
          ? t('settings:backup.restore_confirm_title') 
          : t('settings:backup.delete_confirm_title')
        }
        message={confirmState.type === 'restore' 
          ? t('settings:backup.restore_confirm_message', { name: confirmState.key }) 
          : t('settings:backup.delete_confirm_message', { name: confirmState.key })
        }
        confirmText={t('common:confirm')}
        cancelText={t('common:cancel')}
        variant={confirmState.type === 'restore' ? 'warning' : 'danger'}
        loading={processing}
      />
    </Card>
  );
}
