/**
 * RoleMobileList Component
 * 
 * Mobile list view with infinite scroll for Roles.
 */
import { useTranslation } from 'react-i18next';
import { 
  ResourceMobileCard, 
  ResourceMobileList,
  ResourceCardSkeletonList,
} from '@superapp/ui-kit';
import { 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Copy,
  FileText
} from 'lucide-react';
import type { Role } from '@superapp/shared-types';

interface RoleMobileListProps {
  /** All roles to display */
  roles: Role[];
  /** Whether there are more items to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void | Promise<void>;
  /** Whether initial loading */
  isLoading: boolean;
  /** Selected role IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelect?: (id: string, checked: boolean) => void;
  /** Callback to edit role */
  onEdit: (role: Role) => void;
  /** Callback to delete role */
  onDelete: (id: string) => void;
  /** Callback to restore role */
  onRestore?: (id: string) => void;
  /** Callback to duplicate role */
  onDuplicate?: (role: Role) => void;
}

export function RoleMobileList({
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
  onDuplicate,
}: RoleMobileListProps) {
  const { t } = useTranslation(['roles', 'uikit']);
  
  return (
    <ResourceMobileList<Role>
      items={roles}
      keyExtractor={(item) => item.id}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      skeleton={<ResourceCardSkeletonList count={5} infoRowsCount={1} actionsCount={3} />}
      renderItem={(role, index) => (
        <ResourceMobileCard
          key={role.id}
          id={role.id}
          index={index}
          title={role.name}
          status={{
            isActive: role.isActive,
            isDeleted: role.isDeleted
          }}
          isSelected={selectedIds.includes(role.id)}
          onSelect={onSelect}
          infoRows={[
            ...(role.description ? [{
              icon: FileText,
              label: t('uikit:form.description'),
              value: role.description,
              iconBgColor: 'bg-blue-500/20',
              iconColor: 'text-blue-400'
            }] : [])
          ]}
          actions={[
            ...(!role.isDeleted ? [{
              icon: Edit2,
              label: t('uikit:edit'),
              onClick: () => { onEdit(role); },
              permission: { resource: 'roles', action: 'update' }
            }] : (onRestore ? [{
              icon: RotateCcw,
              label: t('uikit:restore'),
              onClick: () => { onRestore(role.id); },
              permission: { resource: 'roles', action: 'update' },
              variant: 'primary' as const
            }] : [])),
            ...(!role.isDeleted && onDuplicate ? [{
               icon: Copy,
               label: t('uikit:duplicate'),
               onClick: () => { onDuplicate(role); },
               permission: { resource: 'roles', action: 'create' },
               iconColor: 'text-blue-400'
            }] : []),
            {
              icon: Trash2,
              label: t('uikit:delete'),
              onClick: () => { onDelete(role.id); },
              variant: 'danger',
              permission: { resource: 'roles', action: 'delete' },
              className: role.isDeleted ? 'text-red-700' : 'text-red-400'
            }
          ]}
        />
      )}
    />
  );
}
