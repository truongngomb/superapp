import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, UserCog, User as UserIcon, RotateCcw } from 'lucide-react';
import { Button, Badge, DataRow } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { formatDate } from '@/utils';
import type { User } from '@superapp/shared-types';
import { cn } from '@/utils';

interface UserRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    users: User[];
    onEdit: (user: User) => void;
    onAssignRole: (user: User) => void;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
  };
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function UserRow({ index, style, data, isSelected, onSelect }: UserRowProps) {
  const { t } = useTranslation(['users', 'common']);
  const user = data.users[index];
  if (!user) return null;

  const actions = (
    <>
      <PermissionGuard resource="users" action="update">
        {!user.isDeleted && (
          <>
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
              aria-label={t('users:form.assign_role_title')}
            >
              <UserCog className="w-4 h-4" />
            </Button>
          </>
        )}
        {user.isDeleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); data.onRestore(user.id); }}
            aria-label={t('common:restore', { defaultValue: 'Restore' })}
          >
            <RotateCcw className="w-4 h-4 text-primary" />
          </Button>
        )}
      </PermissionGuard>
      <PermissionGuard resource="users" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); data.onDelete(user.id); }}
          aria-label={user.isDeleted ? t('common:delete') : t('common:archive', { defaultValue: 'Archive' })}
        >
          <Trash2 className={cn("w-4 h-4", user.isDeleted ? "text-red-700" : "text-red-500")} />
        </Button>
      </PermissionGuard>
    </>
  );

  return (
    <DataRow
      className="flex-1"
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
      iconBgColor={user.avatar ? undefined : 'bg-primary/20'}
      title={
        <div className="flex items-center gap-2">
          <span>{user.name || user.email}</span>
          {user.isDeleted && (
            <Badge variant="danger" size="sm">
              {t('common:archived', { defaultValue: 'Archived' })}
            </Badge>
          )}
        </div>
      }
      description={user.email}
      isActive={user.isActive}
      badges={
        user.roleNames && user.roleNames.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {user.roleNames.map((name, i) => (
              <Badge key={i} variant="secondary" size="sm">{name}</Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted">{t('users:form.no_role')}</span>
        )
      }
      meta={formatDate(user.created)}
      actions={actions}
      isSelected={isSelected}
      onSelect={onSelect ? (checked) => { onSelect(user.id, checked); } : undefined}
    />
  );
}
