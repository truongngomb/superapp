import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, Toggle } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import type { User, UserCreateInput, UserUpdateInput } from '@superapp/shared-types';

interface UserFormProps {
  user: User | null;
  onSubmit: (data: UserCreateInput | UserUpdateInput) => void;
  onClose: () => void;
  loading: boolean;
  isOpen: boolean;
}

export function UserForm({ user, onSubmit, onClose, loading, isOpen }: UserFormProps) {
  const { t } = useTranslation(['users', 'common']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isActive, setIsActive] = useState(true);

  const isEdit = !!user;

  useEffect(() => {
    if (isOpen) {
      // Defer state updates to avoid cascading render warning
      setTimeout(() => {
        setName(user?.name || '');
        setEmail(user?.email || '');
        setPassword('');
        setPasswordConfirm('');
        setIsActive(user?.isActive ?? true);
      }, 0);
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      onSubmit({ 
        name: name.trim(), 
        isActive 
      } as UserUpdateInput);
    } else {
      onSubmit({ 
        email: email.trim(),
        name: name.trim(),
        password,
        passwordConfirm,
        isActive 
      } as UserCreateInput);
    }
  };

  const isFormValid = isEdit 
    ? name.trim() !== '' 
    : name.trim() !== '' && email.trim() !== '' && password !== '' && password === passwordConfirm;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('common:form.edit_title', { entity: t('users:entity') }) : t('common:form.add_title', { entity: t('users:entity') })}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common:cancel')}
          </Button>
          <Button 
            type="submit" 
            form="user-form" 
            loading={loading} 
            disabled={!isFormValid} 
          >
            {isEdit ? t('common:save') : t('common:add')}
          </Button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {/* User Avatar Placeholder/Preview */}
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
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}

        <Input
          label={t('users:form.name_label')}
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); }}
          placeholder={t('users:form.name_placeholder')}
          required
        />

        {!isEdit && (
          <>
            <Input
              label={t('users:form.email_label')}
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); }}
              placeholder="example@domain.com"
              required
            />
            <Input
              label={t('common:password')}
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); }}
              required
            />
            <Input
              label={t('common:password_confirm')}
              type="password"
              value={passwordConfirm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPasswordConfirm(e.target.value); }}
              required
              error={password !== passwordConfirm && passwordConfirm !== '' ? t('auth:error.password_mismatch') : undefined}
            />
          </>
        )}

        {/* Active Status Toggle */}
        <PermissionGuard resource="users" action="manage">
          <Toggle
            checked={isActive}
            onChange={(checked: boolean) => { setIsActive(checked); }}
            label={t('users:form.is_active_label')}
            description={t('users:form.active_description')}
          />
        </PermissionGuard>
      </form>
    </Modal>
  );
}

