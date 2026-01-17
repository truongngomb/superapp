import { Shield, Edit2, Trash2, RotateCcw, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Role } from '@superapp/shared-types';
import { Button, DataRow } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';

interface RoleRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (id: string) => void;
    onRestore?: (id: string) => void;
    onDuplicate?: (role: Role) => void;
  };
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function RoleRow({ index, style, data, isSelected, onSelect }: RoleRowProps) {
  const { t } = useTranslation(['roles', 'common']);
  const role = data.roles[index];
  if (!role) return null;

  const actions = (
    <>
      {!role.isDeleted && (
        <PermissionGuard resource="roles" action="update">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); data.onEdit(role); }}
            aria-label={t('common:edit')}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </PermissionGuard>
      )}

      {!role.isDeleted && data.onDuplicate && (
        <PermissionGuard resource="roles" action="create">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); data.onDuplicate?.(role); }}
            aria-label={t('common:duplicate')}
          >
            <Copy className="w-4 h-4 text-blue-500" />
          </Button>
        </PermissionGuard>
      )}
      
      {role.isDeleted && data.onRestore && (
        <PermissionGuard resource="roles" action="update">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { 
                e.stopPropagation(); 
                if (data.onRestore) {
                  data.onRestore(role.id);
                }
            }}
            aria-label={t('common:restore')}
          >
            <RotateCcw className="w-4 h-4 text-primary" />
          </Button>
        </PermissionGuard>
      )}

      <PermissionGuard resource="roles" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); data.onDelete(role.id); }}
          aria-label={t('common:delete')}
        >
          <Trash2 className={cn("w-4 h-4", role.isDeleted ? "text-red-700" : "text-red-500")} />
        </Button>
      </PermissionGuard>
    </>
  );

  return (
    <DataRow
      style={style}
      icon={<Shield className="w-5 h-5 text-primary" />}
      iconBgColor="bg-primary/10"
      title={role.name}
      description={role.description}
      isActive={role.isActive}
      meta={
        <span className="text-xs">
          {Object.entries(role.permissions).filter(([, actions]) => actions.length > 0).length} {t('roles:list.resources_configured')}
        </span>
      }
      actions={actions}
      isSelected={isSelected}
      onSelect={onSelect ? (checked) => { onSelect(role.id, checked); } : undefined}
    />
  );
}
