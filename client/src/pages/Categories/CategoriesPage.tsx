import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { Plus, Folder, Search, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, Checkbox, Input, LoadingSpinner, ConfirmModal, SortBar, Pagination } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import type { Category, CategoryInput } from '@/types';
import { cn } from '@/utils';
import { useCategories, useSort, useDebounce } from '@/hooks';
import { CategoryForm } from './components/CategoryForm';
import { CategoryRow } from './components/CategoryRow';

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
 */
export default function CategoriesPage() {
  const { t } = useTranslation(['categories', 'common']);
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
    deleteCategory,
    deleteCategories
  } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400); // 400ms debounce
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  // Sorting state
  const { sortConfig, handleSort } = useSort('created', 'desc');

  // Sortable columns configuration
  const sortColumns: Array<{ field: string; label: string }> = [
    { field: 'name', label: t('common:name', 'Name') },
    { field: 'isActive', label: t('common:status', 'Status') },
    { field: 'created', label: t('common:created', 'Created') },
    { field: 'updated', label: t('common:updated', 'Updated') },
  ];

  useEffect(() => {
    const params = {
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: (sortConfig.order ?? 'desc'),
      page: 1
    };
    void fetchCategories(params);
  }, [fetchCategories, debouncedSearchQuery, sortConfig]);

  // No more frontend filtering and sorting if we use backend pagination
  const displayCategories = categories;

  // Handle form submit
  const handleSubmit = async (data: CategoryInput) => {
    let success = false;
    if (editingCategory) {
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

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayCategories.map(c => c.id));
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
    const success = await deleteCategories(selectedIds);
    if (success) {
      setSelectedIds([]);
      setShowBatchDeleteConfirm(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("categories:title")}
          </h1>
          <p className="text-muted mt-1">{t("categories:subtitle")}</p>
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
        <Button variant="outline" onClick={() => { void fetchCategories(); }}>
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {displayCategories.length > 0 && (
            <PermissionGuard resource="categories" action="delete">
              <Checkbox
                triState
                checked={
                  selectedIds.length === 0
                    ? false
                    : selectedIds.length === displayCategories.length
                      ? true
                      : 'indeterminate'
                }
                onChange={handleSelectAll}
                label={t('common:select_all')}
              />
            </PermissionGuard>
          )}
          <SortBar
            columns={sortColumns}
            currentSort={sortConfig}
            onSort={handleSort}
          />
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <PermissionGuard resource="categories" action="delete">
              <Button
                variant="danger"
                size="sm"
                onClick={() => { setShowBatchDeleteConfirm(true); }}
              >
                <Trash2 className="w-4 h-4" />
                {t('common:delete_selected')} ({selectedIds.length})
              </Button>
            </PermissionGuard>
          )}
          <p className="text-sm text-muted">
            {t('common:total_items', { count: pagination.total })}
          </p>
        </div>
      </div>

      {/* Categories list */}
      {loading ? (
        <LoadingSpinner
          size="lg"
          text={t("common:loading")}
          className="py-20"
        />
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
          {displayCategories.map((category, index) => (
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
              }}
              isSelected={selectedIds.includes(category.id)}
              onSelect={handleSelectOne}
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
                onPageChange={(page) => { void fetchCategories({ page }); }}
              />
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <CategoryForm
            isOpen={showForm}
            category={editingCategory}
            onSubmit={(data) => { void handleSubmit(data); }}
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
        message={t("categories:delete_confirm")}
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

      {/* Batch Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showBatchDeleteConfirm}
        title={t('common:delete')}
        message={t('categories:batch_delete_confirm', { count: selectedIds.length })}
        confirmText={t('common:delete')}
        cancelText={t('common:cancel')}
        loading={batchDeleting}
        onConfirm={() => { void handleBatchDelete(); }}
        onCancel={() => { setShowBatchDeleteConfirm(false); }}
        variant="danger"
      />
    </div>
  );
}
