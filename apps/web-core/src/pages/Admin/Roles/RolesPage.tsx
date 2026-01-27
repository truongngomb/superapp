import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion as framerMotion } from "framer-motion";
import {
  Shield,
  Loader2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Pagination,
  ResourceToolbar,
  BatchActionButtons,
  SearchFilterBar,  
  PageHeader,
  ResourceConfirmModals,
  ResourceCardSkeletonList,
  EmptyState,
  fadeSlideUp,
  defaultTransition,
} from "@superapp/ui-kit";
import type { Role, SortColumn, CreateRoleInput, UpdateRoleInput, RoleListParams } from "@superapp/shared-types";
import { ViewMode } from "@superapp/shared-types";
import { getStorageItem, setStorageItem } from "@/utils";
import { STORAGE_KEYS } from "@/config";
import { 
  useResource, 
  useSort, 
  useDebounce, 
  useResponsiveView, 
  useExcelExport,
  useInfiniteResource,
  useAuth
} from "@superapp/core-logic";
import { useToast } from "@superapp/ui-kit";
import { roleService } from "@superapp/core-logic";

import { RoleForm } from "./components/RoleForm";
import { RoleRow } from "./components/RoleRow";
import { RoleTable } from "./components/RoleTable";
import { RoleTableSkeleton } from "./components/RoleTableSkeleton";
import { RoleRowSkeleton } from "./components/RoleRowSkeleton";
import { RoleMobileList } from "./components/RoleMobileList";


import { useSearchParams } from "react-router-dom";

