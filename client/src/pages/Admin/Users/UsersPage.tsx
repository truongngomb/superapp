import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Users, Search, RefreshCw, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Input, LoadingSpinner, ConfirmModal, SortBar, Pagination } from '@/components/common';
import { useUsers, useRoles, useSort, useDebounce } from '@/hooks';
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
    pagination,
    loading,
    isLoadingMore,
    submitting,
    deleting,
    fetchUsers,
    updateUser,
    deleteUser,
    assignRoles,
  } = useUsers();

  const { roles, fetchRoles } = useRoles();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sorting state
  const { sortConfig, handleSort } = useSort('created', 'desc');

  // Sortable columns configuration
  const sortColumns: Array<{ field: string; label: string }> = [
    { field: 'name', label: t('common:name') },
    { field: 'email', label: t('common:email') },
    { field: 'isActive', label: t('common:status') },
    { field: 'created', label: t('common:created') },
    { field: 'updated', label: t('common:updated') },
  ];

  useEffect(() => {
    const params = {
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: (sortConfig.order ?? 'desc'),
      page: 1
    };
    void fetchUsers(params);
    void fetchRoles();
  }, [fetchUsers, fetchRoles, debouncedSearchQuery, sortConfig]);

  // Display users directly from backend (already filtered and sorted)
  const displayUsers = users;

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
            placeholder={t("users:list.search_placeholder")}
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <SortBar
          columns={sortColumns}
          currentSort={sortConfig}
          onSort={handleSort}
        />
        <p className="text-sm text-muted">
          {t('common:total_items', { count: pagination.total })}
        </p>
      </div>

      {/* Users list */}
      {loading ? (
        <LoadingSpinner size="lg" text={t("common:loading")} className="py-20" />
      ) : displayUsers.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Users className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchQuery ? t("users:list.empty_search") : t("users:list.empty")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayUsers.map((user, index) => (
            <UserRow
              key={user.id}
              index={index}
              style={{}}
              data={{
                users: displayUsers,
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="my-4 relative">
              {isLoadingMore && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => { void fetchUsers({ page }); }}
              />
            </div>
          )}
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
        title={t("users:form.delete_title")}
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
