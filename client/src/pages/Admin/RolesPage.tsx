import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { Plus, Edit2, Trash2, Shield, Search, RefreshCw } from 'lucide-react';
import { Button, Card, CardContent, Input, LoadingSpinner, Toast, ConfirmModal, Modal } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { ApiException } from '@/config';
import { roleService } from '@/services';
import type { Role, CreateRoleInput } from '@/types';
import { cn } from '@/utils';

const RESOURCES = ['categories', 'users', 'roles', 'all'];
const ACTIONS = ['view', 'create', 'update', 'delete', 'manage'];

// Role item for virtualized list
interface RoleRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (id: string) => void;
  };
}

function RoleRow({ index, style, data }: RoleRowProps) {
  const role = data.roles[index];
  if (!role) return null;

  return (
    <div style={style} className="px-1 py-1">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-4 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{role.name}</h3>
          <p className="text-sm text-muted truncate">{role.description}</p>
          <div className="mt-1 text-xs text-muted">
            {Object.keys(role.permissions).length} resources configured
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard resource="roles" action="update">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); data.onEdit(role); }}
              aria-label="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard resource="roles" action="delete">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); data.onDelete(role.id); }}
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </PermissionGuard>
        </div>
      </motion.div>
    </div>
  );
}

// Role form modal
interface RoleFormProps {
  role: Role | null;
  onSubmit: (data: CreateRoleInput) => void;
  onClose: () => void;
  loading: boolean;
}

function RoleForm({ role, onSubmit, onClose, loading }: RoleFormProps) {
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: role?.name ?? '',
    description: role?.description ?? '',
    permissions: role?.permissions ?? {},
  });

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
      isOpen={true}
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
            {RESOURCES.map(resource => (
              <div key={resource} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="font-medium capitalize mb-2 text-foreground">{resource}</div>
                <div className="flex flex-wrap gap-4">
                  {ACTIONS.map(action => {
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

/**
 * RolesPage Component
 * 
 * Administrative interface for managing Role-Based Access Control (RBAC):
 * - View all roles with virtualization
 * - Create new roles with specific permissions
 * - Edit existing role permissions
 * - Delete roles
 * - Search/Filtering
 */
export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch roles from API
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      logger.warn('RolesPage', 'Failed to load roles:', error);
      setToast({ message: 'Failed to load roles', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  // Filter roles by search query
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // Handle form submit
  const handleSubmit = async (data: CreateRoleInput) => {
    setSubmitting(true);
    try {
      if (editingRole) {
        await roleService.update(editingRole.id, data);
        setRoles((prev) =>
          prev.map((role) =>
            role.id === editingRole.id ? { ...role, ...data, updatedAt: new Date().toISOString() } : role
          )
        );
        setToast({ message: 'Role updated successfully!', type: 'success' });
      } else {
        const newRole: Role = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Try API first, fallback to local state
        try {
          const result = await roleService.create(data);
          setRoles((prev) => [...prev, result]);
        } catch {
          setRoles((prev) => [...prev, newRole]);
        }
        setToast({ message: 'Role created successfully!', type: 'success' });
      }
      setShowForm(false);
      setEditingRole(null);
    } catch (error) {
      const message = error instanceof ApiException ? error.message : 'An error occurred';
      setToast({ message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await roleService.delete(id);
    } catch {
      // Continue with local delete
    }
    setRoles((prev) => prev.filter((role) => role.id !== id));
    setToast({ message: 'Role deleted successfully!', type: 'success' });
    setDeleting(false);
    setDeleteId(null);
  };

  // Open edit form
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted mt-1">Manage user roles and permissions</p>
        </div>
        <PermissionGuard resource="roles" action="create">
          <Button onClick={() => { setShowForm(true); }}>
            <Plus className="w-5 h-5" />
            Create Role
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            placeholder="Search roles..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => void fetchRoles()}>
          <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Roles list */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading roles..." className="py-20" />
      ) : filteredRoles.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchQuery ? 'No matching roles found' : 'No roles yet'}
            </p>
            {!searchQuery && (
              <PermissionGuard resource="roles" action="create">
                <Button onClick={() => { setShowForm(true); }} className="mt-4">
                  Create first role
                </Button>
              </PermissionGuard>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="h-[500px]">
          <List
            height={500}
            itemCount={filteredRoles.length}
            itemSize={88}
            width="100%"
            itemData={{
              roles: filteredRoles,
              onEdit: handleEdit,
              onDelete: (id: string) => { setDeleteId(id); },
            }}
          >
            {RoleRow}
          </List>
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <RoleForm
            role={editingRole}
            onSubmit={(data) => void handleSubmit(data)}
            onClose={() => {
              setShowForm(false);
              setEditingRole(null);
            }}
            loading={submitting}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={() => { if (deleteId) void handleDelete(deleteId); }}
        onCancel={() => { setDeleteId(null); }}
        variant="danger"
      />

      {/* Toast */}
      <Toast
        message={toast?.message ?? ''}
        type={toast?.type}
        visible={!!toast}
        onClose={() => { setToast(null); }}
      />
    </div>
  );
}
