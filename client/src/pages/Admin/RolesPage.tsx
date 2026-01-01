import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Shield, Search, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input, LoadingSpinner, ConfirmModal } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import type { Role, CreateRoleInput } from '@/types';
import { cn } from '@/utils';
import { useRoles } from '@/hooks';
import { RoleForm } from './components/RoleForm';
import { RoleRow } from './components/RoleRow';

/**
 * RolesPage Component
 * 
 * Administrative interface for managing Role-Based Access Control (RBAC).
 * Refactored to use useRoles hook and separated components.
 */
export default function RolesPage() {
  const { t } = useTranslation(['roles', 'common']);
  const {
    roles,
    loading,
    submitting,
    deleting,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole
  } = useRoles();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    let success = false;
    if (editingRole) {
      success = await updateRole(editingRole.id, data);
    } else {
      success = await createRole(data);
    }

    if (success) {
      setShowForm(false);
      setEditingRole(null);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const success = await deleteRole(id);
    if (success) {
      setDeleteId(null);
    }
  };

  // Open edit form
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("roles:title")}
          </h1>
          <p className="text-muted mt-1">{t("roles:subtitle")}</p>
        </div>
        <PermissionGuard resource="roles" action="create">
          <Button
            onClick={() => {
              setShowForm(true);
            }}
          >
            <Plus className="w-5 h-5" />
            {t("roles:create_btn")}
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder={t("roles:search_placeholder")}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void fetchRoles();
          }}
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Roles list */}
      {loading ? (
        <LoadingSpinner size="lg" text={t("roles:loading")} className="py-20" />
      ) : filteredRoles.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchQuery ? t("roles:empty_search") : t("roles:empty")}
            </p>
            {!searchQuery && (
              <PermissionGuard resource="roles" action="create">
                <Button
                  onClick={() => {
                    setShowForm(true);
                  }}
                  className="mt-4"
                >
                  {t("roles:add_first")}
                </Button>
              </PermissionGuard>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredRoles.map((role, index) => (
            <RoleRow
              key={role.id}
              index={index}
              style={{}}
              data={{
                roles: filteredRoles,
                onEdit: handleEdit,
                onDelete: (id) => {
                  setDeleteId(id);
                },
              }}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <RoleForm
            isOpen={showForm}
            role={editingRole}
            onSubmit={(data) => {
              void handleSubmit(data);
            }}
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
        title={t("roles:delete_title")}
        message={t("roles:delete_confirm")}
        confirmText={t("common:delete")}
        cancelText={t("common:cancel")}
        loading={deleting}
        onConfirm={() => {
          if (deleteId) void handleDelete(deleteId);
        }}
        onCancel={() => {
          setDeleteId(null);
        }}
        variant="danger"
      />
    </div>
  );
}
