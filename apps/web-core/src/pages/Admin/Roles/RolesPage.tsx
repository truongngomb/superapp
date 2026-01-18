import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion as framerMotion } from "framer-motion";
import {
  Plus,
  Shield,
  Loader2,
  FileSpreadsheet,

} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  ConfirmModal,
  Pagination,
  type ViewMode,

  ResourceToolbar,
  BatchActionButtons,
  SearchFilterBar
} from "@/components/common";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import type { Role, SortColumn, CreateRoleInput, UpdateRoleInput, RoleListParams } from "@superapp/shared-types";
import { getStorageItem, setStorageItem } from "@/utils";
import { STORAGE_KEYS } from "@/config";
import { useSort, useDebounce, useAuth, useResource, useExcelExport, useResponsiveView, useInfiniteResource } from "@/hooks";
import { roleService } from "@/services";
import { RoleForm } from "./components/RoleForm";
import { RoleRow } from "./components/RoleRow";
import { RoleTable } from "./components/RoleTable";
import { RoleTableSkeleton } from "./components/RoleTableSkeleton";
import { RoleRowSkeleton } from "./components/RoleRowSkeleton";
import { RoleMobileList } from "./components/RoleMobileList";
import { RoleMobileCardSkeletonList } from "./components/RoleMobileCardSkeleton";



import { useSearchParams } from "react-router-dom";

export default function RolesPage() {
  const { t } = useTranslation(["roles", "common"]);
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
      { key: "isActive", header: t("common:status"), width: 15 },
      { key: "created", header: t("common:created"), width: 20 },
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
    const newName = `${role.name} (${t("common:copy")})`;
    await handleCreate({
      name: newName,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
    });
  }, [t, handleCreate]);

  const sortColumns: SortColumn[] = [
    { field: "name", label: t("roles:form.name_label") },
    { field: "isActive", label: t("common:status") },
    { field: "created", label: t("common:created") },
    { field: "updated", label: t("common:updated") },
  ];

  const hasDeletedSelected = selectedIds.some(
    (id) => roles.find((r) => r.id === id)?.isDeleted
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("roles:title")}</h1>
            <p className="text-muted mt-1">{t("roles:subtitle")}</p>
          </div>
           <PermissionGuard resource="roles" action="view">
             <Button
              variant="ghost"
              onClick={() => void handleExport()}
              disabled={exporting || roles.length === 0}
              className="h-10 w-10 p-0 text-[#217346] hover:bg-[#217346]/10"
             >
               {exporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileSpreadsheet className="w-6 h-6" />}
             </Button>
           </PermissionGuard>
        </div>
        <PermissionGuard resource="roles" action="create">
          <Button onClick={() => { setEditingRole(null); setShowForm(true); }}>
            <Plus className="w-5 h-5" />
            {t("roles:create_btn")}
          </Button>
        </PermissionGuard>
      </div>

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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-[400px]"
        >
        { (loading && roles.length === 0) || isRefreshing ? (
           // Skeleton loading based on view mode
           effectiveView === 'mobile' ? (
             <RoleMobileCardSkeletonList count={5} />
           ) : viewMode === 'table' ? (
               <RoleTableSkeleton />
           ) : (
             <div className="space-y-0.5">
               {Array.from({ length: 5 }).map((_, i) => <RoleRowSkeleton key={i} />)}
             </div>
           )
        ) : roles.length === 0 ? (
           <Card className="py-12 text-center">
             <CardContent>
               <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
               <p className="text-muted">
                 {searchQuery ? t("common:list.empty_search", { entities: t("roles:entities") }) : t("common:list.empty", { entities: t("roles:entities") })}
               </p>
               {!searchQuery && canCreate && (
                 <Button onClick={() => { setShowForm(true); }} className="mt-4">
                   {t("common:list.add_first", { entity: t("roles:entity") })}
                 </Button>
               )}
             </CardContent>
           </Card>
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

      <ConfirmModal
        isOpen={!!deleteId}
        title={t("common:delete")}
        message={
           roles.find((c) => c.id === deleteId)?.isDeleted
             ? t("common:confirmation.hard_delete", { entity: t("roles:entity") })
             : t("common:confirmation.delete", { entity: t("roles:entity") })
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
        message={t("common:confirmation.restore", { entity: t("roles:entity") })}
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
            ? t("common:batch_confirmation.hard_delete", { count: selectedIds.length, entities: t("roles:entities") })
            : t("common:batch_confirmation.delete", { count: selectedIds.length, entities: t("roles:entities") })
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
          entities: t("roles:entities"),
          action: batchStatusConfig?.isActive ? t("common:actions.activate") : t("common:actions.deactivate"),
        })}
        loading={loading}
        onConfirm={() => { if (batchStatusConfig) void handleBatchUpdateStatus(batchStatusConfig.isActive).then(() => { setBatchStatusConfig(null); }); }}
        onCancel={() => { setBatchStatusConfig(null); }}
      />

       <ConfirmModal
         isOpen={showBatchRestoreConfirm}
         title={t("common:restore")}
         message={t("common:batch_confirmation.restore", { count: selectedIds.length, entities: t("roles:entities") })}
         loading={loading}
         onConfirm={() => { void handleBatchRestore().then(() => { setShowBatchRestoreConfirm(false); }); }}
         onCancel={() => { setShowBatchRestoreConfirm(false); }}
      />

    </div>
  );
}
