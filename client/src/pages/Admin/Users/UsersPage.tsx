import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Users, Search, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input, LoadingSpinner, ConfirmModal, SortBar } from '@/components/common';
import { useUsers, useRoles, useSort, useDataSorting } from '@/hooks';
import type { User } from '@/types';
import { cn } from '@/utils';
import { UserRow } from './components/UserRow';
import { UserForm } from './components/UserForm';
import { RoleSelectModal } from '@/pages/Admin/Roles/components/RoleSelectModal';

/**
 * UsersPage Component
 * 
 * Administrative interface for managing users and their roles.
 */
export default function UsersPage() {
  const { t } = useTranslation(['users', 'common']);
  const {
    users,
    loading,
    submitting,
    deleting,
    fetchUsers,
    updateUser,
    deleteUser,
    assignRoles,
  } = useUsers();

  const { roles, fetchRoles } = useRoles();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sorting state
  const { sortConfig, handleSort } = useSort('created', 'desc');

  // Sortable columns configuration
  const sortColumns: Array<{ field: string; label: string }> = [
    { field: 'name', label: t('common:name', 'Name') },
    { field: 'email', label: t('common:email', 'Email') },
    { field: 'isActive', label: t('common:status', 'Status') },
    { field: 'created', label: t('common:created', 'Created') },
    { field: 'updated', label: t('common:updated', 'Updated') },
  ];

  useEffect(() => {
    void fetchUsers({ limit: 100 });
    void fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.roleNames?.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
    );
  }, [users, searchQuery]);

  // Sort users
  const sortedUsers = useDataSorting(filteredUsers, sortConfig);

  // Handle edit user submit
  const handleEditSubmit = async (data: { name: string; isActive?: boolean }) => {
    if (!editingUser) return;
    const success = await updateUser(editingUser.id, data);
    if (success) {
      setEditingUser(null);
    }
  };

  // Handle assign roles
  const handleAssignRoles = async (roleIds: string[]) => {
    if (!assigningUser) return;
    const success = await assignRoles(assigningUser.id, roleIds);
    if (success) {
      setAssigningUser(null);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const success = await deleteUser(id);
    if (success) {
      setDeleteId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("users:title")}
          </h1>
          <p className="text-muted mt-1">{t("users:subtitle")}</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder={t("users:search_placeholder")}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void fetchUsers();
          }}
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Sort Bar */}
      <SortBar
        columns={sortColumns}
        currentSort={sortConfig}
        onSort={handleSort}
      />

      {/* Users list */}
      {loading ? (
        <LoadingSpinner size="lg" text={t("users:loading")} className="py-20" />
      ) : sortedUsers.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Users className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchQuery ? t("users:empty_search") : t("users:empty")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedUsers.map((user, index) => (
            <UserRow
              key={user.id}
              index={index}
              style={{}}
              data={{
                users: sortedUsers,
                onEdit: (u) => {
                  setEditingUser(u);
                },
                onAssignRole: (u) => {
                  setAssigningUser(u);
                },
                onDelete: (id) => {
                  setDeleteId(id);
                },
              }}
            />
          ))}
        </div>
      )}

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <UserForm
            isOpen={!!editingUser}
            user={editingUser}
            onSubmit={(data) => {
              void handleEditSubmit(data);
            }}
            onClose={() => {
              setEditingUser(null);
            }}
            loading={submitting}
          />
        )}
      </AnimatePresence>

      {/* Assign Role Modal */}
      <AnimatePresence>
        {assigningUser && (
          <RoleSelectModal
            isOpen={!!assigningUser}
            user={assigningUser}
            roles={roles}
            onAssign={(roleIds) => {
              void handleAssignRoles(roleIds);
            }}
            onClose={() => {
              setAssigningUser(null);
            }}
            loading={submitting}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title={t("users:delete_title")}
        message={t("users:delete_confirm")}
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
