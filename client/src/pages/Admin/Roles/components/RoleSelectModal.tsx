import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, X } from 'lucide-react';
import { Button, Modal, Badge } from '@/components/common';
import type { User, Role } from '@/types';

interface RoleSelectModalProps {
  isOpen: boolean;
  user: User | null;
  roles: Role[];
  onAssign: (roleIds: string[]) => void;
  onClose: () => void;
  loading?: boolean;
}

export function RoleSelectModal({
  isOpen,
  user,
  roles,
  onAssign,
  onClose,
  loading,
}: RoleSelectModalProps) {
  const { t } = useTranslation(['users', 'common']);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRoleIds(user.roles || []);
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(selectedRoleIds);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const removeRole = (roleId: string) => {
    setSelectedRoleIds(prev => prev.filter(id => id !== roleId));
  };

  // Check if selection changed from original
  const hasChanges = () => {
    const originalRoles = user?.roles || [];
    if (originalRoles.length !== selectedRoleIds.length) return true;
    return !originalRoles.every(id => selectedRoleIds.includes(id));
  };

  if (!user) return null;

  // Get role names for selected IDs
  const getSelectedRoleNames = () => {
    return selectedRoleIds
      .map(id => roles.find(r => r.id === id)?.name)
      .filter(Boolean) as string[];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('users:assign_role_title')}
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('common:cancel')}
          </Button>
          <Button
            type="submit"
            form="role-select-form"
            loading={loading}
            disabled={!hasChanges()}
            className="flex-1"
          >
            {t('common:save')}
          </Button>
        </div>
      }
    >
      <form id="role-select-form" onSubmit={handleSubmit} className="space-y-4">
        {/* User Info Display */}
        <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-medium text-primary">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{user.name || user.email}</p>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        {/* Selected Roles Display */}
        {selectedRoleIds.length > 0 && (
          <div className="p-3 rounded-lg bg-surface">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t('users:roles_label')}: </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getSelectedRoleNames().map((name, i) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                  {name}
                  <button
                    type="button"
                    onClick={() => { 
                      const roleId = selectedRoleIds[i];
                      if (roleId) removeRole(roleId); 
                    }}
                    className="ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                    aria-label={t('common:delete')}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('users:select_roles')}
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {roles.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                {t('users:empty')}
              </p>
            ) : (
              roles.map((role) => {
                const isSelected = selectedRoleIds.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                      ${isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-surface'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => { toggleRole(role.id); }}
                      className="accent-primary w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{role.name}</p>
                      {role.description && (
                        <p className="text-sm text-muted">{role.description}</p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Selection count */}
        <p className="text-sm text-muted text-center">
          {t('users:roles_selected', { count: selectedRoleIds.length })}
        </p>
      </form>
    </Modal>
  );
}
