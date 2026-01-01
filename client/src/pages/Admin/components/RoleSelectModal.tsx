import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { Button, Modal, Badge } from '@/components/common';
import type { User } from '@/services/user.service';
import type { Role } from '@/types';

interface RoleSelectModalProps {
  isOpen: boolean;
  user: User | null;
  roles: Role[];
  onAssign: (roleId: string) => void;
  onRemove: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function RoleSelectModal({
  isOpen,
  user,
  roles,
  onAssign,
  onRemove,
  onClose,
  loading,
}: RoleSelectModalProps) {
  const { t } = useTranslation(['users', 'common']);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRoleId(user.role || '');
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoleId) {
      onAssign(selectedRoleId);
    }
  };

  if (!user) return null;

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
            disabled={!selectedRoleId || selectedRoleId === user.role}
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

        {/* Current Role */}
        {user.roleName && (
          <div className="p-3 rounded-lg bg-surface flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm">{t('users:role_label')}: </span>
              <Badge variant="secondary">{user.roleName}</Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              disabled={loading}
            >
              {t('common:delete')}
            </Button>
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('users:select_role')}
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {roles.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                {t('users:empty')}
              </p>
            ) : (
              roles.map((role) => (
                <label
                  key={role.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${selectedRoleId === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-surface'
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRoleId === role.id}
                    onChange={(e) => { setSelectedRoleId(e.target.value); }}
                    className="accent-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{role.name}</p>
                    {role.description && (
                      <p className="text-sm text-muted">{role.description}</p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
