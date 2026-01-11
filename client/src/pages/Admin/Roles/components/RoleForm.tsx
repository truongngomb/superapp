import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, Toggle } from '@/components/common';
import { PERMISSIONS } from '@/config/constants';
import type { Role, CreateRoleInput } from '@/types';
import { useSettings } from '@/hooks';

interface RoleFormProps {
  role: Role | null;
  onSubmit: (data: CreateRoleInput) => void;
  onClose: () => void;
  loading: boolean;
  isOpen: boolean;
}

export function RoleForm({ role, onSubmit, onClose, loading, isOpen }: RoleFormProps) {
  const { t } = useTranslation(['roles', 'common']);
  const { getSettingValue } = useSettings();
  
  // Get dynamic resources from settings, fallback to empty array
  const settingResources = getSettingValue<string[]>('role_resources', []);

  // Merge default resources with setting resources, ensuring uniqueness
  const resources = useMemo(() => {
    const defaults = [...PERMISSIONS.RESOURCES];
    const fromSettings = settingResources;
    return Array.from(new Set([...fromSettings, ...defaults]));
  }, [settingResources]);

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
        isActive: role?.isActive ?? true,
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
      title={role ? t('roles:form.edit_title') : t('roles:form.add_title')}
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
          label={t('roles:form.name_label')}
          value={formData.name}
          onChange={(e) => { setFormData({ ...formData, name: e.target.value }); }}
          placeholder={t('roles:form.name_placeholder')}
          required
        />
        <Input
          label={t('roles:form.desc_label')}
          value={formData.description}
          onChange={(e) => { setFormData({ ...formData, description: e.target.value }); }}
          placeholder={t('roles:form.desc_placeholder')}
        />

        {/* Active Status Toggle */}
        <Toggle
          checked={formData.isActive ?? true}
          onChange={(checked) => { setFormData({ ...formData, isActive: checked }); }}
          label={t('common:active')}
          description={t('roles:form.active_description')}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{t('roles:form.permissions_label')}</label>
          <div className="border border-border rounded-lg p-4 space-y-4 bg-background">
            {resources.map(resource => (
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

