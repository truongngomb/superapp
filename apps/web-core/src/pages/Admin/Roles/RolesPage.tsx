import { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { motion as framerMotion } from "framer-motion";
import {
  Plus,
  Shield,
  Search,
  RefreshCw,
  Loader2,
  Trash2,
  FileSpreadsheet,
  Edit2,
  RotateCcw,
  Copy
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  Input,
  ConfirmModal,
  SortPopup,
  Pagination,
  Toggle,
  ViewSwitcher,
  Checkbox,
  type ViewMode,
  DataTable,
  type Column,
  Badge,
} from "@/components/common";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import type { Role, SortColumn, CreateRoleInput, UpdateRoleInput, RoleListParams } from "@/types";
import { cn, getStorageItem, setStorageItem } from "@/utils";
import { STORAGE_KEYS } from "@/config";
import { useSort, useDebounce, useAuth, useResource, useExcelExport } from "@/hooks";
import { roleService } from "@/services";
import { RoleForm } from "./components/RoleForm";
import { RoleRow } from "./components/RoleRow";
import { RoleTableSkeleton } from "./components/RoleTableSkeleton";
import { RoleRowSkeleton } from "./components/RoleRowSkeleton";



export default function RolesPage() {
  const { t } = useTranslation(["roles", "common"]);
  const { checkPermission } = useAuth();
  
  // Permissions
  const canDelete = checkPermission('roles', 'delete');
  const canUpdate = checkPermission('roles', 'update');
  const canCreate = checkPermission('roles', 'create');
  const canSelect = canDelete || canUpdate;

  // Search & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [showArchived, setShowArchived] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { sortConfig, handleSort } = useSort("created", "desc", {
    storageKey: STORAGE_KEYS.ROLES_SORT as string,
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

  // Update params when filters change
  useEffect(() => {
    const params: RoleListParams = {
       search: debouncedSearchQuery || undefined,
       sort: sortConfig.field,
       order: sortConfig.order,
       page: 1,
       isDeleted: showArchived || undefined,
    };
    void fetchItems(params);
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
    const newName = `${role.name} (${t("common:copy", { defaultValue: "Copy" })})`;
    await handleCreate({
      name: newName,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
    });
  }, [t, handleCreate]);

  // Columns Configuration
  const columns: Column<Role>[] = useMemo(() => [
    {
      key: 'name',
      header: t('roles:form.name_label'),
      sortable: true,
      className: 'font-medium'
    },
    {
      key: 'description',
      header: t('roles:form.desc_label'),
      className: 'hidden md:table-cell text-muted-foreground',
      render: (item) => <span className="line-clamp-1">{item.description || '-'}</span>
    },
    {
      key: 'isActive',
      header: t('common:status'),
      sortable: true,
      className: 'w-32',
      render: (item) => item.isActive ? 
        <Badge variant="success" size="sm">{t('common:active')}</Badge> : 
        <Badge variant="danger" size="sm">{t('common:inactive')}</Badge>
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      align: 'right',
      className: 'w-32',
      render: (role) => (
        <div className="flex items-center justify-end gap-1">
          {!role.isDeleted && (
            <PermissionGuard resource="roles" action="update">
              <Button variant="ghost" size="sm" onClick={() => { setEditingRole(role); setShowForm(true); }} aria-label={t('common:edit')}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </PermissionGuard>
          )}
          {!role.isDeleted && (
             <PermissionGuard resource="roles" action="create">
               <Button variant="ghost" size="sm" onClick={() => { void onDuplicate(role); }} aria-label={t('common:duplicate')}>
                 <Copy className="w-4 h-4 text-blue-500" />
               </Button>
             </PermissionGuard>
          )}
          {role.isDeleted && (
            <PermissionGuard resource="roles" action="update">
              <Button variant="ghost" size="sm" onClick={() => { setRestoreId(role.id); }} aria-label={t('common:restore')}>
                <RotateCcw className="w-4 h-4 text-primary" />
              </Button>
            </PermissionGuard>
          )}
          <PermissionGuard resource="roles" action="delete">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => { setDeleteId(role.id); }}
               aria-label={t('common:delete')}
             >
               <Trash2 className={cn('w-4 h-4', role.isDeleted ? 'text-red-700' : 'text-red-500')} />
             </Button>
          </PermissionGuard>
        </div>
      )
    }
  ], [t, onDuplicate]);

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
             <button
              type="button"
              onClick={() => void handleExport()}
              disabled={exporting || roles.length === 0}
              className="p-2 rounded-lg hover:bg-[#217346]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               {exporting ? <Loader2 className="w-6 h-6 animate-spin text-[#217346]" /> : <FileSpreadsheet className="w-6 h-6 text-[#217346]" />}
             </button>
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

      {/* Batch Actions & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {roles.length > 0 && canSelect && (
             <div className="flex items-center p-3 bg-surface rounded-lg">
               <Checkbox
                 triState
                 checked={selectedIds.length === 0 ? false : selectedIds.length === roles.length ? true : "indeterminate"}
                 onChange={handleSelectAll}
                 label={t("common:select_all")}
                 hideLabelOnMobile
               />
             </div>
          )}
          <ViewSwitcher value={viewMode} onChange={handleViewModeChange} />
             <PermissionGuard resource="roles" action="manage">
            <Toggle
              checked={showArchived}
              onChange={(checked: boolean) => { setShowArchived(checked); setSelectedIds([]); }}
              label={t("common:show_archived", { defaultValue: "Show Archived" })}
              hideLabelOnMobile
            />
          </PermissionGuard>
        </div>
        
        {/* Batch Action Buttons */}
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
             <>
               {showArchived && (
                 <PermissionGuard resource="roles" action="update">
                   <Button variant="outline" size="sm" onClick={() => { setShowBatchRestoreConfirm(true); }}>
                     <RefreshCw className="w-4 h-4" /> {t("common:restore", { defaultValue: "Restore" })} ({selectedIds.length})
                   </Button>
                 </PermissionGuard>
               )}
               <PermissionGuard resource="roles" action="delete">
                 <Button variant="danger" size="sm" onClick={() => { setShowBatchDeleteConfirm(true); }}>
                   <Trash2 className="w-4 h-4" /> {t("common:delete_selected")} ({selectedIds.length})
                 </Button>
               </PermissionGuard>
               <PermissionGuard resource="roles" action="update">
                 {!hasDeletedSelected && (
                   <>
                     <Button variant="outline" size="sm" onClick={() => { setBatchStatusConfig({ isOpen: true, isActive: true }); }}>
                       {t("common:actions.activate")} ({selectedIds.length})
                     </Button>
                     <Button variant="outline" size="sm" onClick={() => { setBatchStatusConfig({ isOpen: true, isActive: false }); }}>
                       {t("common:actions.deactivate")} ({selectedIds.length})
                     </Button>
                   </>
                 )}
               </PermissionGuard>
             </>
          )}
          <p className="text-sm text-muted">{t("common:total_items", { count: total })}</p>
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
        {loading && roles.length === 0 ? (
           viewMode === 'table' ? (
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
            {viewMode === "table" ? (
               <DataTable
                 data={roles}
                 columns={columns}
                 keyExtractor={(item) => item.id}
                 selectedIds={canSelect ? selectedIds : undefined}
                 onSelectAll={canSelect ? handleSelectAll : undefined}
                 onSelectOne={canSelect ? handleSelectOne : undefined}
                 sortColumn={sortConfig.field}
                 sortDirection={sortConfig.order}
                 onSort={handleSort}
                 currentPage={queryParams.page}
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
        title={t("common:restore", { defaultValue: "Restore" })}
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