export default function RolesPage() {
  const { t } = useTranslation(["roles", "uikit"]);
  const toast = useToast();
  const { checkPermission } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Permissions
  const canDelete = checkPermission('roles', 'delete');
  const canUpdate = checkPermission('roles', 'update');
  const canCreate = checkPermission('roles', 'create');
  const canSelect = canDelete || canUpdate;

  // Search & Sort
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [showArchived, setShowArchived] = useState(searchParams.get("isDeleted") === "true");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const urlSort = searchParams.get("sort");
  const urlOrder = searchParams.get("order");

  const { sortConfig, handleSort } = useSort("created", "desc", {
    storageKey: STORAGE_KEYS.ROLES_SORT as string,
    initialOverride: (urlSort && (urlOrder === 'asc' || urlOrder === 'desc')) ? { field: urlSort, order: urlOrder } : undefined
  }) as { sortConfig: { field: string; order: 'asc' | 'desc' }; handleSort: (field: string) => void };

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStorageItem<ViewMode>(STORAGE_KEYS.ROLES_VIEW_MODE as string) || "list";
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.ROLES_VIEW_MODE as string, mode);
  };

  // Resource Management
  const {
    items: roles,
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
  } = useResource<Role, CreateRoleInput, UpdateRoleInput, RoleListParams>({
    service: roleService,
    resourceName: 'roles',
    initialParams: {
       page: 1,
       limit: 10,
       sort: sortConfig.field,
       order: sortConfig.order
    },
    onSuccess: (action, count) => {
      const entity = t('roles:entity');
      const entities = t('roles:entities');

      switch (action) {
        case 'create':
          toast.success(t('uikit:toast.create_success', { entity }));
          break;
        case 'update':
          toast.success(t('uikit:toast.update_success', { entity }));
          break;
        case 'delete': {
          const isHardDelete = roles.find(r => r.id === deleteId)?.isDeleted;
          toast.success(t(isHardDelete ? 'uikit:toast.hard_delete_success' : 'uikit:toast.delete_success', { entity }));
          break;
        }
        case 'restore':
          toast.success(t('uikit:toast.restore_success', { entity }));
          break;
        case 'batch_delete': {
          const isBatchHardDelete = selectedIds.some(id => roles.find(r => r.id === id)?.isDeleted);
          toast.success(t(isBatchHardDelete ? 'uikit:toast.batch_hard_delete_success' : 'uikit:toast.batch_delete_success', { count, entities }));
          break;
        }
        case 'batch_restore':
          toast.success(t('uikit:toast.batch_restore_success', { count, entities }));
          break;
        case 'batch_status':
          toast.success(t('uikit:toast.batch_status_success', { count, entities }));
          break;
      }
    },
    onError: (action, error) => {
      const message = error instanceof Error ? error.message : t('uikit:toast.error');
      const actionLabel = t(`uikit:${action}`);
      toast.error(`${actionLabel}: ${message}`);
    }
  });

  // Responsive View
  const { effectiveView, isMobile } = useResponsiveView(viewMode);

  // Infinite scroll for mobile
  const infiniteProps = {
    items: roles,
    total,
    queryParams,
    fetchItems,
    isLoadingMore,
    };
    
  const {
    allItems: mobileRoles,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteResource({
    resourceHook: infiniteProps,
    enabled: isMobile,
    pageSize: 10,
  });

  // UI State
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
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
    void fetchItems(); // Initial load from URL
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

      const params: RoleListParams = {
         search: debouncedSearchQuery || undefined,
         sort: sortConfig.field,
         order: sortConfig.order,
         page: 1, // Reset page on filter change
         isDeleted: showArchived || undefined,
      };
      void fetchItems(params);
    }
  }, [debouncedSearchQuery, sortConfig, showArchived, fetchItems]); 

  // Excel Export
  const { exportToExcel } = useExcelExport<Role>({
    fileNamePrefix: "roles",
    sheetName: t("roles:title"),
    columns: [
      { key: "name", header: t("roles:form.name_label"), width: 30 },
      { key: "description", header: t("roles:form.desc_label"), width: 40 },
      { key: "isActive", header: t("uikit:status"), width: 15 },
      { key: "created", header: t("uikit:created"), width: 20 },
    ],
  }) as { exportToExcel: (data: Role[]) => Promise<void> };

  const handleExport = async () => {
    const allData = await getAllForExport({
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order,
      isDeleted: showArchived || undefined,
    });
    await exportToExcel(allData);
  };

  // Actions
  const onDuplicate = useCallback(async (role: Role) => {
    const newName = `${role.name} (${t("uikit:copy")})`;
    await handleCreate({
      name: newName,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
    });
  }, [t, handleCreate]);

  const sortColumns: SortColumn[] = [
    { field: "name", label: t("roles:form.name_label") },
    { field: "isActive", label: t("uikit:status") },
    { field: "created", label: t("uikit:created") },
    { field: "updated", label: t("uikit:updated") },
  ];

  const hasDeletedSelected = selectedIds.some(
    (id) => roles.find((r) => r.id === id)?.isDeleted
  );

  return (
    <div>
      {/* Header */}
      <PageHeader
        resource="roles"
        titleKey="roles:title"
        subtitleKey="roles:subtitle"
        exporting={exporting}
        itemCount={roles.length}
        onExport={() => { void handleExport(); }}
        onCreateClick={() => { setEditingRole(null); setShowForm(true); }}
        createButtonKey="roles:create_btn"
      />

      {/* Toolbar */}
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
        resource="roles"
        itemCount={isMobile ? mobileRoles.length : roles.length}
        totalItems={total}
        canSelect={canSelect}
        selectedCount={selectedIds.length}
        totalListItems={isMobile ? mobileRoles.length : roles.length}
        onSelectAll={handleSelectAll}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showArchived={showArchived}
        onShowArchivedChange={(checked) => { setShowArchived(checked); setSelectedIds([]); }}
        isMobile={isMobile}
        batchActions={
          <BatchActionButtons
            resource="roles"
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
          key={loading && roles.length === 0 ? "loading" : roles.length === 0 ? "empty" : "content"}
          variants={fadeSlideUp} initial="initial" animate="animate" exit="exit" transition={defaultTransition}
          className="min-h-[400px]"
        >
        { (loading && roles.length === 0) || isRefreshing ? (
           // Skeleton loading based on view mode
           effectiveView === 'mobile' ? (
             <ResourceCardSkeletonList count={5} />
           ) : viewMode === 'table' ? (
               <RoleTableSkeleton />
           ) : (
             <div className="space-y-0.5">
               {Array.from({ length: 5 }).map((_, i) => <RoleRowSkeleton key={i} />)}
             </div>
           )
        ) : roles.length === 0 ? (
            <EmptyState
              icon={Shield}
              title={searchQuery ? t("uikit:list.empty_search", { entities: t("roles:entities") }) : t("uikit:list.empty", { entities: t("roles:entities") })}
              actionText={!searchQuery && canCreate ? t("uikit:list.add_first", { entity: t("roles:entity") }) : undefined}
              onAction={() => { setEditingRole(null); setShowForm(true); }}
              className="py-12"
            />
        ) : (
           <div className="space-y-2">
             {/* Mobile View with Infinite Scroll */}
             {effectiveView === 'mobile' ? (
               <RoleMobileList
                 roles={mobileRoles}
                 hasNextPage={hasNextPage}
                 isFetchingNextPage={isFetchingNextPage}
                 fetchNextPage={fetchNextPage}
                 isLoading={loading}
                 selectedIds={canSelect ? selectedIds : []}
                 onSelect={canSelect ? handleSelectOne : undefined}
                 onEdit={(r) => { setEditingRole(r); setShowForm(true); }}
                 onDelete={(id) => { setDeleteId(id); }}
                 onRestore={(id) => { setRestoreId(id); }}
                 onDuplicate={(r) => { void onDuplicate(r); }}
               />
             ) : viewMode === "table" ? (
                <RoleTable
                  data={roles}
                  loading={loading}
                  selectedIds={canSelect ? selectedIds : []}
                  onSelectAll={handleSelectAll}
                  onSelect={handleSelectOne}
                  sort={sortConfig}
                  onSort={handleSort}
                  onEdit={(r) => { setEditingRole(r); setShowForm(true); }}
                  onDuplicate={(r) => {
                     // Handle Duplicate logic
                     // ...
                     setEditingRole({
                       ...r,
                       id: '',
                       name: `${r.name} (Copy)`,
                     });
                     setShowForm(true);
                  }}
                  onDelete={(id) => { setDeleteId(id); }}
                  onRestore={(id) => { setRestoreId(id); }}
                  currentPage={queryParams.page}
                  canSelect={canSelect}
                />
             ) : (
                roles.map((role, index) => (
                  <RoleRow
                     key={role.id}
                     index={index}
                     style={{}}
                     data={{
                       roles,
                        onEdit: (role) => { setEditingRole(role); setShowForm(true); },
                        onDelete: (id) => { setDeleteId(id); },
                        onRestore: (id) => { setRestoreId(id); },
                        onDuplicate: (role) => { void onDuplicate(role); }
                     }}
                     isSelected={selectedIds.includes(role.id)}
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
          <RoleForm
            isOpen={showForm}
            role={editingRole}
            onSubmit={(data) => {
               const submitHandler = async () => {
                 const success = editingRole?.id 
                   ? await handleUpdate(editingRole.id, data) 
                   : await handleCreate(data);
                 if (success) {
                   setShowForm(false);
                   setEditingRole(null);
                 }
               };
               void submitHandler();
            }}
            onClose={() => { setShowForm(false); setEditingRole(null); }}
            loading={loading}
          />
        )}
      </AnimatePresence>

      <ResourceConfirmModals
        resourceName="roles"
        entityKey="entity"
        entitiesKey="entities"
        deleteId={deleteId}
        isDeleted={roles.find((c) => c.id === deleteId)?.isDeleted}
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


