import { useState, useEffect, useRef } from "react";
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
import type { 
  MarkdownPage, 
  MarkdownPageCreateInput, 
  MarkdownPageUpdateInput, 
  MarkdownPageListParams,
  SortColumn 
} from "@superapp/shared-types";
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
} from "@/hooks";

import { markdownService } from "@/services";
import { MarkdownPageForm } from "./components/MarkdownPageForm";
import { MarkdownPageTable } from "./components/MarkdownPageTable";
import { MarkdownPageRow } from "./components/MarkdownPageRow";
import { MarkdownPageMobileList } from "./components/MarkdownPageMobileList";
import { MarkdownPageSkeleton } from "./components/MarkdownPageSkeleton";
import { MarkdownPageTableSkeleton } from "./components/MarkdownPageTableSkeleton";
import { MarkdownPageMobileCardSkeletonList } from "./components/MarkdownPageMobileCardSkeleton";

export default function MarkdownPagesPage() {
  const { t } = useTranslation(["markdown", "common"]);
  const [searchParams] = useSearchParams();
  
  // Setup Search
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearchQuery = useDebounce(searchQuery);

  // Setup Sort
  const { sortConfig, handleSort } = useSort("updated", "desc", {
    storageKey: STORAGE_KEYS.MARKDOWN_PAGES_SORT,
  }) as { sortConfig: { field: string; order: 'asc' | 'desc' }; handleSort: (field: string) => void };

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

  // Use Generic Resource Hook
  const {
    items: pages,
    loading,
    isLoadingMore,
    total,
    queryParams,
    fetchItems,
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    setSelectedIds,
    handleDelete,
    handleRestore,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchUpdateStatus,
    exporting,
    getAllForExport,
  } = useResource<MarkdownPage, MarkdownPageCreateInput, MarkdownPageUpdateInput, MarkdownPageListParams>({
    service: markdownService,
    resourceName: "markdown_pages",
    initialParams: {
      page: 1,
      limit: 10,
      sort: sortConfig.field,
      order: sortConfig.order,
      isDeleted: showArchived || undefined,
    },
  });

  // Responsive View
  const { effectiveView, isMobile } = useResponsiveView(viewMode);

  // Infinite scroll for mobile
  const infiniteProps = {
    items: pages,
    total,
    queryParams,
    fetchItems,
    isLoadingMore,
  };
  
  const {
    allItems: mobilePages,
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
  const canDelete = checkPermission('markdown_pages', 'delete');
  const canUpdate = checkPermission('markdown_pages', 'update');
  const canSelect = canDelete || canUpdate; // Only allow selection if user can perform batch actions

  // UI State
  const [editingPage, setEditingPage] = useState<MarkdownPage | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [manageAllLanguages, setManageAllLanguages] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  
  // Batch Actions State
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

  // Handle Filter Changes
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const hasFilterChanged = 
      prev.search !== debouncedSearchQuery ||
      prev.sort !== sortConfig.field ||
      prev.order !== sortConfig.order ||
      prev.isDeleted !== showArchived;

    if (hasFilterChanged) {
      prevFiltersRef.current = {
        search: debouncedSearchQuery,
        sort: sortConfig.field,
        order: sortConfig.order,
        isDeleted: showArchived,
      };

      void fetchItems({
        search: debouncedSearchQuery || undefined,
        sort: sortConfig.field,
        order: sortConfig.order,
        page: 1,
        isDeleted: showArchived || undefined,
      });
    }
  }, [debouncedSearchQuery, sortConfig, showArchived, fetchItems]);

  // Excel Export
  const { exportToExcel } = useExcelExport<MarkdownPage>({
    fileNamePrefix: "markdown-pages",
    sheetName: t("name"),
    columns: [
      { key: "title", header: t("form.title"), width: 30 },
      { key: "slug", header: t("form.slug"), width: 20 },
      { key: "isPublished", header: t("form.published"), width: 10 },
      { key: "updated", header: t("common:updated"), width: 15 },
    ],
  });

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
    { field: "updated", label: t("common:updated") },
    { field: "created", label: t("common:created") },
  ];

  const hasDeletedSelected = selectedIds.some(
    (id) => pages.find((p) => p.id === id)?.isDeleted
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
        sortConfig={sortConfig}
        onSort={handleSort}
        isRefreshing={isRefreshing}
        isLoading={loading}
        onRefresh={() => { setIsRefreshing(true); void fetchItems().finally(() => { setIsRefreshing(false); }); }}
      />

      {/* Toolbar */}
      <ResourceToolbar
        resource="markdown_pages"
        itemCount={isMobile ? mobilePages.length : pages.length}
        totalItems={total}
        canSelect={canSelect}
        selectedCount={selectedIds.length}
        totalListItems={isMobile ? mobilePages.length : pages.length}
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
            effectiveView === 'mobile' ? (
              <MarkdownPageMobileCardSkeletonList count={3} />
            ) : effectiveView === 'table' ? (
              <MarkdownPageTableSkeleton />
            ) : (
              <div className="space-y-0.5">
                {Array.from({ length: 5 }).map((_, i) => <MarkdownPageSkeleton key={i} />)}
              </div>
            )
          ) : pages.length === 0 ? (
             <Card className="py-12 text-center h-full flex flex-col justify-center">
               <CardContent>
                 <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
                 <p className="text-muted">
                   {searchQuery ? t("common:list.empty_search", { entities: t("name") }) : t("common:list.empty", { entities: t("name") })}
                 </p>
                 {!searchQuery && (
                   <PermissionGuard resource="markdown_pages" action="create">
                     <Button onClick={() => { setShowForm(true); }} className="mt-4">
                       {t("common:list.add_first", { entity: t("name") })}
                     </Button>
                   </PermissionGuard>
                 )}
               </CardContent>
             </Card>
          ) : (
            <div className="space-y-2">
              {effectiveView === 'mobile' ? (
                <MarkdownPageMobileList
                  pages={mobilePages}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={fetchNextPage}
                  isLoading={loading}
                  selectedIds={canSelect ? selectedIds : []}
                  onSelect={canSelect ? handleSelectOne : undefined}
                  onEdit={(p) => { 
                    setEditingPage(p); 
                    setManageAllLanguages(false);
                    setShowForm(true); 
                  }}
                  onManageTranslations={(p) => {
                    setEditingPage(p);
                    setManageAllLanguages(true);
                    setShowForm(true);
                  }}
                  onDelete={(p) => { setDeleteId(p.id); }}
                />
              ) : effectiveView === 'table' ? (
                <MarkdownPageTable
                  data={pages}
                  loading={loading}
                  selectedIds={selectedIds}
                  sort={sortConfig}
                  onSort={handleSort}
                  onSelect={canSelect ? handleSelectOne : undefined}
                  onSelectAll={canSelect ? handleSelectAll : undefined}
                  onEdit={(p) => { 
                    setEditingPage(p); 
                    setManageAllLanguages(false);
                    setShowForm(true); 
                  }}
                  onManageTranslations={(p) => {
                    setEditingPage(p);
                    setManageAllLanguages(true);
                    setShowForm(true);
                  }}
                  onDelete={(p) => { setDeleteId(p.id); }}
                />
              ) : (
                <div className="space-y-2">
                  {pages.map((page, index) => (
                    <MarkdownPageRow
                      key={page.id}
                      index={index}
                      style={{}}
                      data={{
                        pages,
                        onEdit: (p) => { 
                          setEditingPage(p); 
                          setManageAllLanguages(false);
                          setShowForm(true); 
                        },
                        onManageTranslations: (p) => { 
                          setEditingPage(p); 
                          setManageAllLanguages(true);
                          setShowForm(true); 
                        },
                        onDelete: (p) => { setDeleteId(p.id); }
                      }}
                      isSelected={selectedIds.includes(page.id)}
                      onSelect={canSelect ? (id, checked) => { handleSelectOne(id, checked); } : undefined}
                    />
                  ))}
                </div>
              )}

              {/* Pagination - Desktop/List only */}
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
        </motion.div>
      </AnimatePresence>

      {/* Form Modal */}
      {showForm && (
        <MarkdownPageForm
          open={showForm}
          onClose={() => { 
            setShowForm(false); 
            setEditingPage(undefined); 
            setManageAllLanguages(false);
          }}
          initialData={editingPage}
          manageAllLanguages={manageAllLanguages}
          onSuccess={() => void fetchItems()}
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
            void handleDelete(deleteId).then(() => {
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
            void handleRestore(restoreId).then(() => {
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
          void handleBatchDelete().then(() => {
            setShowBatchDeleteConfirm(false);
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
              void handleBatchUpdateStatus(batchStatusConfig.isActive).then(() => {
                setBatchStatusConfig(null);
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
            void handleBatchRestore().then(() => {
              setShowBatchRestoreConfirm(false);
            });
          }}
         onCancel={() => { setShowBatchRestoreConfirm(false); }}
      />
    </div>
  );
}
