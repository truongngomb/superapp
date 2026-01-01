import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, UserCog, User as UserIcon } from 'lucide-react';
import { Button, Badge, DataRow } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { formatDate } from '@/utils';
import type { User } from '@/services/user.service';

interface UserRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    users: User[];
    onEdit: (user: User) => void;
    onAssignRole: (user: User) => void;
    onDelete: (id: string) => void;
  };
}

export function UserRow({ index, style, data }: UserRowProps) {
  const { t } = useTranslation(['users', 'common']);
  const user = data.users[index];
  if (!user) return null;

  const actions = (
    <>
      <PermissionGuard resource="users" action="update">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); data.onEdit(user); }}
          aria-label={t('common:edit')}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); data.onAssignRole(user); }}
          aria-label={t('users:assign_role_title')}
        >
          <UserCog className="w-4 h-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard resource="users" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); data.onDelete(user.id); }}
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
      icon={
        user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <UserIcon className="w-5 h-5 text-primary" />
        )
      }
      iconBgColor={user.avatar ? undefined : 'bg-primary/20'} // Only applying bg if no avatar
      title={user.name || user.email}
      description={user.email}
      isActive={user.isActive}
      badges={
        user.roleName ? (
          <Badge variant="secondary" size="sm">{user.roleName}</Badge>
        ) : (
          <span className="text-xs text-muted">{t('users:no_role')}</span>
        )
      }
      meta={formatDate(user.created)}
      actions={actions}
    />
  );
}
