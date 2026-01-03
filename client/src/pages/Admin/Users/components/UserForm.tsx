import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, Toggle } from '@/components/common';
import type { User } from '@/services/user.service';

interface UserFormProps {
  user: User | null;
  onSubmit: (data: { name: string; isActive?: boolean }) => void;
  onClose: () => void;
  loading: boolean;
  isOpen: boolean;
}

export function UserForm({ user, onSubmit, onClose, loading, isOpen }: UserFormProps) {
  const { t } = useTranslation(['users', 'common']);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setIsActive(user?.isActive ?? true);
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), isActive });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('users:edit_title')}
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('common:cancel')}
          </Button>
          <Button type="submit" form="user-form" loading={loading} disabled={!name.trim()} className="flex-1">
            {t('common:save')}
          </Button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {/* User Info Display */}
        {user && (
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
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>
        )}

        <Input
          label={t('users:name_label')}
          value={name}
          onChange={(e) => { setName(e.target.value); }}
          placeholder={t('users:name_placeholder')}
          required
        />

        {/* Active Status Toggle */}
        <Toggle
          checked={isActive}
          onChange={(checked) => { setIsActive(checked); }}
          label={t('common:active')}
          description={t('users:active_description')}
        />
      </form>
    </Modal>
  );
}

