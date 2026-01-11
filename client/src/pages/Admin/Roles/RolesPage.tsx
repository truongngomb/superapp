import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Plus,
  Shield,
  Search,
  RefreshCw,
  Loader2,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  Input,
  LoadingSpinner,
  ConfirmModal,
  SortPopup,
  Pagination,
  Toggle,
  ViewSwitcher,
  Checkbox,
  type ViewMode,
} from "@/components/common";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import type { Role, SortColumn } from "@/types";
import { cn, getStorageItem, setStorageItem } from "@/utils";
import { STORAGE_KEYS } from "@/config";
import { useRoles, useSort, useDebounce, useAuth } from "@/hooks";
import { useExcelExport } from "@/hooks/useExcelExport";
import { RoleForm } from "./components/RoleForm";
import { RoleRow } from "./components/RoleRow";
import { RoleTable } from "./components/RoleTable";

export default function RolesPage() {
  const { t } = useTranslation(["roles", "common"]);
  const {
    roles,
    pagination,
    loading,
    isLoadingMore,
    submitting,
    deleting,
    batchDeleting,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    deleteRoles,
    updateRolesStatus,
    restoreRole,
    restoreRoles,
    getAllForExport,
    exporting,
  } = useRoles();

  const { checkPermission } = useAuth();
  const canDelete = checkPermission('roles', 'delete');
  const canUpdate = checkPermission('roles', 'update');
  const canSelect = canDelete || canUpdate;

  const [viewMode, setViewMode] = useState<ViewMode>(
    () => getStorageItem<ViewMode>(STORAGE_KEYS.ROLES_VIEW_MODE) || "list"
  );
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchRestoreConfirm, setShowBatchRestoreConfirm] = useState(false);
  const [batchStatusConfig, setBatchStatusConfig] = useState<{
    isOpen: boolean;
    isActive: boolean;
  } | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  // Sort configuration
  const { sortConfig, handleSort } = useSort("created", "desc", {
    storageKey: STORAGE_KEYS.ROLES_SORT,
  });

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Export hook
  const { exportToExcel } = useExcelExport<Role>({
    fileNamePrefix: "roles",
    sheetName: t("roles:title"),
    columns: [
      { header: t("roles:form.name_label"), key: "name", width: 30 },
      { header: t("roles:form.desc_label"), key: "description", width: 40 },
      { header: t("common:status"), key: "isActive", width: 15 },
      { header: t("common:created"), key: "created", width: 20 },
    ],
  });

  // Load initial data
  useEffect(() => {
    void fetchRoles({
      page: 1,
      search: debouncedSearch,
      sort: sortConfig.field,
      order: sortConfig.order ?? undefined,
      isDeleted: showArchived || undefined,
    });
  }, [
    debouncedSearch,
    showArchived,
    sortConfig.field,
    sortConfig.order,
    fetchRoles,
  ]);

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.ROLES_VIEW_MODE, mode);
  };

  // Handle selection
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(roles.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Batch actions
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    const success = await deleteRoles(selectedIds);
    if (success) {
      setSelectedIds([]);
      setShowBatchDeleteConfirm(false);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedIds.length === 0) return;
    const success = await restoreRoles(selectedIds);
    if (success) {
      setSelectedIds([]);
      setShowBatchRestoreConfirm(false);
    }
  };

  const handleBatchStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    const success = await updateRolesStatus(selectedIds, isActive);
    if (success) {
      setSelectedIds([]);
      setBatchStatusConfig(null);
    }
  };

  // Single actions
  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deleteRole(deleteId);
    if (success) {
      setDeleteId(null);
    }
  };

  const handleRestore = (id: string) => {
    setRestoreId(id);
  };

  const handleDuplicate = async (role: Role) => {
    try {
      const newName = `${role.name} (${t("common:copy", {
        defaultValue: "Copy",
      })})`;
      await createRole({
        name: newName,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
      });
    } catch {
      // Error handled in hook
    }
  };

  const handleExport = async () => {
    const data = await getAllForExport({
      search: debouncedSearch,
      sort: sortConfig.field,
      order: sortConfig.order ?? "desc",
      isDeleted: showArchived || undefined,
    });

    await exportToExcel(data);
  };

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("roles:title")}
            </h1>
            <p className="text-muted mt-1">{t("roles:subtitle")}</p>
          </div>
          <PermissionGuard resource="roles" action="view">
            <button
              type="button"
              onClick={() => {
                void handleExport();
              }}
              disabled={exporting || roles.length === 0}
              className="p-2 rounded-lg hover:bg-[#217346]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={t("common:export_excel", { defaultValue: "Export Excel" })}
              aria-label={t("common:export_excel", {
                defaultValue: "Export Excel",
              })}
            >
              {exporting ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#217346]" />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-[#217346]" />
              )}
            </button>
          </PermissionGuard>
        </div>

        <PermissionGuard resource="roles" action="create">
          <Button
            onClick={() => {
              setEditingRole(undefined);
              setShowFormModal(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            {t("roles:create_btn")}
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("roles:list.search_placeholder")}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); }}
            className="pl-9"
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
            void fetchRoles({
              page: 1,
              sort: sortConfig.field,
              order: sortConfig.order ?? undefined,
              search: searchTerm,
              isDeleted: showArchived,
            });
          }}
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {roles.length > 0 && canSelect && (
            <div className="flex items-center p-3 bg-surface rounded-lg">
              <Checkbox
                checked={
                  selectedIds.length === 0
                    ? false
                    : selectedIds.length === roles.length
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
          <PermissionGuard resource="roles" action="manage">
            <Toggle
              checked={showArchived}
              onChange={(checked) => {
                setShowArchived(checked);
                setSelectedIds([]);
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
            <PermissionGuard resource="roles" action="update">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowBatchRestoreConfirm(true); }}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                {t("common:restore", { defaultValue: "Restore" })} (
                {selectedIds.length})
              </Button>
            </PermissionGuard>
          )}
          {/* Batch Actions */}
          {selectedIds.length > 0 && (
            <PermissionGuard resource="roles" action="delete">
              <Button
                variant="danger"
                size="sm"
                onClick={() => { setShowBatchDeleteConfirm(true); }}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                {t("common:delete")} ({selectedIds.length})
              </Button>
            </PermissionGuard>
          )}

          {selectedIds.length > 0 && (
            <PermissionGuard resource="roles" action="update">
              {!hasDeletedSelected && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBatchStatusConfig({ isOpen: true, isActive: true });
                    }}
                  >
                    {t("roles:actions.activate")} ({selectedIds.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBatchStatusConfig({ isOpen: true, isActive: false });
                    }}
                  >
                    {t("roles:actions.deactivate")} ({selectedIds.length})
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

      {/* Main Content */}
      {loading && !isLoadingMore ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" text={t("roles:loading")} />
        </div>
      ) : roles.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {searchTerm
                ? t("roles:list.empty_search")
                : t("roles:list.empty")}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchTerm
                ? t("common:try_adjusting_search", {
                    defaultValue: "Try adjusting your search terms",
                  })
                : showArchived
                ? t("common:empty_trash", { defaultValue: "Trash is empty" })
                : t("roles:list.add_first")}
            </p>
            {!searchTerm && !showArchived && (
              <PermissionGuard resource="roles" action="create">
                <Button onClick={() => { setShowFormModal(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("roles:list.add_first")}
                </Button>
              </PermissionGuard>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {viewMode === "list" ? (
            <div className="grid gap-4">
              {roles.map((role, index) => (
                <RoleRow
                  key={role.id}
                  index={index}
                  style={{}}
                  data={{
                    roles,
                    onEdit: (r) => {
                      setEditingRole(r);
                      setShowFormModal(true);
                    },
                    onDelete: (id) => { setDeleteId(id); },
                    onRestore: (id) => { handleRestore(id); },
                    onDuplicate: (role) => { void handleDuplicate(role); },
                  }}
                  isSelected={selectedIds.includes(role.id)}
                  onSelect={canSelect ? handleSelectOne : undefined}
                />
              ))}
            </div>
          ) : (
            <RoleTable
              roles={roles}
              selectedIds={canSelect ? selectedIds : []}
              onSelectAll={canSelect ? handleSelectAll : undefined}
              onSelectOne={canSelect ? handleSelectOne : undefined}
              onEdit={(r) => {
                setEditingRole(r);
                setShowFormModal(true);
              }}
              onDelete={(id) => { setDeleteId(id); }}
              onRestore={(id) => { handleRestore(id); }}
              onDuplicate={(role) => { void handleDuplicate(role); }}
            />
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
                  void fetchRoles({
                    page,
                    search: debouncedSearch,
                    sort: sortConfig.field,
                    order: sortConfig.order ?? undefined,
                    isDeleted: showArchived,
                  });
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showFormModal && (
          <RoleForm
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingRole(undefined);
            }}
            role={editingRole || null}
            onSubmit={(data) => {
              void (async () => {
                if (editingRole) {
                  await updateRole(editingRole.id, data);
                } else {
                  await createRole(data);
                }
                setShowFormModal(false);
              })();
            }}
            loading={submitting}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onCancel={() => { setDeleteId(null); }}
        onConfirm={() => {
          void handleDelete();
        }}
        title={t("roles:delete_title")}
        message={
          roles.find((r) => r.id === deleteId)?.isDeleted
            ? t("roles:hard_delete_confirm")
            : t("roles:delete_confirm")
        }
        confirmText={t("common:delete")}
        loading={deleting}
        variant="danger"
      />

      {/* Restore Confirm Modal */}
      <ConfirmModal
        isOpen={!!restoreId}
        onCancel={() => { setRestoreId(null); }}
        title={t("common:restore", { defaultValue: "Restore" })}
        message={t("roles:restore_confirm", {
          defaultValue: "Are you sure you want to restore this role?",
        })}
        confirmText={t("common:confirm", { defaultValue: "Confirm" })}
        loading={submitting}
        onConfirm={() => {
          if (restoreId) {
            void restoreRole(restoreId).then(() => { setRestoreId(null); });
          }
        }}
        variant="info"
      />

      {/* Batch Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showBatchDeleteConfirm}
        onCancel={() => { setShowBatchDeleteConfirm(false); }}
        onConfirm={() => {
          void handleBatchDelete();
        }}
        title={t("common:batch_delete_title", {
          defaultValue: "Delete Selected Items",
        })}
        message={
          hasDeletedSelected
            ? t("roles:batch_hard_delete_confirm", {
                count: selectedIds.length,
                defaultValue: `Are you sure you want to permanently delete ${String(selectedIds.length)} items?`,
              })
            : t("roles:batch_delete_confirm", { count: selectedIds.length })
        }
        confirmText={t("common:delete")}
        loading={batchDeleting}
        variant="danger"
      />

      {/* Batch Restore Confirm Modal */}
      <ConfirmModal
        isOpen={showBatchRestoreConfirm}
        onCancel={() => { setShowBatchRestoreConfirm(false); }}
        onConfirm={() => {
          void handleBatchRestore();
        }}
        title={t("common:batch_restore_title", {
          defaultValue: "Restore Selected Items",
        })}
        message={t("roles:batch_restore_confirm", {
          count: selectedIds.length,
        })}
        confirmText={t("common:restore", { defaultValue: "Restore" })}
        loading={submitting}
        variant="info"
      />

      {/* Batch Status Confirm Modal */}
      <ConfirmModal
        isOpen={!!batchStatusConfig?.isOpen}
        onCancel={() => { setBatchStatusConfig(null); }}
        title={t("common:confirm")}
        message={t("roles:batch_status_confirm", {
          count: selectedIds.length,
          action: batchStatusConfig?.isActive
            ? t("roles:actions.activate")
            : t("roles:actions.deactivate"),
          defaultValue: `Are you sure you want to ${
            batchStatusConfig?.isActive ? "activate" : "deactivate"
          } ${String(selectedIds.length)} roles?`,
        })}
        confirmText={t("common:confirm")}
        loading={submitting}
        onConfirm={() => {
          if (batchStatusConfig)
            void handleBatchStatus(batchStatusConfig.isActive);
        }}
        variant="warning"
      />
    </div>
  );
}
