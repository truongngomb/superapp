import { useTranslation } from 'react-i18next';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@superapp/ui-kit';
import type { BackupItem } from '@superapp/shared-types';
import { formatBytes } from '@superapp/core-logic';

interface BackupTableProps {
  data: BackupItem[];
  loading: boolean;
  onDownload: (key: string) => void;
  onRestore: (key: string) => void;
  onDelete: (key: string) => void;
}

export function BackupTable({ data, loading, onDownload, onRestore, onDelete }: BackupTableProps) {
  const { t } = useTranslation(['settings']);

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
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('backup.filename')}</TableHead>
            <TableHead>{t('backup.size')}</TableHead>
            <TableHead>{t('backup.date')}</TableHead>
            <TableHead className="text-right">{t('backup.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((backup, index) => (
            <TableRow key={backup.key || index}>
              <TableCell className="font-medium">{backup.key}</TableCell>
              <TableCell className="text-muted-foreground">{formatBytes(backup.size)}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(backup.modified), 'PP pp')}
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
