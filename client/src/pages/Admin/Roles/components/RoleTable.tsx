import { Edit2, Trash2, RotateCcw, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Badge } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';
import type { Role } from '@/types';

interface RoleTableProps {
  roles: Role[];
  selectedIds: string[];
  /** When undefined, checkbox column is hidden */
  onSelectAll?: (checked: boolean) => void;
  /** When undefined, row checkboxes are hidden */
  onSelectOne?: (id: string, checked: boolean) => void;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onDuplicate?: (role: Role) => void;
}

/**
 * RoleTable Component
 * 
 * Table view for roles with columns: Checkbox, Name, Description, Permissions count, Status, Actions
 */
export function RoleTable({
  roles,
  selectedIds,
  onSelectOne,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
}: RoleTableProps) {
  const { t } = useTranslation(['roles', 'common']);

  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted-foreground">
          <tr>
            <th className="w-12 h-12 px-4 text-left">&nbsp;</th>
            <th className="h-12 px-4 text-left font-medium">
              {t('common:name')}
            </th>
            <th className="h-12 px-4 text-left font-medium hidden md:table-cell">
              {t('roles:form.desc_label')}
            </th>
            <th className="h-12 px-4 text-left font-medium hidden lg:table-cell">
              {t('roles:form.permissions_label')}
            </th>
            <th className="w-32 h-12 px-4 text-left font-medium">
              {t('common:status')}
            </th>
            <th className="w-32 h-12 px-4 text-right font-medium">
              {t('common:actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => {
            const isSelected = selectedIds.includes(role.id);
            const permissionsCount = Object.entries(role.permissions)
              .filter(([, actions]) => actions.length > 0)
              .length;

            return (
              <tr
                key={role.id}
                className={cn(
                  'border-t border-border transition-colors hover:bg-muted/5',
                  isSelected && 'bg-primary/5'
                )}
              >
                <td className="p-4 align-middle">
                  {onSelectOne && (
                    <Checkbox
                      checked={isSelected}
                      onChange={(checked) => { onSelectOne(role.id, checked); }}
                    />
                  )}
                </td>
                <td className="p-4 align-middle">
                  <span className="font-medium text-foreground">{role.name}</span>
                </td>
                <td className="p-4 align-middle hidden md:table-cell">
                  <span className="text-muted-foreground line-clamp-1">
                    {role.description || '-'}
                  </span>
                </td>
                <td className="p-4 align-middle hidden lg:table-cell">
                  <span className="text-muted-foreground text-xs">
                    {permissionsCount} {t('roles:list.resources_configured')}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  {role.isActive ? (
                    <Badge variant="success" size="sm">{t('common:active')}</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">{t('common:inactive')}</Badge>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center justify-end gap-1">
                    {!role.isDeleted && (
                      <PermissionGuard resource="roles" action="update">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { onEdit(role); }}
                          aria-label={t('common:edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </PermissionGuard>
                    )}

                    {!role.isDeleted && onDuplicate && (
                      <PermissionGuard resource="roles" action="create">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { onDuplicate(role); }}
                          aria-label={t('common:duplicate', { defaultValue: 'Duplicate' })}
                        >
                          <Copy className="w-4 h-4 text-blue-500" />
                        </Button>
                      </PermissionGuard>
                    )}

                    {role.isDeleted && onRestore && (
                      <PermissionGuard resource="roles" action="update">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { onRestore(role.id); }}
                          aria-label={t('common:restore', { defaultValue: 'Restore' })}
                        >
                          <RotateCcw className="w-4 h-4 text-primary" />
                        </Button>
                      </PermissionGuard>
                    )}

                    <PermissionGuard resource="roles" action="delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { onDelete(role.id); }}
                        aria-label={t('common:delete')}
                      >
                        <Trash2
                          className={cn(
                            'w-4 h-4',
                            role.isDeleted ? 'text-red-700' : 'text-red-500'
                          )}
                        />
                      </Button>
                    </PermissionGuard>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
