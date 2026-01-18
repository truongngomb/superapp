import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, RotateCcw, Shield } from 'lucide-react';
import { Button, Badge, DataTable, type DataTableColumn, Avatar } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';
import type { User, Role } from '@superapp/shared-types';

interface UserTableProps {
  data: User[];
  loading: boolean;
  selectedIds: string[];
  sort: { field: string; order: 'asc' | 'desc' };
  onSort: (field: string) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (user: User) => void;
  onAssignRole: (user: User) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  currentPage?: number;
  canSelect?: boolean;
  roles: Role[];
}

export function UserTable({
  data,
  loading,
  selectedIds,
  sort,
  onSort,
  onSelect,
  onSelectAll,
  onEdit,
  onAssignRole,
  onDelete,
  onRestore,
  currentPage = 1,
  canSelect = true,
  roles
}: UserTableProps) {
  const { t } = useTranslation(['users', 'common']);

  const columns = useMemo<DataTableColumn<User>[]>(() => [
    {
      accessorKey: 'avatar',
      header: '',
      size: 80,
      className: 'px-4 justify-center',
      cell: ({ row }) => <Avatar src={row.original.avatar} name={row.original.name} />
    },
    {
      accessorKey: 'name',
      header: t('common:name'),
      enableSorting: true,
      width: '1.5fr',
      className: 'font-medium'
    },
    {
       accessorKey: 'email',
       header: t('common:email'),
       enableSorting: true,
       width: '2fr',
       className: 'hidden md:flex text-muted-foreground'
    },
    {
       accessorKey: 'roles',
       header: t('users:form.role_label'),
       width: '1.5fr',
       cell: ({ row }) => {
         const user = row.original;
         return (
         <div className="flex flex-wrap gap-1">
           {user.roles && user.roles.length > 0 ? (
             user.roles.map((roleId) => {
               const role = roles.find(r => r.id === roleId);
               return (
                <Badge key={roleId} variant="secondary" className="text-xs">
                  {role ? role.name : roleId}
                </Badge>
               );
             })
           ) : (
             <span className="text-muted-foreground text-xs italic">{t('common:no_roles')}</span>
           )}
         </div>
       )}
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
        const user = row.original;
        return (
        <div className="flex items-center justify-end gap-1">
          {!user.isDeleted && (
            <>
               <PermissionGuard resource="users" action="update">
                 <Button variant="ghost" size="sm" onClick={() => { onEdit(user); }} aria-label={t('common:edit')}>
                   <Edit2 className="w-4 h-4" />
                 </Button>
               </PermissionGuard>
               <PermissionGuard resource="users" action="update">
                  <Button variant="ghost" size="sm" onClick={() => { onAssignRole(user); }} aria-label={t('users:assign_role_btn')}>
                    <Shield className="w-4 h-4 text-blue-500" />
                  </Button>
               </PermissionGuard>
            </>
          )}
          {user.isDeleted && (
             <PermissionGuard resource="users" action="update">
               <Button variant="ghost" size="sm" onClick={() => { onRestore(user.id); }} aria-label={t('common:restore')}>
                 <RotateCcw className="w-4 h-4 text-primary" />
               </Button>
             </PermissionGuard>
          )}
          <PermissionGuard resource="users" action="delete">
             <Button variant="ghost" size="sm" onClick={() => { onDelete(user.id); }} aria-label={t('common:delete')}>
               <Trash2 className={cn("w-4 h-4", user.isDeleted ? "text-red-700" : "text-red-500")} />
             </Button>
          </PermissionGuard>
        </div>
      )}
    }
  ], [t, roles, onEdit, onAssignRole, onDelete, onRestore]);

  return (
    <DataTable<User>
      data={data}
      columns={columns}
      keyExtractor={(user) => user.id}
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
