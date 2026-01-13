import { useTranslation } from 'react-i18next';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/common';
import { BackupItem } from '@/services/backup.service';

interface BackupTableProps {
  data: BackupItem[];
  loading: boolean;
  onDownload: (key: string) => void;
  onRestore: (key: string) => void;
  onDelete: (key: string) => void;
}

export function BackupTable({ data, loading, onDownload, onRestore, onDelete }: BackupTableProps) {
  const { t } = useTranslation(['settings']);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${String(parseFloat((bytes / Math.pow(k, i)).toFixed(2)))} ${sizes[i] ?? 'B'}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading...</div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
        {t('backup.empty')}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted-foreground">
          <tr>
            <th className="h-12 px-4 text-left font-medium">{t('backup.filename')}</th>
            <th className="h-12 px-4 text-left font-medium">{t('backup.size')}</th>
            <th className="h-12 px-4 text-left font-medium">{t('backup.date')}</th>
            <th className="h-12 px-4 text-right font-medium">{t('backup.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((backup) => (
            <tr 
              key={backup.key} 
              className="border-t border-border transition-colors hover:bg-muted/5"
            >
              <td className="p-4 align-middle font-medium">{backup.key}</td>
              <td className="p-4 align-middle text-muted-foreground">{formatSize(backup.size)}</td>
              <td className="p-4 align-middle text-muted-foreground">
                {format(new Date(backup.modified), 'PP pp')}
              </td>
              <td className="p-4 align-middle">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { onDownload(backup.key); }}
                    title={t('backup.download')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { onRestore(backup.key); }}
                    title={t('backup.restore')}
                  >
                    <RefreshCw className="w-4 h-4 text-orange-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { onDelete(backup.key); }}
                    title={t('backup.delete')}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
