import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, UserCog, User as UserIcon } from 'lucide-react';
import { Button, Badge } from '@/components/common';
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

  return (
    <div style={style} className="px-1 py-1">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-4 flex items-center gap-4"
      >
        {/* Avatar */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
        )}

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">
            {user.name || user.email}
          </h3>
          <p className="text-sm text-muted truncate">{user.email}</p>
          <div className="mt-1">
            {user.roleName ? (
              <Badge variant="secondary" size="sm">{user.roleName}</Badge>
            ) : (
              <span className="text-xs text-muted">{t('users:no_role')}</span>
            )}
          </div>
        </div>

        {/* Join Date */}
        <div className="hidden md:block text-sm text-muted whitespace-nowrap">
          {formatDate(user.created)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
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
        </div>
      </motion.div>
    </div>
  );
}
