import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryClient';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';
import { 
  Users, 
  Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  Pagination,
  ResourceToolbar,
  BatchActionButtons,
  SearchFilterBar,
  PageHeader,
  ResourceConfirmModals,
  ResourceCardSkeletonList,
  EmptyState,
} from '@/components/common';
import { useSort, useDebounce, useAuth, useResource, useExcelExport, useResponsiveView, useInfiniteResource } from '@/hooks';
import type { User, SortColumn, UserCreateInput, UserListParams, UserUpdateInput, ViewMode } from '@superapp/shared-types';
import { getStorageItem, setStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/config';

import { UserRow } from './components/UserRow';
import { UserTable } from './components/UserTable';
import { UserForm } from './components/UserForm';
import { RoleSelectModal } from '@/pages/Admin/Roles/components/RoleSelectModal';
import { userService, roleService } from '@/services';
import { UserTableSkeleton } from './components/UserTableSkeleton';
import { UserRowSkeleton } from './components/UserRowSkeleton';
import { UserMobileList } from './components/UserMobileList';

/**
 * UsersPage Component
 */
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@superapp/core-logic';

export default function UsersPage() {
  const { t } = useTranslation(['users', 'uikit']);
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
  const { data: rolesResponse } = useQuery({
    queryKey: queryKeys.roles.list({ page: 1, limit: 100, isDeleted: false }),
    queryFn: () => roleService.getPage({ page: 1, limit: 100, isDeleted: false }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const roles = rolesResponse?.items || [];


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
    },
    onSuccess: (action, count) => {
      const entity = t('users:entity');
      const entities = t('users:entities');

      switch (action) {
        case 'create':
          success(t('uikit:toast.create_success', { entity }));
          break;
        case 'update':
          success(t('uikit:toast.update_success', { entity }));
          break;
        case 'delete': {
          const isHardDelete = users.find(u => u.id === deleteId)?.isDeleted;
          success(t(isHardDelete ? 'uikit:toast.hard_delete_success' : 'uikit:toast.delete_success', { entity }));
          break;
        }
        case 'restore':
          success(t('uikit:toast.restore_success', { entity }));
          break;
        case 'batch_delete': {
          const isBatchHardDelete = selectedIds.some(id => users.find(u => u.id === id)?.isDeleted);
          success(t(isBatchHardDelete ? 'uikit:toast.batch_hard_delete_success' : 'uikit:toast.batch_delete_success', { count, entities }));
          break;
        }
        case 'batch_restore':
          success(t('uikit:toast.batch_restore_success', { count, entities }));
          break;
        case 'batch_status':
          success(t('uikit:toast.batch_status_success', { count, entities }));
          break;
      }
    },
    onError: (action, error) => {
      const message = error instanceof Error ? error.message : t('uikit:toast.error');
      const actionLabel = t(`uikit:${action}`, { defaultValue: action });
      errorToast(`${actionLabel}: ${message}`);
    }
  });

  // Responsive View - auto-switch to mobile view on small screens
  const { effectiveView, isMobile } = useResponsiveView(viewMode);

  // Infinite scroll for mobile
  const infiniteProps = {
    items: users,
    total,
    queryParams,
    fetchItems,
    isLoadingMore,
  };
  
  const {
    allItems: mobileUsers,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteResource({
    resourceHook: infiniteProps,
    enabled: isMobile,
    pageSize: 10,
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
      { key: '#', header: t('uikit:order'), width: 8 },
      { key: 'name', header: t('uikit:name'), width: 25 },
      { key: 'email', header: t('uikit:email'), width: 30 },
      { key: 'roleNames', header: t('users:form.role_label'), width: 20 },
      { key: 'isActive', header: t('uikit:status'), width: 12 },
      { key: 'created', header: t('uikit:created'), width: 15 },
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





  const sortColumns: SortColumn[] = [
    { field: 'name', label: t('uikit:name') },
    { field: 'email', label: t('uikit:email') },
    { field: 'isActive', label: t('uikit:status') },
    { field: 'created', label: t('uikit:created') },
    { field: 'updated', label: t('uikit:updated') },
  ];

  const hasDeletedSelected = selectedIds.some(
    id => users.find(u => u.id === id)?.isDeleted
  );

  return (
    <div>
      {/* Header */}
      <PageHeader
        resource="users"
        titleKey="users:title"
        subtitleKey="users:subtitle"
        exporting={exporting}
        itemCount={users.length}
        onExport={() => { void handleExport(); }}
        onCreateClick={() => { setEditingUser(null); setShowForm(true); }}
        createButtonKey="users:create_btn"
      />

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
        itemCount={isMobile ? mobileUsers.length : users.length}
        totalItems={total}
        canSelect={canSelect}
        selectedCount={selectedIds.length}
        totalListItems={isMobile ? mobileUsers.length : users.length}
        onSelectAll={handleSelectAll}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showArchived={showArchived}
        onShowArchivedChange={(checked) => { setShowArchived(checked); setSelectedIds([]); }}
        isMobile={isMobile}
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
           // Skeleton loading based on view mode
           effectiveView === 'mobile' ? (
             <ResourceCardSkeletonList count={5} />
           ) : effectiveView === 'table' ? (
              <UserTableSkeleton />
           ) : (
              <div className="space-y-2">
                 {Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}
              </div>
           )
        ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchQuery ? t("uikit:list.empty_search", { entities: t("users:entities") }) : t("uikit:list.empty", { entities: t("users:entities") })}
              actionText={!searchQuery && canCreate ? t("uikit:list.add_first", { entity: t("users:entity") }) : undefined}
              onAction={() => { setEditingUser(null); setShowForm(true); }}
              className="py-12"
            />
        ) : (
           <div className="space-y-2">
             {/* Mobile View with Infinite Scroll */}
             {effectiveView === 'mobile' ? (
               <UserMobileList
                 users={mobileUsers}
                 roles={roles}
                 hasNextPage={hasNextPage}
                 isFetchingNextPage={isFetchingNextPage}
                 fetchNextPage={fetchNextPage}
                 isLoading={loading}
                 selectedIds={canSelect ? selectedIds : []}
                 onSelect={canSelect ? handleSelectOne : undefined}
                 onEdit={(u) => { setEditingUser(u); setShowForm(true); }}
                 onAssignRole={(u) => { setAssigningUser(u); }}
                 onDelete={(id) => { setDeleteId(id); }}
                 onRestore={(id) => { setRestoreId(id); }}
               />
             ) : effectiveView === 'table' ? (
                <UserTable
                  data={users}
                  loading={loading}
                  selectedIds={canSelect ? selectedIds : []}
                  onSelectAll={handleSelectAll}
                  onSelect={handleSelectOne}
                  sort={sortConfig}
                  onSort={handleSort}
                  onEdit={(u) => { setEditingUser(u); setShowForm(true); }}
                  onAssignRole={(u) => { setAssigningUser(u); }}
                  onDelete={(id) => { setDeleteId(id); }}
                  onRestore={(id) => { setRestoreId(id); }}
                  currentPage={queryParams.page}
                  canSelect={canSelect}
                  roles={roles}
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

             {/* Pagination - Hide on mobile */}
             {!isMobile && Math.ceil(total / (queryParams.limit || 10)) > 1 && (
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

      <ResourceConfirmModals
        resourceName="users"
        entityKey="entity"
        entitiesKey="entities"
        deleteId={deleteId}
        isDeleted={users.find((u) => u.id === deleteId)?.isDeleted}
        onDeleteCancel={() => { setDeleteId(null); }}
        onDeleteConfirm={() => { if (deleteId) void handleDelete(deleteId).then(() => { setDeleteId(null); }); }}
        restoreId={restoreId}
        onRestoreCancel={() => { setRestoreId(null); }}
        onRestoreConfirm={() => { if (restoreId) void handleRestore(restoreId).then(() => { setRestoreId(null); }); }}
        showBatchDelete={showBatchDeleteConfirm}
        selectedCount={selectedIds.length}
        hasArchivedSelected={hasDeletedSelected}
        onBatchDeleteCancel={() => { setShowBatchDeleteConfirm(false); }}
        onBatchDeleteConfirm={() => { void handleBatchDelete().then(() => { setShowBatchDeleteConfirm(false); }); }}
        showBatchRestore={showBatchRestoreConfirm}
        onBatchRestoreCancel={() => { setShowBatchRestoreConfirm(false); }}
        onBatchRestoreConfirm={() => { void handleBatchRestore().then(() => { setShowBatchRestoreConfirm(false); }); }}
        batchStatusConfig={batchStatusConfig}
        onBatchStatusCancel={() => { setBatchStatusConfig(null); }}
        onBatchStatusConfirm={(isActive) => { void handleBatchUpdateStatus(isActive).then(() => { setBatchStatusConfig(null); }); }}
        loading={loading}
      />
    </div>
  );
}
