import { Shield, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Role } from '@/types';
import { Button, DataRow } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';

interface RoleRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (id: string) => void;
  };
}

export function RoleRow({ index, style, data }: RoleRowProps) {
  const { t } = useTranslation(['roles', 'common']);
  const role = data.roles[index];
  if (!role) return null;

  const actions = (
    <>
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
      <PermissionGuard resource="roles" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); data.onDelete(role.id); }}
          aria-label={t('common:delete')}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
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
    />
  );
}
