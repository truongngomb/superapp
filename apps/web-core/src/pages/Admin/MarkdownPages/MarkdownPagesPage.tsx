import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  FileText,
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
  ResourceToolbar,
  BatchActionButtons,
  SearchFilterBar
} from "@/components/common";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { SortColumn } from "@superapp/shared-types";
import { getStorageItem, setStorageItem } from "@/utils";
import { STORAGE_KEYS } from "@/config";
import { 
  useSort, 
  useDebounce, 
  useMarkdownPages, 
  useResponsiveView, 
  useExcelExport 
} from "@/hooks";

import { MarkdownPageForm } from "./components/MarkdownPageForm";
import { MarkdownPageTable } from "./components/MarkdownPageTable";
import { MarkdownPageMobileCard } from "./components/MarkdownPageMobileCard";
import { MarkdownPage } from "@superapp/shared-types";

export default function MarkdownPagesPage() {
  const { t } = useTranslation(["markdown", "common"]);
  const [searchParams] = useSearchParams();
  
  // Setup Search
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearchQuery = useDebounce(searchQuery);

  // Setup Sort
  const { sortConfig, handleSort } = useSort("updated", "desc", {
    storageKey: STORAGE_KEYS.MARKDOWN_PAGES_SORT,
  });

  // Setup View Mode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return getStorageItem<ViewMode>(STORAGE_KEYS.MARKDOWN_PAGES_VIEW_MODE) || "list";
  });
  
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.MARKDOWN_PAGES_VIEW_MODE, mode);
  };

  const [showArchived, setShowArchived] = useState(searchParams.get("isDeleted") === "true");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use Markdown Hook
  const {
    pages,
    loading,
    pagination,
    fetchPages,
    deletePage,
    deletePages,
    restorePage,
    restorePages,
    updatePagesStatus,
    getAllPages
  } = useMarkdownPages();

  // Selected Items State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(pages.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  }, [pages]);

  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  }, []);

  // UI State
  const [editingPage, setEditingPage] = useState<MarkdownPage | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  
  // Batch Actions State
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchRestoreConfirm, setShowBatchRestoreConfirm] = useState(false);
  const [batchStatusConfig, setBatchStatusConfig] = useState<{
    isOpen: boolean;
    isActive: boolean;
  } | null>(null);

  // Fetch Data
  const fetchData = useCallback(async (page = 1) => {
    await fetchPages({
      page,
      limit: 10,
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order as 'asc' | 'desc',
      isDeleted: showArchived || undefined,
    });
  }, [debouncedSearchQuery, sortConfig, showArchived, fetchPages]);

  // Initial Load & Filter Changes
  useEffect(() => {
    void fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, sortConfig, showArchived]);

  // Handle Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData(pagination.page);
    setIsRefreshing(false);
  };

  // Responsive View
  const { effectiveView, isMobile } = useResponsiveView(viewMode);

  // Excel Export
  const { exportToExcel, exporting } = useExcelExport<MarkdownPage>({
    fileNamePrefix: "markdown-pages",
    sheetName: "Pages",
    columns: [
      { key: "title", header: t("form.title"), width: 30 },
      { key: "slug", header: t("form.slug"), width: 20 },
      { key: "isPublished", header: t("form.published"), width: 10 },
      { key: "updated", header: t("common:updated"), width: 15 },
    ],
  });

  const handleExport = async () => {
    const allData = await getAllPages();
    await exportToExcel(allData);
  };

  // Sort Columns
  const sortColumns: SortColumn[] = [
    { field: "title", label: t("form.title") },
    { field: "isPublished", label: t("form.published") },
    { field: "updated", label: t("common:updated") },
    { field: "created", label: t("common:created") },
  ];

  const hasDeletedSelected = useMemo(() => 
    selectedIds.some(id => pages.find(p => p.id === id)?.isDeleted),
  [selectedIds, pages]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted mt-1">{t("list_title")}</p>
          </div>
           <PermissionGuard resource="markdown_pages" action="view">
             <Button
              variant="ghost"
              onClick={() => void handleExport()}
              disabled={exporting || pages.length === 0}
              className="h-10 w-10 p-0 text-[#217346] hover:bg-[#217346]/10"
             >
               {exporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileSpreadsheet className="w-6 h-6" />}
             </Button>
           </PermissionGuard>
        </div>
        <PermissionGuard resource="markdown_pages" action="create">
          <Button onClick={() => { setEditingPage(undefined); setShowForm(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            {t("create_title")}
          </Button>
        </PermissionGuard>
      </div>

      {/* Search & Filter */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortColumns={sortColumns}
        sortConfig={sortConfig as { field: string; order: 'asc' | 'desc' }}
        onSort={handleSort}
        isRefreshing={isRefreshing}
        isLoading={loading}
        onRefresh={() => { void handleRefresh(); }}
      />

      {/* Toolbar */}
      <ResourceToolbar
        resource="markdown_pages"
        itemCount={pages.length}
        totalItems={pagination.total}
        canSelect={true}
        selectedCount={selectedIds.length}
        totalListItems={pages.length}
        onSelectAll={handleSelectAll}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showArchived={showArchived}
        onShowArchivedChange={(checked) => { setShowArchived(checked); setSelectedIds([]); }}
        isMobile={isMobile}
        batchActions={
          <BatchActionButtons
            resource="markdown_pages"
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
        <motion.div
           key={loading && pages.length === 0 ? "loading" : pages.length === 0 ? "empty" : "content"}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="flex-1 min-h-[400px]"
        >
          {(loading && pages.length === 0) || isRefreshing ? (
             <div className="flex justify-center items-center h-64">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : pages.length === 0 ? (
             <Card className="py-12 text-center h-full flex flex-col justify-center">
               <CardContent>
                 <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
                 <p className="text-muted">
                   {searchQuery ? t("common:list.empty_search", { entities: t("name") }) : t("common:list.empty", { entities: t("name") })}
                 </p>
               </CardContent>
             </Card>
          ) : effectiveView === 'mobile' ? (
             <div className="space-y-3">
               {pages.map(page => (
                 <MarkdownPageMobileCard
                   key={page.id}
                   page={page}
                   onEdit={(p) => { setEditingPage(p); setShowForm(true); }}
                   onDelete={(p) => { setDeleteId(p.id); }}
                   isSelected={selectedIds.includes(page.id)}
                   onSelect={() => { handleSelectOne(page.id); }}
                   onClick={() => { handleSelectOne(page.id); }}
                 />
               ))}
             </div>
          ) : (
             <MarkdownPageTable
               data={pages}
               loading={loading}
               selectedIds={selectedIds}
               sort={sortConfig}
               onSort={handleSort}
               onSelect={handleSelectOne}
               onSelectAll={handleSelectAll}
               onEdit={(p) => { setEditingPage(p); setShowForm(true); }}
               onDelete={(p) => { setDeleteId(p.id); }}
             />
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => { void fetchData(p); }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Form Modal */}
      {showForm && (
        <MarkdownPageForm
          open={showForm}
        onClose={() => { setShowForm(false); setEditingPage(undefined); void fetchData(pagination.page); }}
        initialData={editingPage}
      />
      )}

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={!!deleteId}
        title={t("common:delete")}
        message={t("common:confirmation.delete", { entity: t("name") })}
        confirmText={t("common:delete")}
        cancelText={t("common:cancel")}
        onConfirm={() => {
          if (deleteId) {
            void deletePage(deleteId).then(() => {
              setDeleteId(null);
            });
          }
        }}
        onCancel={() => { setDeleteId(null); }}
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!restoreId}
        title={t("common:restore")}
        message={t("common:confirmation.restore", { entity: t("name") })}
        onConfirm={() => {
          if (restoreId) {
            void restorePage(restoreId).then(() => {
              setRestoreId(null);
            });
          }
        }}
        onCancel={() => { setRestoreId(null); }}
      />

      <ConfirmModal
        isOpen={showBatchDeleteConfirm}
        title={t("common:delete")}
        message={t("common:batch_confirmation.delete", { count: selectedIds.length, entities: t("name") })}
        onConfirm={() => {
          void deletePages(selectedIds).then(() => {
            setShowBatchDeleteConfirm(false);
            setSelectedIds([]);
          });
        }}
        onCancel={() => { setShowBatchDeleteConfirm(false); }}
        variant="danger"
      />
      
      <ConfirmModal
         isOpen={!!batchStatusConfig?.isOpen}
         title={t("common:confirm")}
         message={t("common:batch_confirmation.status", { 
           count: selectedIds.length, 
           entities: t("name"),
           action: batchStatusConfig?.isActive ? t("common:actions.activate") : t("common:actions.deactivate")
         })}
          onConfirm={() => {
            if (batchStatusConfig) {
              void updatePagesStatus(selectedIds, batchStatusConfig.isActive).then(() => {
                setBatchStatusConfig(null);
                setSelectedIds([]);
              });
            }
          }}
         onCancel={() => { setBatchStatusConfig(null); }}
      />
      
      <ConfirmModal
         isOpen={showBatchRestoreConfirm}
         title={t("common:restore")}
         message={t("common:batch_confirmation.restore", { count: selectedIds.length, entities: t("name") })}
          onConfirm={() => {
            void restorePages(selectedIds).then(() => {
              setShowBatchRestoreConfirm(false);
              setSelectedIds([]);
            });
          }}
         onCancel={() => { setShowBatchRestoreConfirm(false); }}
      />
    </div>
  );
}
