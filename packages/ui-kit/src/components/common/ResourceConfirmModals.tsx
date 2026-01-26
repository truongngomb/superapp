import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '../ConfirmModal';

interface ResourceConfirmModalsProps {
  /** Resource name (e.g., 'categories') for translation keys */
  resourceName: string;
  /** Translation namespace for entity names (defaults to resourceName) */
  tNamespace?: string;
  /** Entity name key (e.g., 'entity') */
  entityKey?: string;
  /** Entities name key (e.g., 'entities') */
  entitiesKey?: string;
  
  /** Delete state */
  deleteId: string | null;
  /** Find current being deleted item to check if it's already in trash */
  isDeleted?: boolean;
  /** Callback on cancel delete */
  onDeleteCancel: () => void;
  /** Callback on confirm delete */
  onDeleteConfirm: () => void;
  
  /** Restore state */
  restoreId?: string | null;
  /** Callback on cancel restore */
  onRestoreCancel?: () => void;
  /** Callback on confirm restore */
  onRestoreConfirm?: () => void;
  
  /** Batch Delete state */
  showBatchDelete?: boolean;
  /** Selected count for batch actions */
  selectedCount?: number;
  /** Whether any of selected items are archived (for hard delete message) */
  hasArchivedSelected?: boolean;
  /** Callback on cancel batch delete */
  onBatchDeleteCancel?: () => void;
  /** Callback on confirm batch delete */
  onBatchDeleteConfirm?: () => void;
  
  /** Batch Restore state */
  showBatchRestore?: boolean;
  /** Callback on cancel batch restore */
  onBatchRestoreCancel?: () => void;
  /** Callback on confirm batch restore */
  onBatchRestoreConfirm?: () => void;
  
  /** Batch Status Update state */
  batchStatusConfig?: {
    isOpen: boolean;
    isActive: boolean;
  } | null;
  /** Callback on cancel batch status */
  onBatchStatusCancel?: () => void;
  /** Callback on confirm batch status */
  onBatchStatusConfirm?: (isActive: boolean) => void;
  
  /** Global loading state */
  loading?: boolean;
}

export function ResourceConfirmModals({
  resourceName,
  tNamespace,
  entityKey = 'entity',
  entitiesKey = 'entities',
  
  deleteId,
  isDeleted,
  onDeleteCancel,
  onDeleteConfirm,
  
  restoreId,
  onRestoreCancel,
  onRestoreConfirm,
  
  showBatchDelete,
  selectedCount = 0,
  hasArchivedSelected,
  onBatchDeleteCancel,
  onBatchDeleteConfirm,
  
  showBatchRestore,
  onBatchRestoreCancel,
  onBatchRestoreConfirm,
  
  batchStatusConfig,
  onBatchStatusCancel,
  onBatchStatusConfirm,
  
  loading = false,
}: ResourceConfirmModalsProps) {
  const ns = tNamespace || resourceName;
  const { t } = useTranslation([ns, 'uikit']);

  const entityName = t(`${ns}:${entityKey}`);
  const entitiesName = t(`${ns}:${entitiesKey}`);

  return (
    <>
      {/* 1. Single Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        title={t('uikit:delete')}
        message={
          isDeleted
            ? t('uikit:confirmation.hard_delete', { entity: entityName })
            : t('uikit:confirmation.delete', { entity: entityName })
        }
        confirmText={t('uikit:delete')}
        cancelText={t('uikit:cancel')}
        loading={loading}
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
        variant="danger"
      />

      {/* 2. Single Restore */}
      {onRestoreConfirm && onRestoreCancel && (
        <ConfirmModal
          isOpen={!!restoreId}
          title={t('uikit:restore')}
          message={t('uikit:confirmation.restore', { entity: entityName })}
          confirmText={t('uikit:confirm')}
          cancelText={t('uikit:cancel')}
          loading={loading}
          onConfirm={onRestoreConfirm}
          onCancel={onRestoreCancel}
        />
      )}

      {/* 3. Batch Delete */}
      {onBatchDeleteConfirm && onBatchDeleteCancel && (
        <ConfirmModal
          isOpen={!!showBatchDelete}
          title={t('uikit:delete')}
          message={
            hasArchivedSelected
              ? t('uikit:batch_confirmation.hard_delete', { count: selectedCount, entities: entitiesName })
              : t('uikit:batch_confirmation.delete', { count: selectedCount, entities: entitiesName })
          }
          confirmText={t('uikit:delete')}
          cancelText={t('uikit:cancel')}
          loading={loading}
          onConfirm={onBatchDeleteConfirm}
          onCancel={onBatchDeleteCancel}
          variant="danger"
        />
      )}

      {/* 4. Batch Restore */}
      {onBatchRestoreConfirm && onBatchRestoreCancel && (
        <ConfirmModal
          isOpen={!!showBatchRestore}
          title={t('uikit:restore')}
          message={t('uikit:batch_confirmation.restore', { count: selectedCount, entities: entitiesName })}
          loading={loading}
          onConfirm={onBatchRestoreConfirm}
          onCancel={onBatchRestoreCancel}
        />
      )}

      {/* 5. Batch Status Update */}
      {onBatchStatusConfirm && onBatchStatusCancel && (
        <ConfirmModal
          isOpen={!!batchStatusConfig?.isOpen}
          title={t('uikit:confirm')}
          message={t('uikit:batch_confirmation.status', {
            count: selectedCount,
            entities: entitiesName,
            action: batchStatusConfig?.isActive ? t('uikit:actions.activate') : t('uikit:actions.deactivate'),
          })}
          loading={loading}
          onConfirm={() => { if (batchStatusConfig) onBatchStatusConfirm(batchStatusConfig.isActive); }}
          onCancel={onBatchStatusCancel}
        />
      )}
    </>
  );
}
