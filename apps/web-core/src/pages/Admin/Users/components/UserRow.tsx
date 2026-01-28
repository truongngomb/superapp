import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, UserCog, RotateCcw } from 'lucide-react';
import { Button, Badge, DataRow, Avatar } from '@superapp/ui-kit';
import { formatDate } from '@/utils';
import type { User } from '@superapp/shared-types';
import { cn } from '@/utils';
import { PermissionGuard } from '@superapp/ui-kit';

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
  const { t } = useTranslation(['users', 'uikit']);
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
              aria-label={t('uikit:edit')}
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
            aria-label={t('uikit:restore')}
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
          aria-label={user.isDeleted ? t('uikit:delete') : t('uikit:archive')}
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
      icon={<Avatar src={user.avatar} name={user.name || user.email} size="md" />}
      iconBgColor={undefined}
      title={
        <div className="flex items-center gap-2">
          <span>{user.name || user.email}</span>
          {user.isDeleted && (
            <Badge variant="danger" size="sm">
              {t('uikit:archived')}
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
          <span className="text-xs text-muted-foreground">{t('users:form.no_role')}</span>
        )
      }
      meta={formatDate(user.created)}
      actions={actions}
      isSelected={isSelected}
      onSelect={onSelect ? (checked) => { onSelect(user.id, checked); } : undefined}
    />
  );
}
