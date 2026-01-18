
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Copy, Trash2, RotateCcw, Shield } from 'lucide-react';
import { Button, Badge, DataTable, type DataTableColumn } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';
import type { Role } from '@superapp/shared-types';

interface RoleTableProps {
  data: Role[];
  loading: boolean;
  selectedIds: string[];
  sort: { field: string; order: 'asc' | 'desc' };
  onSort: (field: string) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  currentPage?: number;
  canSelect?: boolean;
}

export function RoleTable({
  data,
  loading,
  selectedIds,
  sort,
  onSort,
  onSelect,
  onSelectAll,
  onEdit,
  onDuplicate,
  onDelete,
  onRestore,
  currentPage = 1,
  canSelect = true,
}: RoleTableProps) {
  const { t } = useTranslation(['roles', 'common']);

  const columns = useMemo<DataTableColumn<Role>[]>(() => [
    {
      accessorKey: 'name',
      header: t('common:name'),
      enableSorting: true,
      width: '1.5fr',
      className: 'font-medium',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>{row.original.name}</span>
        </div>
      )
    },
    {
       accessorKey: 'description',
       header: t('common:description'),
       enableSorting: false,
       width: '2fr',
       className: 'text-muted-foreground truncate'
    },
    {
       id: 'permissions',
       header: t('roles:form.permissions_label'),
       width: '200px',
       className: 'hidden md:flex',
       cell: ({ row }) => {
         const permissions = row.original.permissions;
         const count = Object.entries(permissions).filter(([, actions]) => actions.length > 0).length;
         return (
           <Badge variant="secondary" className="font-normal">
             {count} {t('roles:permissions_count', { count })}
           </Badge>
         );
       }
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
        const role = row.original;
        // isSystem property does not exist on Role type yet
        const isSystem = false; 
        return (
        <div className="flex items-center justify-end gap-1">
          {!role.isDeleted && (
            <>
               <PermissionGuard resource="roles" action="update">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { onEdit(role); }} 
                    disabled={isSystem}
                    aria-label={t('common:edit')}
                 >
                   <Edit2 className="w-4 h-4" />
                 </Button>
               </PermissionGuard>
               <PermissionGuard resource="roles" action="create">
                  <Button variant="ghost" size="sm" onClick={() => { onDuplicate(role); }} aria-label={t('common:duplicate')}>
                    <Copy className="w-4 h-4 text-blue-500" />
                  </Button>
               </PermissionGuard>
            </>
          )}
          {role.isDeleted && (
             <PermissionGuard resource="roles" action="update">
               <Button variant="ghost" size="sm" onClick={() => { onRestore(role.id); }} aria-label={t('common:restore')}>
                 <RotateCcw className="w-4 h-4 text-primary" />
               </Button>
             </PermissionGuard>
          )}
          <PermissionGuard resource="roles" action="delete">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { onDelete(role.id); }} 
                disabled={isSystem}
                aria-label={t('common:delete')}
             >
               <Trash2 className={cn("w-4 h-4", role.isDeleted ? "text-red-700" : "text-red-500")} />
             </Button>
          </PermissionGuard>
        </div>
      )}
    }
  ], [t, onEdit, onDuplicate, onDelete, onRestore]);

  return (
    <DataTable<Role>
      data={data}
      columns={columns}
      keyExtractor={(role) => role.id}
      selectedIds={canSelect ? selectedIds : undefined}
      onSelectAll={canSelect ? onSelectAll : undefined}
      onSelectOne={canSelect ? onSelect : undefined}
      sortColumn={sort.field}
      sortDirection={sort.order}
      onSort={onSort}
      currentPage={currentPage}
      showSelectAll={true}
      isLoading={loading}
    />
  );
}
