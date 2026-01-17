import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';
import { 
  Users, 
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
  ConfirmModal, 
  Pagination, 
  type ViewMode,
  DataTable,
  type Column,
  Badge,
  Avatar,
  ResourceToolbar,
  BatchActionButtons,
  SearchFilterBar
} from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useSort, useDebounce, useAuth, useResource, useToast, useExcelExport } from '@/hooks';
import type { User, SortColumn, UserCreateInput, UserListParams, UserUpdateInput, Role } from '@superapp/shared-types';
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
import { useSearchParams } from 'react-router-dom';

// ...

export default function UsersPage() {
  const { t } = useTranslation(['users', 'common']);
  const { success, error: errorToast } = useToast();
  const [searchParams] = useSearchParams();

  // Search & Sort & Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [showArchived, setShowArchived] = useState(searchParams.get('isDeleted') === 'true');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const urlSort = searchParams.get('sort');
  const urlOrder = searchParams.get('order');

  const { sortConfig, handleSort } = useSort('created', 'desc', {
    storageKey: STORAGE_KEYS.USERS_SORT as string,
    initialOverride: (urlSort && (urlOrder === 'asc' || urlOrder === 'desc')) ? { field: urlSort, order: urlOrder } : undefined
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

  // Fetch roles once on mount
  useEffect(() => {
    void fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevFiltersRef = useRef({
    search: debouncedSearchQuery,
    sort: sortConfig.field,
    order: sortConfig.order,
    isDeleted: showArchived,
  });

  // 1. Initial Load
  useEffect(() => {
    void fetchItems(); // Initial load using URL params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Handle Filter Changes
  useEffect(() => {
    // Check if filters actually changed
    const prev = prevFiltersRef.current;
    const hasFilterChanged = 
      prev.search !== debouncedSearchQuery ||
      prev.sort !== sortConfig.field ||
      prev.order !== sortConfig.order ||
      prev.isDeleted !== showArchived;

    if (hasFilterChanged) {
      // Update ref
      prevFiltersRef.current = {
        search: debouncedSearchQuery,
        sort: sortConfig.field,
        order: sortConfig.order,
        isDeleted: showArchived,
      };

      const params: UserListParams = {
         search: debouncedSearchQuery || undefined,
         sort: sortConfig.field,
         order: sortConfig.order,
         page: 1,
         isDeleted: showArchived || undefined,
      };
      void fetchItems(params);
    }
  }, [debouncedSearchQuery, sortConfig, showArchived, fetchItems]);

  // Handle Assignments
  const handleAssignRoles = async (roleIds: string[]) => {
    if (!assigningUser) return;
    try {
      await userService.assignRoles(assigningUser.id, roleIds);
      success(t('toast.assign_role_success'));
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
      accessorKey: 'avatar',
      header: '',
      width: '80px',
      className: 'px-4 justify-center',
      cell: ({ row }) => <Avatar src={row.original.avatar} name={row.original.name} />
    },
    {
      accessorKey: 'name',
      header: t('common:name'),
      enableSorting: true,
      width: '1.5fr',
      className: 'font-medium'
    },
    {
       accessorKey: 'email',
       header: t('common:email'),
       enableSorting: true,
       width: '2fr',
       className: 'hidden md:flex text-muted-foreground'
    },
    {
       accessorKey: 'roles',
       header: t('users:form.role_label'),
       width: '1.5fr',
       cell: ({ row }) => {
         const user = row.original;
         return (
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
             <span className="text-muted-foreground text-xs italic">{t('common:no_roles')}</span>
           )}
         </div>
       )}
    },
    {
      accessorKey: 'isActive',
      header: t('common:status'),
      enableSorting: true,
      width: '120px',
      cell: ({ row }) => row.original.isActive ? 
        <Badge variant="success" size="sm">{t('common:active')}</Badge> : 
        <Badge variant="danger" size="sm">{t('common:inactive')}</Badge>
    },
    {
      id: 'actions',
      header: t('common:actions.label'),
      align: 'right',
      width: '160px',
      cell: ({ row }) => {
        const user = row.original;
        return (
        <div className="flex items-center justify-end gap-1">
          {!user.isDeleted && (
            <>
               <PermissionGuard resource="users" action="update">
                 <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setShowForm(true); }} aria-label={t('common:edit')}>
                   <Edit2 className="w-4 h-4" />
                 </Button>
               </PermissionGuard>
               <PermissionGuard resource="users" action="update">
                  <Button variant="ghost" size="sm" onClick={() => { setAssigningUser(user); }} aria-label={t('users:assign_role_btn')}>
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
      )}
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
             <Button
               variant="ghost"
               onClick={() => void handleExport()}
               disabled={exporting || users.length === 0}
               className="h-10 w-10 p-0 text-[#217346] hover:bg-[#217346]/10"
             >
               {exporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileSpreadsheet className="w-6 h-6" />}
             </Button>
          </PermissionGuard>
        </div>
        <PermissionGuard resource="users" action="create">
          <Button onClick={() => { setEditingUser(null); setShowForm(true); }}>
            <Plus className="w-5 h-5" />
            {t("users:create_btn")}
          </Button>
        </PermissionGuard>
      </div>

      {/* Search Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortColumns={sortColumns}
        sortConfig={sortConfig}
        onSort={handleSort}
        isRefreshing={isRefreshing}
        isLoading={loading}
        onRefresh={() => { setIsRefreshing(true); void fetchItems().finally(() => { setIsRefreshing(false); }); }}
      />

      {/* Resource Toolbar */}
      <ResourceToolbar
        resource="users"
        itemCount={users.length}
        totalItems={total}
        canSelect={canSelect}
        selectedCount={selectedIds.length}
        totalListItems={users.length}
        onSelectAll={handleSelectAll}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showArchived={showArchived}
        onShowArchivedChange={(checked) => { setShowArchived(checked); setSelectedIds([]); }}
        batchActions={
          <BatchActionButtons
            resource="users"
            selectedCount={selectedIds.length}
            showArchived={showArchived}
            hasDeletedSelected={hasDeletedSelected}
            onRestore={() => { setShowBatchRestoreConfirm(true); }}
            onDelete={() => { setShowBatchDeleteConfirm(true); }}
            onActivate={() => { setBatchStatusConfig({ isOpen: true, isActive: true }); }}
            onDeactivate={() => { setBatchStatusConfig({ isOpen: true, isActive: false }); }}
          />
        }
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        <framerMotion.div
          key={loading && users.length === 0 ? "loading" : users.length === 0 ? "empty" : "content"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-[400px]"
        >
        { (loading && users.length === 0) || isRefreshing ? (
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
      </AnimatePresence>

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
        message={
          users.find((u) => u.id === deleteId)?.isDeleted
            ? t("common:confirmation.hard_delete", { entity: t("users:entity") })
            : t("common:confirmation.delete", { entity: t("users:entity") })
        }
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
        title={t("common:delete")}
        message={
          hasDeletedSelected
            ? t("common:batch_confirmation.hard_delete", { count: selectedIds.length, entities: t("users:entities") })
            : t("common:batch_confirmation.delete", { count: selectedIds.length, entities: t("users:entities") })
        }
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
         title={t("common:restore")}
         message={t("common:batch_confirmation.restore", { count: selectedIds.length, entities: t("users:entities") })}
         loading={loading}
         onConfirm={() => { void handleBatchRestore().then(() => { setShowBatchRestoreConfirm(false); }); }}
         onCancel={() => { setShowBatchRestoreConfirm(false); }}
      />

    </div>
  );
}
