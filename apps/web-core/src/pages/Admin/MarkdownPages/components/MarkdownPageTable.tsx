import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Badge, 
  Button,
  Avatar
} from '@superapp/ui-kit';
import { DataTable, type DataTableColumn } from '@/components/common';
import { MarkdownPage } from '@superapp/shared-types';
import { Edit, Trash2, Globe, FileText } from 'lucide-react';
import { env } from '@/config';

interface MarkdownPageTableProps {
  data: MarkdownPage[];
  loading: boolean;
  selectedIds: string[];
  sort: { field: string; order: 'asc' | 'desc' | null };
  onSort: (field: string) => void;
  onSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (page: MarkdownPage) => void;
  onDelete: (page: MarkdownPage) => void;
}

export function MarkdownPageTable({
  data,
  loading,
  selectedIds,
  sort,
  onSort,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete
}: MarkdownPageTableProps) {
  const { t, i18n } = useTranslation(['markdown', 'common']);

  const columns = useMemo<DataTableColumn<MarkdownPage>[]>(() => [
    {
      id: 'title',
      header: () => t('form.title'),
      size: 300,
      wrap: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.coverImage ? (
            <Avatar 
              src={`${env.API_BASE_URL}/api/files/markdown_pages/${row.original.id}/${row.original.coverImage}`} 
              alt={row.original.title}
              name={row.original.title}
              size="sm"
            />
          ) : (
             <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
               <FileText className="w-4 h-4" />
             </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground whitespace-normal break-words leading-tight mb-0.5">{row.original.title}</div>
            <div className="text-xs text-muted whitespace-normal break-all">/{row.original.slug}</div>
          </div>
        </div>
      )
    },
    {
      id: 'showInMenu',
      header: () => t('form.show_in_menu'),
      size: 150,
      cell: ({ row }) => (
        row.original.showInMenu ? (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
             {t('form.show_in_menu')}
          </Badge>
        ) : (
          <span className="text-muted text-sm">-</span>
        )
      )
    },
    {
      id: 'isPublished',
      header: () => t('form.published'),
      size: 150,
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? 'success' : 'secondary'}>
          {row.original.isPublished ? t('status.published') : t('status.draft')}
        </Badge>
      )
    },
    {
      id: 'updated',
      header: () => t('common:updated'),
      size: 150,
      cell: ({ row }) => new Date(row.original.updated).toLocaleDateString(i18n.language)
    },
    {
      id: 'actions',
      header: () => t('common:actions.label'),
      size: 130,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(`/pages/${row.original.slug}`, '_blank')}
            disabled={!row.original.isPublished}
            title={t('view_page')}
          >
            <Globe className="w-4 h-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => { onEdit(row.original); }}
          >
            <Edit className="w-4 h-4 text-yellow-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
            onClick={() => { onDelete(row.original); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ] as DataTableColumn<MarkdownPage>[], [t, i18n.language, onEdit, onDelete]);

  return (
    <DataTable<MarkdownPage>
      data={data}
      columns={columns}
      keyExtractor={(page) => page.id}
      isLoading={loading}
      selectedIds={selectedIds}
      sortColumn={sort.field}
      sortDirection={sort.order === 'desc' ? 'desc' : 'asc'}
      onSort={onSort}
      onSelectOne={(id, checked) => { if (checked) onSelect(id); }}
      onSelectAll={onSelectAll}
    />
  );
}
