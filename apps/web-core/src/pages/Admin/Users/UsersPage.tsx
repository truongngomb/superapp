import { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion as framerMotion } from 'framer-motion';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Loader2, 
  Plus, 
  Trash2, 
  FileSpreadsheet,
  Edit2,
  Shield,
  RotateCcw
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
  type ViewMode,
  DataTable,
  type Column,
  Badge,
  Avatar
} from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useSort, useDebounce, useAuth, useResource, useToast, useExcelExport } from '@/hooks';
import type { User, SortColumn, UserCreateInput, UserListParams, UserUpdateInput, Role } from '@/types';
import { cn, getStorageItem, setStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/config';



// ...

import { UserRow } from './components/UserRow';
import { UserForm } from './components/UserForm';
import { RoleSelectModal } from '@/pages/Admin/Roles/components/RoleSelectModal';
import { userService, roleService } from '@/services';
import { UserTableSkeleton } from './components/UserTableSkeleton';
import { UserRowSkeleton } from './components/UserRowSkeleton';

/**
 * UsersPage Component
 */
export default function UsersPage() {
  const { t } = useTranslation(['users', 'common']);
  const { success, error: errorToast } = useToast();

  // Search & Sort & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [showArchived, setShowArchived] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { sortConfig, handleSort } = useSort('created', 'desc', {
    storageKey: STORAGE_KEYS.USERS_SORT as string,
  }) as { sortConfig: { field: string; order: 'asc' | 'desc' }; handleSort: (field: string) => void };

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStorageItem<ViewMode>(STORAGE_KEYS.USERS_VIEW_MODE as string) || 'list';
  });
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.USERS_VIEW_MODE as string, mode);
  };


  // Roles for Assignment
  const [roles, setRoles] = useState<Role[]>([]);
  
  const fetchRoles = useCallback(async () => {
    try {
      // Fetch all active roles for assignment
      const response = await roleService.getPage({ page: 1, limit: 100, isDeleted: false });
      setRoles(response.items);
    } catch (error) {
      console.error('Failed to fetch roles', error);
      errorToast(t('toast.load_error'));
    }
  }, [errorToast, t]);

  // Use Generic Resource Hook
  const {
    items: users,
    loading,
    isLoadingMore,
    total,
    queryParams,
    fetchItems,
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    setSelectedIds,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRestore,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchUpdateStatus,
    exporting,
    getAllForExport,
  } = useResource<User, UserCreateInput, UserUpdateInput, UserListParams>({
    service: userService,
    resourceName: 'users',
    initialParams: {
       page: 1,
       limit: 10,
       sort: sortConfig.field,
       order: sortConfig.order
    }
  });

  // Permissions
  const { checkPermission } = useAuth();
  const canDelete = checkPermission('users', 'delete');
  const canUpdate = checkPermission('users', 'update');
  const canCreate = checkPermission('users', 'create');
  const canSelect = canDelete || canUpdate;

  // UI State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchRestoreConfirm, setShowBatchRestoreConfirm] = useState(false);
  const [batchStatusConfig, setBatchStatusConfig] = useState<{
    isOpen: boolean;
    isActive: boolean;
  } | null>(null);

  // Trigger Fetch on Filters Change
  useEffect(() => {
    const params: UserListParams = {
       search: debouncedSearchQuery || undefined,
       sort: sortConfig.field,
       order: sortConfig.order,
       page: 1,
       isDeleted: showArchived || undefined,
    };
    void fetchItems(params);
    // Fetch roles if not loaded (could be optimized)
    void fetchRoles();
  }, [debouncedSearchQuery, sortConfig, showArchived, fetchItems, fetchRoles]);

  // Handle Assignments
  const handleAssignRoles = async (roleIds: string[]) => {
    if (!assigningUser) return;
    try {
      await userService.assignRoles(assigningUser.id, roleIds);
      success(t('toast.assign_role_success', { defaultValue: 'Roles assigned successfully' }));
      void fetchItems(); // Refresh list to update roles
      setAssigningUser(null);
    } catch {
       errorToast(t('toast.error'));
    }
  };

  // Export
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
  }) as { exportToExcel: (data: User[]) => Promise<void> };

  const handleExport = async () => {
    const allData = await getAllForExport({
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order,
      isDeleted: showArchived || undefined,
    });
    await exportToExcel(allData);
  };



  // Columns Configuration
  const columns: Column<User>[] = useMemo(() => [
    {
      key: 'avatar',
      header: '',
      className: 'w-12 px-4',
      render: (user) => <Avatar src={user.avatar} name={user.name} />
    },
    {
      key: 'name',
      header: t('common:name'),
      sortable: true,
      className: 'font-medium'
    },
    {
       key: 'email',
       header: t('common:email'),
       sortable: true,
       className: 'hidden md:table-cell text-muted-foreground'
    },
    {
       key: 'roles',
       header: t('users:form.role_label'),
       render: (user) => (
         <div className="flex flex-wrap gap-1">
           {user.roles && user.roles.length > 0 ? (
             user.roles.map((roleId) => {
               const role = roles.find(r => r.id === roleId);
               return (
                <Badge key={roleId} variant="secondary" className="text-xs">
                  {role ? role.name : roleId}
                </Badge>
               );
             })
           ) : (
             <span className="text-muted-foreground text-xs italic">{t('common:no_roles', {defaultValue: 'No roles'})}</span>
           )}
         </div>
       )
    },
    {
      key: 'isActive',
      header: t('common:status'),
      sortable: true,
      className: 'w-24',
      render: (user) => user.isActive ? 
        <Badge variant="success" size="sm">{t('common:active')}</Badge> : 
        <Badge variant="danger" size="sm">{t('common:inactive')}</Badge>
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      align: 'right',
      className: 'w-40',
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          {!user.isDeleted && (
            <>
               <PermissionGuard resource="users" action="update">
                 <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setShowForm(true); }} aria-label={t('common:edit')}>
                   <Edit2 className="w-4 h-4" />
                 </Button>
               </PermissionGuard>
               <PermissionGuard resource="users" action="update">
                  <Button variant="ghost" size="sm" onClick={() => { setAssigningUser(user); }} aria-label={t('users:assign_role_btn', {defaultValue: 'Assign Role'})}>
                    <Shield className="w-4 h-4 text-blue-500" />
                  </Button>
               </PermissionGuard>
            </>
          )}
          {user.isDeleted && (
             <PermissionGuard resource="users" action="update">
               <Button variant="ghost" size="sm" onClick={() => { setRestoreId(user.id); }} aria-label={t('common:restore')}>
                 <RotateCcw className="w-4 h-4 text-primary" />
               </Button>
             </PermissionGuard>
          )}
          <PermissionGuard resource="users" action="delete">
             <Button variant="ghost" size="sm" onClick={() => { setDeleteId(user.id); }} aria-label={t('common:delete')}>
               <Trash2 className={cn("w-4 h-4", user.isDeleted ? "text-red-700" : "text-red-500")} />
             </Button>
          </PermissionGuard>
        </div>
      )
    }
  ], [t, roles]);

  const sortColumns: SortColumn[] = [
    { field: 'name', label: t('common:name') },
    { field: 'email', label: t('common:email') },
    { field: 'isActive', label: t('common:status') },
    { field: 'created', label: t('common:created') },
    { field: 'updated', label: t('common:updated') },
  ];

  const hasDeletedSelected = selectedIds.some(
    id => users.find(u => u.id === id)?.isDeleted
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("users:title")}</h1>
            <p className="text-muted mt-1">{t("users:subtitle")}</p>
          </div>
          <PermissionGuard resource="users" action="view">
             <button
               type="button"
               onClick={() => void handleExport()}
               disabled={exporting || users.length === 0}
               className="p-2 rounded-lg hover:bg-[#217346]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               {exporting ? <Loader2 className="w-6 h-6 animate-spin text-[#217346]" /> : <FileSpreadsheet className="w-6 h-6 text-[#217346]" />}
             </button>
          </PermissionGuard>
        </div>
        <PermissionGuard resource="users" action="create">
          <Button onClick={() => { setEditingUser(null); setShowForm(true); }}>
            <Plus className="w-5 h-5" />
            {t("common:add")}
          </Button>
        </PermissionGuard>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            placeholder={t("common:search")}
            className="pl-10"
          />
        </div>
        <SortPopup columns={sortColumns} currentSort={sortConfig} onSort={handleSort} />
        <Button variant="outline" onClick={() => { setIsRefreshing(true); void fetchItems().finally(() => { setIsRefreshing(false); }); }}>
          <RefreshCw className={cn("w-5 h-5", (loading || isRefreshing) && "animate-spin")} />
        </Button>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
           {users.length > 0 && canSelect && (
             <div className="flex items-center p-3 bg-surface rounded-lg">
               <Checkbox
                 triState
                 checked={selectedIds.length === 0 ? false : selectedIds.length === users.length ? true : "indeterminate"}
                 onChange={handleSelectAll}
                 label={t("common:select_all")}
                 hideLabelOnMobile
               />
             </div>
           )}
           <ViewSwitcher value={viewMode} onChange={handleViewModeChange} />
           <PermissionGuard resource="users" action="manage">
             <Toggle
               checked={showArchived}
               onChange={(checked: boolean) => { setShowArchived(checked); setSelectedIds([]); }}
               label={t("common:show_archived")}
               hideLabelOnMobile
             />
           </PermissionGuard>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && showArchived && (
             <PermissionGuard resource="users" action="update">
               <Button variant="outline" size="sm" onClick={() => { setShowBatchRestoreConfirm(true); }}>
                 <RefreshCw className="w-4 h-4" /> {t("common:restore")} ({selectedIds.length})
               </Button>
             </PermissionGuard>
          )}
          {selectedIds.length > 0 && (
             <PermissionGuard resource="users" action="delete">
               <Button variant="danger" size="sm" onClick={() => { setShowBatchDeleteConfirm(true); }}>
                 <Trash2 className="w-4 h-4" /> {t("common:delete_selected")} ({selectedIds.length})
               </Button>
             </PermissionGuard>
          )}
          {selectedIds.length > 0 && !hasDeletedSelected && (
             <PermissionGuard resource="users" action="update">
               <Button variant="outline" size="sm" onClick={() => { setBatchStatusConfig({ isOpen: true, isActive: true }); }}>
                 {t("common:actions.activate")} ({selectedIds.length})
               </Button>
               <Button variant="outline" size="sm" onClick={() => { setBatchStatusConfig({ isOpen: true, isActive: false }); }}>
                 {t("common:actions.deactivate")} ({selectedIds.length})
               </Button>
             </PermissionGuard>
          )}
          <p className="text-sm text-muted">{t('common:total_items', { count: total })}</p>
        </div>
      </div>

      {/* Content */}
      <framerMotion.div
         key={loading ? "loading" : "content"}
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.2 }}
      >
        {loading && users.length === 0 ? (
           viewMode === 'table' ? (
              <UserTableSkeleton />
           ) : (
              <div className="space-y-2">
                 {Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}
              </div>
           )
        ) : users.length === 0 ? (
           <Card className="py-12 text-center">
             <CardContent>
               <Users className="w-12 h-12 text-muted mx-auto mb-4" />
               <p className="text-muted">
                 {searchQuery ? t("common:list.empty_search", { entities: t("users:entities") }) : t("common:list.empty", { entities: t("users:entities") })}
               </p>
               {!searchQuery && canCreate && (
                 <Button onClick={() => { setEditingUser(null); setShowForm(true); }} className="mt-4">
                   {t("common:list.add_first", { entity: t("users:entity") })}
                 </Button>
               )}
             </CardContent>
           </Card>
        ) : (
           <div className="space-y-2">
             {viewMode === 'table' ? (
                <DataTable
                  data={users}
                  columns={columns}
                  keyExtractor={(user) => user.id}
                  selectedIds={canSelect ? selectedIds : undefined}
                  onSelectAll={canSelect ? handleSelectAll : undefined}
                  onSelectOne={canSelect ? handleSelectOne : undefined}
                  sortColumn={sortConfig.field}
                  sortDirection={sortConfig.order}
                  onSort={handleSort}
                  currentPage={queryParams.page}
                />
             ) : (
                users.map((user, index) => (
                  <UserRow
                    key={user.id}
                    index={index}
                    style={{}}
                    data={{
                      users,
                      onEdit: (u) => { setEditingUser(u); setShowForm(true); },
                      onAssignRole: (u) => { setAssigningUser(u); },
                      onDelete: (id) => { setDeleteId(id); },
                      onRestore: (id) => { setRestoreId(id); }
                    }}
                    isSelected={selectedIds.includes(user.id)}
                    onSelect={canSelect ? handleSelectOne : undefined}
                  />
                ))
             )}

             {/* Pagination */}
             {Math.ceil(total / (queryParams.limit || 10)) > 1 && (
               <div className="mt-4 relative">
                 {isLoadingMore && (
                   <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg z-10">
                     <Loader2 className="w-5 h-5 animate-spin text-primary" />
                   </div>
                 )}
                 <Pagination
                   currentPage={queryParams.page || 1}
                   totalPages={Math.ceil(total / (queryParams.limit || 10))}
                   onPageChange={(page) => { void fetchItems({ page }); }}
                 />
               </div>
             )}
           </div>
        )}
      </framerMotion.div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <UserForm
            isOpen={showForm}
            user={editingUser}
            onSubmit={(data) => {
               const submitHandler = async () => {
                 const success = editingUser?.id 
                   ? await handleUpdate(editingUser.id, data as UserUpdateInput) 
                   : await handleCreate(data as UserCreateInput);
                 if (success) {
                   setShowForm(false);
                   setEditingUser(null);
                 }
               };
               void submitHandler();
            }}
            onClose={() => { setShowForm(false); setEditingUser(null); }}
            loading={loading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assigningUser && (
          <RoleSelectModal
            isOpen={!!assigningUser}
            user={assigningUser}
            roles={roles}
            onAssign={(roleIds) => { void handleAssignRoles(roleIds); }}
            onClose={() => { setAssigningUser(null); }}
            loading={loading}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        title={t("common:delete")}
        message={t("common:confirmation.delete", { entity: t("users:entity") })}
        confirmText={t("common:delete")}
        cancelText={t("common:cancel")}
        loading={loading}
        onConfirm={() => { if (deleteId) void handleDelete(deleteId).then(() => { setDeleteId(null); }); }}
        onCancel={() => { setDeleteId(null); }}
        variant="danger"
      />

      <ConfirmModal
         isOpen={!!restoreId}
         title={t("common:restore")}
         message={t("common:confirmation.restore", { entity: t("users:entity") })}
         confirmText={t("common:confirm")}
         cancelText={t("common:cancel")}
         loading={loading}
         onConfirm={() => { if (restoreId) void handleRestore(restoreId).then(() => { setRestoreId(null); }); }}
         onCancel={() => { setRestoreId(null); }}
      />

       <ConfirmModal
        isOpen={showBatchDeleteConfirm}
        title={t("common:batch_delete_title")}
        message={t("common:batch_confirmation.delete", { count: selectedIds.length, entities: t("users:entities") })}
        confirmText={t("common:delete")}
        cancelText={t("common:cancel")}
        loading={loading}
        onConfirm={() => { void handleBatchDelete().then(() => { setShowBatchDeleteConfirm(false); }); }}
        onCancel={() => { setShowBatchDeleteConfirm(false); }}
        variant="danger"
      />

       <ConfirmModal
        isOpen={!!batchStatusConfig?.isOpen}
        title={t("common:confirm")}
        message={t("common:batch_confirmation.status", {
          count: selectedIds.length,
          entities: t("users:entities"),
          action: batchStatusConfig?.isActive ? t("common:actions.activate") : t("common:actions.deactivate"),
        })}
        loading={loading}
        onConfirm={() => { if (batchStatusConfig) void handleBatchUpdateStatus(batchStatusConfig.isActive).then(() => { setBatchStatusConfig(null); }); }}
        onCancel={() => { setBatchStatusConfig(null); }}
      />

       <ConfirmModal
         isOpen={showBatchRestoreConfirm}
         title={t("common:batch_restore_title")}
         message={t("common:batch_confirmation.restore", { count: selectedIds.length, entities: t("users:entities") })}
         loading={loading}
         onConfirm={() => { void handleBatchRestore().then(() => { setShowBatchRestoreConfirm(false); }); }}
         onCancel={() => { setShowBatchRestoreConfirm(false); }}
      />

    </div>
  );
}
