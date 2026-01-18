import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, RotateCcw, Copy } from 'lucide-react';
import { Button, Badge, DataTable, type DataTableColumn } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';
import type { Category } from '@superapp/shared-types';
import { CATEGORY_ICONS, type CategoryIcon } from '@superapp/ui-kit';

interface CategoryTableProps {
  data: Category[];
  loading: boolean;
  selectedIds: string[];
  sort: { field: string; order: 'asc' | 'desc' };
  onSort: (field: string) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onDuplicate?: (category: Category) => void;
  currentPage?: number;
  perPage?: number;
  canSelect?: boolean;
}

/**
 * CategoryTable Component
 * 
 * Standard table view for categories using DataTable.
 */
export function CategoryTable({
  data,
  loading,
  selectedIds,
  sort,
  onSort,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
  currentPage = 1,
  perPage = 10,
  canSelect = true,
}: CategoryTableProps) {
  const { t } = useTranslation(['categories', 'common']);

  const columns = useMemo<DataTableColumn<Category>[]>(() => [
    {
      accessorKey: 'icon',
      header: '',
      size: 60,
      cell: ({ row }) => {
        const item = row.original;
        const IconComponent = (CATEGORY_ICONS[item.icon] || CATEGORY_ICONS.folder) as CategoryIcon;
        return (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-primary"
            style={{ backgroundColor: item.color + '20' }}
          >
            <IconComponent className="w-4 h-4" style={{ color: item.color }} />
          </div>
        );
      }
    },
    {
      accessorKey: 'name',
      header: t('common:name'),
      enableSorting: true,
      size: 200,
      className: 'font-medium'
    },
    {
      accessorKey: 'description',
      header: t('categories:form.desc_label'),
      width: '2fr',
      className: 'hidden md:flex text-muted-foreground',
      cell: ({ row }) => <span className="line-clamp-1">{row.original.description || '-'}</span>
    },
    {
      accessorKey: 'isActive',
      header: t('common:status'),
      enableSorting: true,
      size: 120,
      cell: ({ row }) => row.original.isActive ? 
        <Badge variant="success" size="sm">{t('common:active')}</Badge> : 
        <Badge variant="danger" size="sm">{t('common:inactive')}</Badge>
    },
    {
      id: 'actions',
      header: t('common:actions.label'),
      size: 160,
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {!category.isDeleted && (
              <PermissionGuard resource="categories" action="update">
                <Button variant="ghost" size="sm" onClick={() => { onEdit(category); }} aria-label={t('common:edit')}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </PermissionGuard>
            )}
            {!category.isDeleted && onDuplicate && (
               <PermissionGuard resource="categories" action="create">
                 <Button variant="ghost" size="sm" onClick={() => { onDuplicate(category); }} aria-label={t('common:duplicate')}>
                   <Copy className="w-4 h-4 text-blue-500" />
                 </Button>
               </PermissionGuard>
            )}
            {category.isDeleted && onRestore && (
              <PermissionGuard resource="categories" action="update">
                <Button variant="ghost" size="sm" onClick={() => { onRestore(category.id); }} aria-label={t('common:restore')}>
                  <RotateCcw className="w-4 h-4 text-primary" />
                </Button>
              </PermissionGuard>
            )}
            <PermissionGuard resource="categories" action="delete">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => { onDelete(category.id); }}
                 aria-label={t('common:delete')}
               >
                 <Trash2 className={cn('w-4 h-4', category.isDeleted ? 'text-red-700' : 'text-red-500')} />
               </Button>
            </PermissionGuard>
          </div>
        );
      }
    }
  ], [t, onEdit, onDuplicate, onRestore, onDelete]);

  return (
    <DataTable<Category>
      data={data}
      columns={columns}
      keyExtractor={(item) => item.id}
      isLoading={loading}
      selectedIds={canSelect ? selectedIds : undefined}
      onSelectAll={canSelect ? onSelectAll : undefined}
      onSelectOne={canSelect ? onSelect : undefined}
      sortColumn={sort.field}
      sortDirection={sort.order}
      onSort={onSort}
      currentPage={currentPage}
      perPage={perPage}
      showSelectAll={true}
    />
  );
}
