import { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: '',
    description: '',
    permissions: {},
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: role?.name ?? '',
        description: role?.description ?? '',
        permissions: role?.permissions ?? {},
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
      title={role ? 'Edit Role' : 'Create Role'}
      size="xl"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" form="role-form" loading={loading} className="flex-1">
            {role ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => { setFormData({ ...formData, name: e.target.value }); }}
          placeholder="Enter role name"
          required
        />
        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => { setFormData({ ...formData, description: e.target.value }); }}
          placeholder="Enter role description"
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Permissions</label>
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
