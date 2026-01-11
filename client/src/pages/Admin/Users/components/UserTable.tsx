import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, UserCog, RotateCcw, User as UserIcon } from 'lucide-react';
import { Button, Badge, Checkbox } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { formatDate } from '@/utils';
import type { User } from '@/types';
import { cn } from '@/utils';

interface UserTableProps {
  users: User[];
  selectedIds: string[];
  /** When undefined, checkbox column is hidden */
  onSelectAll?: (checked: boolean) => void;
  /** When undefined, row checkboxes are hidden */
  onSelectOne?: (id: string, checked: boolean) => void;
  onEdit: (user: User) => void;
  onAssignRole: (user: User) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function UserTable({
  users,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onAssignRole,
  onDelete,
  onRestore,
}: UserTableProps) {
  const { t } = useTranslation(['users', 'common']);

  const allSelected = users.length > 0 && selectedIds.length === users.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < users.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="p-4 w-10">
              {onSelectAll && (
                <Checkbox
                  checked={allSelected}
                  triState={isIndeterminate}
                  onChange={(checked) => { onSelectAll(checked); }}
                />
              )}
            </th>
            <th className="p-4 text-sm font-semibold text-muted tracking-wider">
              {t('common:users')}
            </th>
            <th className="p-4 text-sm font-semibold text-muted tracking-wider">
              {t('users:form.role_label')}
            </th>
            <th className="p-4 text-sm font-semibold text-muted tracking-wider">
              {t('common:status')}
            </th>
            <th className="p-4 text-sm font-semibold text-muted tracking-wider hidden md:table-cell">
              {t('common:created')}
            </th>
            <th className="p-4 text-right text-sm font-semibold text-muted tracking-wider">
              {t('common:actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {users.map((user) => (
            <tr 
              key={user.id} 
              className={cn(
                "hover:bg-muted/50 transition-colors",
                selectedIds.includes(user.id) && "bg-primary/5"
              )}
            >
              <td className="p-4">
                {onSelectOne && (
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onChange={(checked) => { onSelectOne(user.id, checked); }}
                  />
                )}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{user.name || user.email}</span>
                      {user.isDeleted && (
                        <Badge variant="danger" size="sm">
                          {t('common:archived', { defaultValue: 'Archived' })}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted truncate">{user.email}</span>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {user.roleNames && user.roleNames.length > 0 ? (
                    user.roleNames.map((name, i) => (
                      <Badge key={i} variant="secondary" size="sm">{name}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted">{t('users:form.no_role')}</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <Badge variant={user.isActive ? 'success' : 'danger'} size="sm">
                  {user.isActive ? t('common:active') : t('common:inactive')}
                </Badge>
              </td>
              <td className="p-4 text-sm text-muted hidden md:table-cell">
                {formatDate(user.created)}
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-1">
                  <PermissionGuard resource="users" action="update">
                    {!user.isDeleted && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { onEdit(user); }}
                          aria-label={t('common:edit')}
                          title={t('common:edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { onAssignRole(user); }}
                          aria-label={t('users:form.assign_role_title')}
                          title={t('users:form.assign_role_title')}
                        >
                          <UserCog className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {user.isDeleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { onRestore(user.id); }}
                        aria-label={t('common:restore', { defaultValue: 'Restore' })}
                        title={t('common:restore', { defaultValue: 'Restore' })}
                      >
                        <RotateCcw className="w-4 h-4 text-primary" />
                      </Button>
                    )}
                  </PermissionGuard>
                  <PermissionGuard resource="users" action="delete">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { onDelete(user.id); }}
                      aria-label={user.isDeleted ? t('common:delete') : t('common:archive', { defaultValue: 'Archive' })}
                      title={user.isDeleted ? t('common:delete') : t('common:archive', { defaultValue: 'Archive' })}
                    >
                      <Trash2 className={cn("w-4 h-4", user.isDeleted ? "text-red-700" : "text-red-500")} />
                    </Button>
                  </PermissionGuard>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
