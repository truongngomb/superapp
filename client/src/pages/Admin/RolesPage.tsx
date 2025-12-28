import { useState, useEffect } from 'react';
import { roleService } from '@/services';
import type { Role, CreateRoleInput } from '@/types';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { logger } from '@/utils/logger';

const RESOURCES = ['categories', 'users', 'roles', 'all'];
const ACTIONS = ['view', 'create', 'update', 'delete', 'manage'];

/**
 * RolesPage Component
 * 
 * Administrative interface for managing Role-Based Access Control (RBAC):
 * - View all roles
 * - Create new roles with specific permissions
 * - Edit existing role permissions
 * - Delete roles
 */
export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: '',
    description: '',
    permissions: {},
  });

  useEffect(() => {
    void loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      logger.error('RolesPage', 'Failed to load roles', error);
      alert('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: {},
      });
    }
    setIsModalOpen(true);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await roleService.update(editingRole.id, formData);
      } else {
        await roleService.create(formData);
      }
      setIsModalOpen(false);
      void loadRoles();
    } catch (error) {
      logger.error('RolesPage', 'Failed to save role', error);
      alert('Failed to save role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await roleService.delete(id);
      void loadRoles();
    } catch (error) {
      logger.error('RolesPage', 'Failed to delete role', error);
      alert('Failed to delete role');
    }
  };

  if (loading) return <div>Loading roles...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <PermissionGuard resource="roles" action="create">
          <button 
            onClick={() => { handleOpenModal(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Role
          </button>
        </PermissionGuard>
      </div>

      <div className="grid gap-4">
        {roles.map(role => (
          <div key={role.id} className="border p-4 rounded bg-white shadow-sm flex justify-between">
            <div>
              <h3 className="font-bold text-lg">{role.name}</h3>
              <p className="text-gray-600">{role.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                Permissions: {Object.keys(role.permissions).length} resources
              </div>
            </div>
            <div className="flex gap-2">
              <PermissionGuard resource="roles" action="update">
                <button 
                  onClick={() => { handleOpenModal(role); }}
                  className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
                >
                  Edit
                </button>
              </PermissionGuard>
              <PermissionGuard resource="roles" action="delete">
                <button 
                  onClick={() => void handleDelete(role.id)}
                  className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </PermissionGuard>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingRole ? 'Edit Role' : 'Create Role'}</h2>
            
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => { setFormData({...formData, name: e.target.value}); }}
                  className="w-full border rounded p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={e => { setFormData({...formData, description: e.target.value}); }}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="border rounded p-4 space-y-4">
                  {RESOURCES.map(resource => (
                    <div key={resource} className="border-b pb-2 last:border-0">
                      <div className="font-medium capitalize mb-2">{resource}</div>
                      <div className="flex flex-wrap gap-4">
                        {ACTIONS.map(action => {
                          const isChecked = formData.permissions[resource]?.includes(action);
                          return (
                            <label key={action} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={isChecked || false}
                                onChange={() => { handleTogglePermission(resource, action); }}
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

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
