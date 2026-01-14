import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion as framerMotion } from "framer-motion";
import {
  Plus,
  Folder,
  Edit2,
  Copy,
  RotateCcw,
  Trash2,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
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
  ResourceToolbar,
  BatchActionButtons,
  SearchFilterBar
} from "@/components/common";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import type { Category, CreateCategoryInput, SortColumn, CategoryListParams } from "@superapp/shared-types";
import { cn, getStorageItem, setStorageItem } from "@/utils";
import { STORAGE_KEYS } from "@/config";
import { useResource, useSort, useDebounce, useAuth, useExcelExport } from "@/hooks";


import { categoryService } from "@/services";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryRow } from "./components/CategoryRow";
import { CategorySkeleton } from "./components/CategorySkeleton";
import { CategoryTableSkeleton } from "./components/CategoryTableSkeleton";
import { CATEGORY_ICONS, type CategoryIcon } from './components/icons';

// Define Resource Types
export default function CategoriesPage() {
  const { t } = useTranslation(["categories", "common"]);
  
  // Setup Search
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery);

  // Setup Sort
  const { sortConfig, handleSort } = useSort("created", "desc", {
    storageKey: STORAGE_KEYS.CATEGORIES_SORT as string,
  }) as { sortConfig: { field: string; order: 'asc' | 'desc' }; handleSort: (field: string) => void };

  // Setup View Mode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStorageItem<ViewMode>(STORAGE_KEYS.CATEGORIES_VIEW_MODE as string) || "list";
  });
  
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.CATEGORIES_VIEW_MODE as string, mode);
  };

  const [showArchived, setShowArchived] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use Generic Hook
  const {
    items: categories,
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
  } = useResource<Category, CreateCategoryInput, CreateCategoryInput, CategoryListParams>({
    service: categoryService,
    resourceName: 'categories',
    initialParams: {
       page: 1,
       limit: 10,
       sort: sortConfig.field,
       order: sortConfig.order
    }
  });

  // Permissions
  const { checkPermission } = useAuth();
  const canDelete = checkPermission('categories', 'delete');
  const canUpdate = checkPermission('categories', 'update');
  const canSelect = canDelete || canUpdate;
  const canCreate = checkPermission('categories', 'create');

  // UI State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchRestoreConfirm, setShowBatchRestoreConfirm] = useState(false);
  const [batchStatusConfig, setBatchStatusConfig] = useState<{
    isOpen: boolean;
    isActive: boolean;
  } | null>(null);

  // Update params when filters change (including initial load)
  useEffect(() => {
    const params: CategoryListParams = {
       search: debouncedSearchQuery || undefined,
       sort: sortConfig.field,
       order: sortConfig.order,
       page: 1, // Reset to page 1 on filter change
       isDeleted: showArchived || undefined,
    };
    void fetchItems(params);
  }, [debouncedSearchQuery, sortConfig, showArchived, fetchItems]); 
  
  // Excel Export
  const { exportToExcel } = useExcelExport<Category>({
    fileNamePrefix: "categories",
    sheetName: t("categories:title"),
    columns: [
      { key: "#", header: t("common:order", { defaultValue: "#" }), width: 8 },
      { key: "name", header: t("common:name"), width: 25 },
      { key: "description", header: t("categories:form.desc_label"), width: 40 },
      { key: "color", header: t("categories:form.color_label"), width: 15 },
      { key: "icon", header: "Icon", width: 15 },
      { key: "isActive", header: t("common:status"), width: 12 },
    ],
  }) as { exportToExcel: (data: Category[]) => Promise<void> };

  const handleExport = async () => {
    const allData = await getAllForExport({
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order,
      isDeleted: showArchived || undefined,
    });
    await exportToExcel(allData);
  };

  // Actions Endpoints
  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  }, []);

  const onDuplicate = useCallback((category: Category) => {
    const suffix = t("categories:form.copy_suffix");
    const duplicated: Category = {
      ...category,
      id: "",
      name: `${category.name}${typeof suffix === "string" ? suffix : ""}`,
      isActive: true,
    };
    setEditingCategory(duplicated);
    setShowForm(true);
  }, [t]);

  // Columns Configuration for DataTable
  const columns: Column<Category>[] = useMemo(() => [
    {
      key: 'icon',
      header: '',
      className: 'w-12 px-4',
      render: (item) => {
        const IconComponent = (CATEGORY_ICONS[item.icon] || CATEGORY_ICONS.folder) as CategoryIcon;
        return (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: item.color + '20' }}
          >
            <IconComponent className="w-4 h-4" style={{ color: item.color }} />
          </div>
        );
      }
    },
    {
      key: 'name',
      header: t('common:name'),
      sortable: true,
      className: 'font-medium'
    },
    {
      key: 'description',
      header: t('categories:form.desc_label'),
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
      render: (category) => (
        <div className="flex items-center justify-end gap-1">
          {!category.isDeleted && (
            <PermissionGuard resource="categories" action="update">
              <Button variant="ghost" size="sm" onClick={() => { handleEdit(category); }} aria-label={t('common:edit')}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </PermissionGuard>
          )}
          {!category.isDeleted && (
             <PermissionGuard resource="categories" action="create">
               <Button variant="ghost" size="sm" onClick={() => { onDuplicate(category); }} aria-label={t('common:duplicate')}>
                 <Copy className="w-4 h-4 text-blue-500" />
               </Button>
             </PermissionGuard>
          )}
          {category.isDeleted && (
            <PermissionGuard resource="categories" action="update">
              <Button variant="ghost" size="sm" onClick={() => { setRestoreId(category.id); }} aria-label={t('common:restore')}>
                <RotateCcw className="w-4 h-4 text-primary" />
              </Button>
            </PermissionGuard>
          )}
          <PermissionGuard resource="categories" action="delete">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => { setDeleteId(category.id); }}
               aria-label={t('common:delete')}
             >
               <Trash2 className={cn('w-4 h-4', category.isDeleted ? 'text-red-700' : 'text-red-500')} />
             </Button>
          </PermissionGuard>
        </div>
      )
    }
  ], [t, handleEdit, onDuplicate]);

  const sortColumns: SortColumn[] = [
    { field: "name", label: t("common:name") },
    { field: "isActive", label: t("common:status") },
    { field: "created", label: t("common:created") },
    { field: "updated", label: t("common:updated") },
  ];

  const hasDeletedSelected = selectedIds.some(
    (id) => categories.find((c) => c.id === id)?.isDeleted
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("categories:title")}</h1>
            <p className="text-muted mt-1">{t("categories:subtitle")}</p>
          </div>
           <PermissionGuard resource="categories" action="view">
             <button
              type="button"
              onClick={() => void handleExport()}
              disabled={exporting || categories.length === 0}
              className="p-2 rounded-lg hover:bg-[#217346]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               {exporting ? <Loader2 className="w-6 h-6 animate-spin text-[#217346]" /> : <FileSpreadsheet className="w-6 h-6 text-[#217346]" />}
             </button>
           </PermissionGuard>
        </div>
        <PermissionGuard resource="categories" action="create">
          <Button onClick={() => { setShowForm(true); }}>
            <Plus className="w-5 h-5" />
            {t("categories:create_btn")}
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
        resource="categories"
        itemCount={categories.length}
        totalItems={total}
        canSelect={canSelect}
        selectedCount={selectedIds.length}
        totalListItems={categories.length}
        onSelectAll={handleSelectAll}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showArchived={showArchived}
        onShowArchivedChange={(checked) => { setShowArchived(checked); setSelectedIds([]); }}
        batchActions={
          <BatchActionButtons
            resource="categories"
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
          key={loading && categories.length === 0 ? "loading" : categories.length === 0 ? "empty" : "content"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-[400px]"
        >
        {loading && categories.length === 0 ? (
           viewMode === 'table' ? (
              // Using helper or specialized skeleton if needed, otherwise Generic Skeleton works 
              // but we don't have DataTableSkeleton yet potentially matching columns perfectly without config
              // reusing CategoryTableSkeleton for now as it matches layout close enough or manual mapping
                <CategoryTableSkeleton />
           ) : (
             <div className="space-y-0.5">
               {Array.from({ length: 5 }).map((_, i) => <CategorySkeleton key={i} />)}
             </div>
           )
        ) : categories.length === 0 ? (
           <Card className="py-12 text-center">
             <CardContent>
               <Folder className="w-12 h-12 text-muted mx-auto mb-4" />
               <p className="text-muted">
                 {searchQuery ? t("common:list.empty_search", { entities: t("categories:entities") }) : t("common:list.empty", { entities: t("categories:entities") })}
               </p>
               {!searchQuery && canCreate && (
                 <Button onClick={() => { setShowForm(true); }} className="mt-4">
                   {t("common:list.add_first", { entity: t("categories:entity") })}
                 </Button>
               )}
             </CardContent>
           </Card>
        ) : (
          <div className="space-y-2">
            {viewMode === "table" ? (
               <DataTable
                 data={categories}
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
               categories.map((category, index) => (
                 <CategoryRow
                    key={category.id}
                    index={index}
                    style={{}}
                    data={{
                      categories,
                       onEdit: (category) => { handleEdit(category); },
                       onDelete: (id) => { setDeleteId(id); },
                       onRestore: (id) => { setRestoreId(id); },
                       onDuplicate: (category) => { onDuplicate(category); }
                    }}
                    isSelected={selectedIds.includes(category.id)}
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
          <CategoryForm
            isOpen={showForm}
            category={editingCategory}
            onSubmit={(data) => {
               const submitHandler = async () => {
                 const success = editingCategory?.id 
                   ? await handleUpdate(editingCategory.id, data) 
                   : await handleCreate(data);
                 if (success) {
                   setShowForm(false);
                   setEditingCategory(null);
                 }
               };
               void submitHandler();
            }}
            onClose={() => { setShowForm(false); setEditingCategory(null); }}
            loading={loading} // useResource loading covers create/update too
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        title={t("common:delete")}
        message={
           categories.find((c) => c.id === deleteId)?.isDeleted
             ? t("common:confirmation.hard_delete", { entity: t("categories:entity") })
             : t("common:confirmation.delete", { entity: t("categories:entity") })
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
        message={t("common:confirmation.restore", { entity: t("categories:entity") })}
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
            ? t("common:batch_confirmation.hard_delete", { count: selectedIds.length, entities: t("categories:entities") })
            : t("common:batch_confirmation.delete", { count: selectedIds.length, entities: t("categories:entities") })
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
          entities: t("categories:entities"),
          action: batchStatusConfig?.isActive ? t("common:actions.activate") : t("common:actions.deactivate"),
        })}
        loading={loading}
        onConfirm={() => { if (batchStatusConfig) void handleBatchUpdateStatus(batchStatusConfig.isActive).then(() => { setBatchStatusConfig(null); }); }}
        onCancel={() => { setBatchStatusConfig(null); }}
      />

       <ConfirmModal
         isOpen={showBatchRestoreConfirm}
         title={t("common:restore")}
         message={t("common:batch_confirmation.restore", { count: selectedIds.length, entities: t("categories:entities") })}
         loading={loading}
         onConfirm={() => { void handleBatchRestore().then(() => { setShowBatchRestoreConfirm(false); }); }}
         onCancel={() => { setShowBatchRestoreConfirm(false); }}
      />

    </div>
  );
}
