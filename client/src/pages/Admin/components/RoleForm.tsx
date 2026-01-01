import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from '@/components/common';
import { PERMISSIONS } from '@/config/constants';
import type { Role, CreateRoleInput } from '@/types';

interface RoleFormProps {
  role: Role | null;
  onSubmit: (data: CreateRoleInput) => void;
  onClose: () => void;
  loading: boolean;
  isOpen: boolean;
}

export function RoleForm({ role, onSubmit, onClose, loading, isOpen }: RoleFormProps) {
  const { t } = useTranslation(['roles', 'common']);
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: '',
    description: '',
    permissions: {},
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: role?.name ?? '',
        description: role?.description ?? '',
        permissions: role?.permissions ?? {},
        isActive: role?.isActive !== false, // Default to true if undefined
      });
    }
  }, [role, isOpen]);

  const handleTogglePermission = (resource: string, action: string) => {
    const currentPerms = formData.permissions[resource] || [];
    let newPerms: string[];

    if (currentPerms.includes(action)) {
      newPerms = currentPerms.filter(a => a !== action);
    } else {
      newPerms = [...currentPerms, action];
    }

    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [resource]: newPerms,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? t('roles:form_edit_title') : t('roles:form_add_title')}
      size="xl"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('common:cancel')}
          </Button>
          <Button type="submit" form="role-form" loading={loading} className="flex-1">
            {role ? t('common:save') : t('common:add')}
          </Button>
        </div>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('roles:name_label')}
          value={formData.name}
          onChange={(e) => { setFormData({ ...formData, name: e.target.value }); }}
          placeholder={t('roles:name_placeholder')}
          required
        />
        <Input
          label={t('roles:desc_label')}
          value={formData.description}
          onChange={(e) => { setFormData({ ...formData, description: e.target.value }); }}
          placeholder={t('roles:desc_placeholder')}
        />

        {/* Active Status Toggle */}
        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
          <div>
            <label className="font-medium text-foreground">{t('common:active')}</label>
            <p className="text-sm text-muted">{t('roles:active_description')}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.isActive}
            onClick={() => { setFormData({ ...formData, isActive: !formData.isActive }); }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{t('roles:permissions_label')}</label>
          <div className="border border-border rounded-lg p-4 space-y-4 bg-background">
            {PERMISSIONS.RESOURCES.map(resource => (
              <div key={resource} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="font-medium capitalize mb-2 text-foreground">{resource}</div>
                <div className="flex flex-wrap gap-4">
                  {PERMISSIONS.ACTIONS.map(action => {
                    const isChecked = formData.permissions[resource]?.includes(action);
                    return (
                      <label key={action} className="flex items-center gap-2 text-sm cursor-pointer text-foreground">
                        <input 
                          type="checkbox"
                          checked={isChecked || false}
                          onChange={() => { handleTogglePermission(resource, action); }}
                          className="rounded border-border"
                        />
                        <span className="capitalize">{action}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

