import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "framer-motion";
import {
  Plus,
  Folder,
  Search,
  RefreshCw,
  Loader2,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { motion as framerMotion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  ConfirmModal,
  SortPopup,
  Pagination,
  Toggle,
  ViewSwitcher,
  type ViewMode,
} from "@/components/common";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import type { Category, CreateCategoryInput, SortColumn } from "@/types";
import { cn, getStorageItem, setStorageItem } from "@/utils";
import { STORAGE_KEYS } from "@/config";
import { useCategories, useSort, useDebounce, useAuth } from "@/hooks";
import { useExcelExport } from "@/hooks/useExcelExport";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryRow } from "./components/CategoryRow";
import { CategoryTable } from "./components/CategoryTable";
import { CategorySkeleton } from "./components/CategorySkeleton";
import { CategoryTableSkeleton } from "./components/CategoryTableSkeleton";

/**
 * CategoriesPage Component
 *
 * Manages product categories including:
 * - Listing categories with virtualization
 * - Creating new categories
 * - Updating existing categories
 * - Deleting categories
 * - Searching/Filtering
 * - Sorting by columns
 * - Table/List view switching
 * - Excel export
 */
export default function CategoriesPage() {
  const { t } = useTranslation(["categories", "common"]);
  const {
    categories,
    pagination,
    loading,
    isLoadingMore,
    submitting,
    deleting,
    batchDeleting,
    fetchCategories,
    createCategory,
    updateCategory,
    restoreCategory,
    deleteCategory,
    deleteCategories,
    updateCategoriesStatus,
    restoreCategories,
    exporting,
    getAllForExport,
  } = useCategories();

  const { checkPermission } = useAuth();
  const canDelete = checkPermission('categories', 'delete');
  const canUpdate = checkPermission('categories', 'update');
  const canSelect = canDelete || canUpdate;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery); // uses default from config/env
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  // View mode state (persisted to localStorage)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (
      getStorageItem<ViewMode>(STORAGE_KEYS.CATEGORIES_VIEW_MODE) || "list"
    );
  });

  // Excel export hook
  const { exportToExcel } = useExcelExport<Category>({
    fileNamePrefix: "categories",
    sheetName: t("categories:title"),
    columns: [
      { key: "#", header: t("common:order", { defaultValue: "#" }), width: 8 },
      { key: "name", header: t("common:name"), width: 25 },
      {
        key: "description",
        header: t("categories:form.desc_label"),
        width: 40,
      },
      { key: "color", header: t("categories:form.color_label"), width: 15 },
      { key: "icon", header: "Icon", width: 15 },
      { key: "isActive", header: t("common:status"), width: 12 },
    ],
  });

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.CATEGORIES_VIEW_MODE, mode);
  };

  // Handle export
  const handleExport = async () => {
    // Fetch all data with current filters/sort via hook
    const allData = await getAllForExport({
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order ?? "desc",
      isDeleted: showArchived || undefined,
    });
    await exportToExcel(allData);
  };

  // Sorting state (persisted to localStorage)
  const { sortConfig, handleSort } = useSort("created", "desc", {
    storageKey: STORAGE_KEYS.CATEGORIES_SORT,
  });

  // Sortable columns configuration
  const sortColumns: SortColumn[] = [
    { field: "name", label: t("common:name", "Name") },
    { field: "isActive", label: t("common:status", "Status") },
    { field: "created", label: t("common:created", "Created") },
    { field: "updated", label: t("common:updated", "Updated") },
  ];

  useEffect(() => {
    const params = {
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order ?? "desc",
      page: 1,
      isDeleted: showArchived || undefined,
    };
    void fetchCategories(params);
  }, [fetchCategories, debouncedSearchQuery, sortConfig, showArchived]);

  // No more frontend filtering and sorting if we use backend pagination
  const displayCategories = categories;

  // Handle form submit
  const handleSubmit = async (data: CreateCategoryInput) => {
    let success = false;
    if (editingCategory?.id) {
      success = await updateCategory(editingCategory.id, data);
    } else {
      success = await createCategory(data);
    }

    if (success) {
      setShowForm(false);
      setEditingCategory(null);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const success = await deleteCategory(id);
    if (success) {
      setDeleteId(null);
    }
  };

  // Open edit form
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  // Handle duplicate
  const handleDuplicate = (category: Category) => {
    const suffix = t("categories:form.copy_suffix");
    const duplicated: Category = {
      ...category,
      id: "", // Will be generated by backend
      name: `${category.name}${typeof suffix === "string" ? suffix : ""}`,
      isActive: true, // Default to active for new items
    };
    setEditingCategory(duplicated);
    setShowForm(true);
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayCategories.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBatchDelete = async () => {
    const success = await deleteCategories(selectedIds);
    if (success) {
      setSelectedIds([]);
      setShowBatchDeleteConfirm(false);
    }
  };

  const handleBatchStatusUpdate = async (isActive: boolean) => {
    const success = await updateCategoriesStatus(selectedIds, isActive);
    if (success) {
      setSelectedIds([]);
      setBatchStatusConfig(null);
    }
  };

  const handleBatchRestore = async () => {
    const success = await restoreCategories(selectedIds);
    if (success) {
      setSelectedIds([]);
      setShowBatchRestoreConfirm(false);
    }
  };

  const hasDeletedSelected = selectedIds.some(
    (id) => displayCategories.find((c) => c.id === id)?.isDeleted
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("categories:title")}
            </h1>
            <p className="text-muted mt-1">{t("categories:subtitle")}</p>
          </div>
          <PermissionGuard resource="categories" action="view">
            <button
              type="button"
              onClick={() => {
                void handleExport();
              }}
              disabled={exporting || displayCategories.length === 0}
              className="p-2 rounded-lg hover:bg-[#217346]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={t("common:export", { defaultValue: "Export Excel" })}
              aria-label={t("common:export", { defaultValue: "Export Excel" })}
            >
              {exporting ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#217346]" />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-[#217346]" />
              )}
            </button>
          </PermissionGuard>
        </div>
        <PermissionGuard resource="categories" action="create">
          <Button
            onClick={() => {
              setShowForm(true);
            }}
          >
            <Plus className="w-5 h-5" />
            {t("categories:create_btn")}
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
            void fetchCategories().finally(() => { setIsRefreshing(false); });
          }}
        >
          <RefreshCw className={cn("w-5 h-5", (loading || isRefreshing) && "animate-spin")} />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {displayCategories.length > 0 && canSelect && (
            <div className="flex items-center p-3 bg-surface rounded-lg">
              <Checkbox
                triState
                checked={
                  selectedIds.length === 0
                    ? false
                    : selectedIds.length === displayCategories.length
                    ? true
                    : "indeterminate"
                }
                onChange={handleSelectAll}
                label={t("common:select_all")}
                hideLabelOnMobile
              />
            </div>
          )}
          <ViewSwitcher value={viewMode} onChange={handleViewModeChange} />
          <PermissionGuard resource="categories" action="manage">
            <Toggle
              checked={showArchived}
              onChange={(checked: boolean) => {
                setShowArchived(checked);
                setSelectedIds([]); // Clear selection when switching views
              }}
              label={t("common:show_archived", {
                defaultValue: "Show Archived",
              })}
              hideLabelOnMobile
            />
          </PermissionGuard>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && showArchived && (
            <PermissionGuard resource="categories" action="update">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowBatchRestoreConfirm(true);
                }}
              >
                <RefreshCw className="w-4 h-4" />
                {t("common:restore", { defaultValue: "Restore" })} (
                {selectedIds.length})
              </Button>
            </PermissionGuard>
          )}
          {selectedIds.length > 0 && (
            <PermissionGuard resource="categories" action="delete">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setShowBatchDeleteConfirm(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
                {t("common:delete_selected")} ({selectedIds.length})
              </Button>
            </PermissionGuard>
          )}
          {selectedIds.length > 0 && (
            <PermissionGuard resource="categories" action="update">
              {!hasDeletedSelected && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBatchStatusConfig({ isOpen: true, isActive: true });
                    }}
                  >
                    {t("activate_selected")} ({selectedIds.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBatchStatusConfig({ isOpen: true, isActive: false });
                    }}
                  >
                    {t("deactivate_selected")} ({selectedIds.length})
                  </Button>
                </>
              )}
            </PermissionGuard>
          )}
          <p className="text-sm text-muted">
            {t("common:total_items", { count: pagination.total })}
          </p>
        </div>
      </div>

      {/* Categories list */}
      <framerMotion.div
        key={loading ? "loading" : "content"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {(loading && categories.length === 0) || isRefreshing ? (
          viewMode === "table" ? (
            <CategoryTableSkeleton />
          ) : (
            <div className="space-y-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <CategorySkeleton key={i} />
              ))}
            </div>
          )
        ) : displayCategories.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Folder className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchQuery
                ? t("categories:list.empty_search")
                : t("categories:list.empty")}
            </p>
            {!searchQuery && (
              <PermissionGuard resource="categories" action="create">
                <Button
                  onClick={() => {
                    setShowForm(true);
                  }}
                  className="mt-4"
                >
                  {t("categories:list.add_first")}
                </Button>
              </PermissionGuard>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {viewMode === "table" ? (
            <Card>
              <CardContent className="p-0">
                <CategoryTable
                  categories={displayCategories}
                  selectedIds={canSelect ? selectedIds : []}
                  currentPage={pagination.page}
                  onSelectAll={canSelect ? handleSelectAll : undefined}
                  onSelectOne={canSelect ? handleSelectOne : undefined}
                  onEdit={handleEdit}
                  onDelete={(id) => {
                    setDeleteId(id);
                  }}
                  onRestore={(id) => {
                    setRestoreId(id);
                  }}
                  onDuplicate={handleDuplicate}
                />
              </CardContent>
            </Card>
          ) : (
            displayCategories.map((category, index) => (
              <CategoryRow
                key={category.id}
                index={index}
                style={{}}
                data={{
                  categories: displayCategories,
                  onEdit: handleEdit,
                  onDelete: (id) => {
                    setDeleteId(id);
                  },
                  onRestore: (id: string) => {
                    setRestoreId(id);
                  },
                  onDuplicate: handleDuplicate,
                }}
                isSelected={selectedIds.includes(category.id)}
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
                onPageChange={(page) => {
                  void fetchCategories({ page });
                }}
              />
            </div>
          )}
        </div>
      )}
      </framerMotion.div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <CategoryForm
            isOpen={showForm}
            category={editingCategory}
            onSubmit={(data) => {
              void handleSubmit(data);
            }}
            onClose={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
            loading={submitting}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title={t("common:delete")}
        message={
          displayCategories.find((c) => c.id === deleteId)?.isDeleted
            ? t("categories:hard_delete_confirm")
            : t("categories:delete_confirm")
        }
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
        title={t("common:restore", { defaultValue: "Restore" })}
        message={t("categories:restore_confirm", {
          defaultValue: "Are you sure you want to restore this category?",
        })}
        confirmText={t("common:confirm", { defaultValue: "Confirm" })}
        cancelText={t("common:cancel")}
        loading={submitting}
        onConfirm={() => {
          if (restoreId) {
            void restoreCategory(restoreId).then((success) => {
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
        title={t("common:delete")}
        message={
          hasDeletedSelected
            ? t("categories:batch_hard_delete_confirm", {
                count: selectedIds.length,
              })
            : t("categories:batch_delete_confirm", {
                count: selectedIds.length,
              })
        }
        confirmText={t("common:delete")}
        cancelText={t("common:cancel")}
        loading={batchDeleting}
        onConfirm={() => {
          void handleBatchDelete();
        }}
        onCancel={() => {
          setShowBatchDeleteConfirm(false);
        }}
        variant="danger"
      />

      {/* Batch Status Update Confirm Modal */}
      <ConfirmModal
        isOpen={!!batchStatusConfig?.isOpen}
        title={t("common:confirm")}
        message={t("batch_status_confirm", {
          count: selectedIds.length,
          action: batchStatusConfig?.isActive
            ? t("actions.activate")
            : t("actions.deactivate"),
        })}
        confirmText={t("common:confirm")}
        cancelText={t("common:cancel")}
        loading={submitting}
        onConfirm={() => {
          if (batchStatusConfig)
            void handleBatchStatusUpdate(batchStatusConfig.isActive);
        }}
        onCancel={() => {
          setBatchStatusConfig(null);
        }}
      />

      {/* Batch Restore Confirm Modal */}
      <ConfirmModal
        isOpen={showBatchRestoreConfirm}
        title={t("common:restore", { defaultValue: "Restore" })}
        message={t("categories:batch_restore_confirm", {
          count: selectedIds.length,
          defaultValue:
            "Are you sure you want to restore {{count}} categories?",
        })}
        confirmText={t("common:confirm")}
        cancelText={t("common:cancel")}
        loading={submitting}
        onConfirm={() => {
          void handleBatchRestore();
        }}
        onCancel={() => {
          setShowBatchRestoreConfirm(false);
        }}
      />
    </div>
  );
}
