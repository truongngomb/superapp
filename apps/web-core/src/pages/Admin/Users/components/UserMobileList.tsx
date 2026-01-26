/**
 * UserMobileList Component
 * 
 * Mobile list view with infinite scroll for Users.
 */
import { useTranslation } from 'react-i18next';
import { 
  ResourceMobileCard, 
  ResourceMobileList,
  ResourceCardSkeletonList,
  Avatar,
  Badge,
} from '@superapp/ui-kit';
import { 
  Edit2, 
  Trash2, 
  RotateCcw,
  Mail,
  Shield
} from 'lucide-react';
import type { User, Role } from '@superapp/shared-types';

interface UserMobileListProps {
  /** All users to display */
  users: User[];
  /** Available roles for display mapping */
  roles: Role[];
  /** Whether there are more items to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void | Promise<void>;
  /** Whether initial loading */
  isLoading: boolean;
  /** Selected user IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelect?: (id: string, checked: boolean) => void;
  /** Callback to edit user */
  onEdit: (user: User) => void;
  /** Callback to delete user */
  onDelete: (id: string) => void;
  /** Callback to restore user */
  onRestore?: (id: string) => void;
  /** Callback to assign role */
  onAssignRole: (user: User) => void;
}

export function UserMobileList({
  users,
  roles,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  selectedIds = [],
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  onAssignRole,
}: UserMobileListProps) {
  const { t } = useTranslation(['users', 'uikit']);
  
  return (
    <ResourceMobileList<User>
      items={users}
      keyExtractor={(item) => item.id}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      skeleton={<ResourceCardSkeletonList count={5} infoRowsCount={2} actionsCount={3} />}
      renderItem={(user, index) => (
        <ResourceMobileCard
          key={user.id}
          id={user.id}
          index={index}
          title={user.name}
          icon={
            <div className="w-12 h-12 flex-shrink-0">
              <Avatar src={user.avatar} name={user.name} className="w-12 h-12 rounded-full ring-2 ring-background" />
            </div>
          }
          status={{
            isActive: user.isActive,
            isDeleted: user.isDeleted
          }}
          isSelected={selectedIds.includes(user.id)}
          onSelect={onSelect}
          infoRows={[
            {
              icon: Mail,
              label: t('uikit:email'),
              value: user.email,
              iconBgColor: 'bg-blue-500/20',
              iconColor: 'text-blue-400'
            },
            {
              icon: Shield,
              label: t('uikit:role'),
              value: (
                <div className="flex flex-wrap justify-end gap-1">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((roleId) => {
                      const role = roles.find(r => r.id === roleId);
                      return (
                        <Badge key={roleId} variant="secondary" className="text-xs h-6 px-2 font-medium">
                          {role ? role.name : roleId}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-xs italic text-muted-foreground">{t('uikit:no_roles')}</span>
                  )}
                </div>
              ),
              iconBgColor: 'bg-purple-500/20',
              iconColor: 'text-purple-400'
            }
          ]}
          actions={[
            ...(!user.isDeleted ? [{
              icon: Edit2,
              label: t('uikit:edit'),
              onClick: () => { onEdit(user); },
              permission: { resource: 'users', action: 'update' }
            }] : (onRestore ? [{
              icon: RotateCcw,
              label: t('uikit:restore'),
              onClick: () => { onRestore(user.id); },
              permission: { resource: 'users', action: 'update' },
              variant: 'primary' as const
            }] : [])),
            ...(!user.isDeleted ? [{
               icon: Shield,
               label: t('users:assign_role_btn'),
               onClick: () => { onAssignRole(user); },
               permission: { resource: 'users', action: 'update' },
               iconColor: 'text-blue-400'
            }] : []),
            {
              icon: Trash2,
              label: t('uikit:delete'),
              onClick: () => { onDelete(user.id); },
              variant: 'danger',
              permission: { resource: 'users', action: 'delete' },
              className: user.isDeleted ? 'text-red-600' : 'text-red-400'
            }
          ]}
        />
      )}
    />
  );
}
