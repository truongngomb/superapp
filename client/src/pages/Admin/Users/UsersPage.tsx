import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Loader2, 
  Plus, 
  Trash2, 
  FileSpreadsheet 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Card, 
  CardContent, 
  Input, 
  ConfirmModal, 
  SortPopup, 
  Pagination, 
  Checkbox, 
  Toggle, 
  ViewSwitcher,
  type ViewMode 
} from '@/components/common';
import { UserTableSkeleton } from './components/UserTableSkeleton';
import { UserRowSkeleton } from './components/UserRowSkeleton';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useUsers, useRoles, useSort, useDebounce, useAuth } from '@/hooks';
import type { User, SortColumn, UserCreateInput, UserUpdateInput } from '@/types';
import { cn, getStorageItem, setStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/config';
import { useExcelExport } from '@/hooks/useExcelExport';
import { UserRow } from './components/UserRow';
import { UserForm } from './components/UserForm';
import { UserTable } from './components/UserTable';
import { RoleSelectModal } from '@/pages/Admin/Roles/components/RoleSelectModal';

/**
 * UsersPage Component
 * 
 * Administrative interface for managing users and their roles.
 * Aligned with Category Management SSoT.
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
    batchDeleting,
    exporting,
    fetchUsers,
    createUser,
    updateUser,
    restoreUser,
    deleteUser,
    deleteUsers,
    restoreUsers,
    updateUsersStatus,
    getAllForExport,
    assignRoles,
  } = useUsers();

  const { checkPermission } = useAuth();
  const canDelete = checkPermission('users', 'delete');
  const canUpdate = checkPermission('users', 'update');
  const canSelect = canDelete || canUpdate;

  const { roles, fetchRoles } = useRoles();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchRestoreConfirm, setShowBatchRestoreConfirm] = useState(false);
  const [batchStatusConfig, setBatchStatusConfig] = useState<{
    isOpen: boolean;
    isActive: boolean;
  } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // View mode state (persisted)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStorageItem<ViewMode>(STORAGE_KEYS.USERS_VIEW_MODE) || 'list';
  });

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.USERS_VIEW_MODE, mode);
  };

  // Sorting state (persisted)
  const { sortConfig, handleSort } = useSort('created', 'desc', {
    storageKey: STORAGE_KEYS.USERS_SORT,
  });

  // Excel export hook
  const { exportToExcel } = useExcelExport<User>({
    fileNamePrefix: 'users',
    sheetName: t('users:title'),
    columns: [
      { key: '#', header: '#', width: 8 },
      { key: 'name', header: t('common:name'), width: 25 },
      { key: 'email', header: t('common:email'), width: 30 },
      { key: 'roleNames', header: t('users:form.role_label'), width: 20 },
      { key: 'isActive', header: t('common:status'), width: 12 },
      { key: 'created', header: t('common:created'), width: 15 },
    ],
  });

  const handleExport = async () => {
    const allData = await getAllForExport({
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order ?? 'desc',
      isDeleted: showArchived || undefined,
    });
    await exportToExcel(allData);
  };

  // Sortable columns configuration
  const sortColumns: SortColumn[] = [
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
      page: 1,
      isDeleted: showArchived || undefined,
    };
    void fetchUsers(params);
    void fetchRoles();
  }, [fetchUsers, fetchRoles, debouncedSearchQuery, sortConfig, showArchived]);

  const displayUsers = users;

  // Handle form submit
  const handleFormSubmit = async (data: UserCreateInput | UserUpdateInput) => {
    let success = false;
    if (editingUser?.id) {
      success = await updateUser(editingUser.id, data as UserUpdateInput);
    } else {
      success = await createUser(data as UserCreateInput);
    }

    if (success) {
      setShowForm(false);
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

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayUsers.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBatchDelete = async () => {
    const success = await deleteUsers(selectedIds);
    if (success) {
      setSelectedIds([]);
      setShowBatchDeleteConfirm(false);
    }
  };

  const handleBatchStatusUpdate = async (isActive: boolean) => {
    const success = await updateUsersStatus(selectedIds, isActive);
    if (success) {
      setSelectedIds([]);
      setBatchStatusConfig(null);
    }
  };

  const handleBatchRestore = async () => {
    const success = await restoreUsers(selectedIds);
    if (success) {
      setSelectedIds([]);
      setShowBatchRestoreConfirm(false);
    }
  };

  const hasDeletedSelected = selectedIds.some(
    id => displayUsers.find(u => u.id === id)?.isDeleted
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("users:title")}
            </h1>
            <p className="text-muted mt-1">{t("users:subtitle")}</p>
          </div>
          <PermissionGuard resource="users" action="view">
            <button
              type="button"
              onClick={() => { void handleExport(); }}
              disabled={exporting || displayUsers.length === 0}
              className="p-2 rounded-lg hover:bg-[#217346]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={t("common:export_excel")}
            >
              {exporting ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#217346]" />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-[#217346]" />
              )}
            </button>
          </PermissionGuard>
        </div>
        <PermissionGuard resource="users" action="create">
          <Button
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-5 h-5" />
            {t("common:add")}
          </Button>
        </PermissionGuard>
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
            placeholder={t("common:search")}
            className="pl-10"
          />
        </div>
        <SortPopup
          columns={sortColumns}
          currentSort={sortConfig}
          onSort={handleSort}
        />
        <Button
          variant="outline"
          onClick={() => {
            setIsRefreshing(true);
            void fetchUsers().finally(() => { setIsRefreshing(false); });
          }}
        >
          <RefreshCw className={cn("w-5 h-5", (loading || isRefreshing) && "animate-spin")} />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {displayUsers.length > 0 && canSelect && (
            <div className="flex items-center p-3 bg-surface rounded-lg">
              <Checkbox
                triState
                checked={
                  selectedIds.length === 0
                    ? false
                    : selectedIds.length === displayUsers.length
                    ? true
                    : "indeterminate"
                }
                onChange={(checked: boolean) => { handleSelectAll(checked); }}
                label={t("common:select_all")}
                hideLabelOnMobile
              />
            </div>
          )}
          <ViewSwitcher value={viewMode} onChange={handleViewModeChange} />
          <PermissionGuard resource="users" action="manage">
            <Toggle
              checked={showArchived}
              onChange={(checked) => {
                setShowArchived(checked);
                setSelectedIds([]);
              }}
              label={t("common:show_archived")}
              hideLabelOnMobile
            />
          </PermissionGuard>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && showArchived && (
            <PermissionGuard resource="users" action="update">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowBatchRestoreConfirm(true); }}
              >
                <RefreshCw className="w-4 h-4" />
                {t("common:restore")} ({selectedIds.length})
              </Button>
            </PermissionGuard>
          )}
          {selectedIds.length > 0 && (
            <PermissionGuard resource="users" action="delete">
              <Button
                variant="danger"
                size="sm"
                onClick={() => { setShowBatchDeleteConfirm(true); }}
              >
                <Trash2 className="w-4 h-4" />
                {t("common:delete_selected")} ({selectedIds.length})
              </Button>
            </PermissionGuard>
          )}
          {selectedIds.length > 0 && (
            <PermissionGuard resource="users" action="update">
              {!hasDeletedSelected && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setBatchStatusConfig({ isOpen: true, isActive: true }); }}
                  >
                    {t("common:actions.activate")} ({selectedIds.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setBatchStatusConfig({ isOpen: true, isActive: false }); }}
                  >
                    {t("common:actions.deactivate")} ({selectedIds.length})
                  </Button>
                </>
              )}
            </PermissionGuard>
          )}
          <p className="text-sm text-muted">
            {t('common:total_items', { count: pagination.total })}
          </p>
        </div>
      </div>

      {/* Users list */}
      {(loading && displayUsers.length === 0) || isRefreshing ? (
        viewMode === 'table' ? (
          <Card>
            <CardContent className="p-0">
              <UserTableSkeleton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <UserRowSkeleton key={i} />
            ))}
          </div>
        )
      ) : displayUsers.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Users className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchQuery ? t("common:list.empty_search", { entities: t("users:entities") }) : t("common:list.empty", { entities: t("users:entities") })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {viewMode === 'table' ? (
            <Card>
              <CardContent className="p-0">
                <UserTable
                  users={displayUsers}
                  selectedIds={canSelect ? selectedIds : []}
                  currentPage={pagination.page}
                  onSelectAll={canSelect ? handleSelectAll : undefined}
                  onSelectOne={canSelect ? handleSelectOne : undefined}
                  onEdit={(u) => {
                    setEditingUser(u);
                    setShowForm(true);
                  }}
                  onAssignRole={(u) => {
                    setAssigningUser(u);
                  }}
                  onDelete={(id) => {
                    setDeleteId(id);
                  }}
                  onRestore={(id) => {
                    setRestoreId(id);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            displayUsers.map((user, index) => (
              <UserRow
                key={user.id}
                index={index}
                style={{}}
                data={{
                  users: displayUsers,
                  onEdit: (u) => {
                    setEditingUser(u);
                    setShowForm(true);
                  },
                  onAssignRole: (u) => {
                    setAssigningUser(u);
                  },
                  onDelete: (id) => {
                    setDeleteId(id);
                  },
                  onRestore: (id) => {
                    setRestoreId(id);
                  },
                }}
                isSelected={selectedIds.includes(user.id)}
                onSelect={canSelect ? handleSelectOne : undefined}
              />
            ))
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 relative">
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

      {/* User Form Modal (Create/Edit) */}
      <AnimatePresence>
        {showForm && (
          <UserForm
            isOpen={showForm}
            user={editingUser}
            onSubmit={(data) => { void handleFormSubmit(data); }}
            onClose={() => {
              setShowForm(false);
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
            onAssign={(roleIds) => { void handleAssignRoles(roleIds); }}
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
        title={t("common:delete")}
        message={t("common:confirmation.delete", { entity: t("users:entity") })}
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

      {/* Restore Confirm Modal */}
      <ConfirmModal
        isOpen={!!restoreId}
        title={t("common:restore")}
        message={t("common:confirmation.restore", { entity: t("users:entity") })}
        confirmText={t("common:confirm")}
        cancelText={t("common:cancel")}
        loading={submitting}
        onConfirm={() => {
          if (restoreId) {
            void restoreUser(restoreId).then(success => {
              if (success) setRestoreId(null);
            });
          }
        }}
        onCancel={() => {
          setRestoreId(null);
        }}
      />

      {/* Batch Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showBatchDeleteConfirm}
        title={t("common:batch_delete_title")}
        message={t("common:batch_confirmation.delete", { count: selectedIds.length, entities: t("users:entities") })}
        confirmText={t("common:delete")}
        cancelText={t("common:cancel")}
        loading={batchDeleting}
        onConfirm={() => { void handleBatchDelete(); }}
        onCancel={() => { setShowBatchDeleteConfirm(false); }}
        variant="danger"
      />

      {/* Batch Status Update Confirm Modal */}
      <ConfirmModal
        isOpen={!!batchStatusConfig?.isOpen}
        title={t("common:confirm")}
        message={t("common:batch_confirmation.status", {
          count: selectedIds.length,
          entities: t("users:entities"),
          action: batchStatusConfig?.isActive
            ? t("common:actions.activate")
            : t("common:actions.deactivate"),
        })}
        confirmText={t("common:confirm")}
        cancelText={t("common:cancel")}
        loading={submitting}
        onConfirm={() => {
          if (batchStatusConfig) void handleBatchStatusUpdate(batchStatusConfig.isActive);
        }}
        onCancel={() => { setBatchStatusConfig(null); }}
      />

      {/* Batch Restore Confirm Modal */}
      <ConfirmModal
        isOpen={showBatchRestoreConfirm}
        title={t("common:batch_restore_title")}
        message={t("common:batch_confirmation.restore", { count: selectedIds.length, entities: t("users:entities") })}
        confirmText={t("common:confirm")}
        cancelText={t("common:cancel")}
        loading={submitting}
        onConfirm={() => { void handleBatchRestore(); }}
        onCancel={() => { setShowBatchRestoreConfirm(false); }}
      />
    </div>
  );
}
