/**
 * BatchActionButtons Component
 * Reusable component for batch actions (Restore, Delete, Activate, Deactivate).
 */
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@superapp/ui-kit';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { fadeSlideRight } from '@/config';

interface BatchActionButtonsProps {
  /** The resource name for permission checks */
  resource: 'categories' | 'roles' | 'users';
  /** Number of selected items */
  selectedCount: number;
  /** Whether archived items are currently shown */
  showArchived: boolean;
  /** Whether any of the selected items are deleted (for hiding activate/deactivate) */
  hasDeletedSelected: boolean;
  /** Callback when restore is clicked */
  onRestore: () => void;
  /** Callback when delete is clicked */
  onDelete: () => void;
  /** Callback when activate is clicked */
  onActivate: () => void;
  /** Callback when deactivate is clicked */
  onDeactivate: () => void;
}

export function BatchActionButtons({
  resource,
  selectedCount,
  showArchived,
  hasDeletedSelected,
  onRestore,
  onDelete,
  onActivate,
  onDeactivate,
}: BatchActionButtonsProps) {
  const { t } = useTranslation('common');

  if (selectedCount === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key="batch-actions"
        variants={fadeSlideRight}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center gap-3 flex-wrap"
      >
        {/* Restore Button (only when showing archived) */}
        {showArchived && (
          <PermissionGuard resource={resource} action="update">
            <Button variant="outline" size="sm" onClick={onRestore} className="whitespace-nowrap">
              <RefreshCw className="w-4 h-4" /> {t('restore')} ({selectedCount})
            </Button>
          </PermissionGuard>
        )}

        {/* Delete Button */}
        <PermissionGuard resource={resource} action="delete">
          <Button variant="danger" size="sm" onClick={onDelete} className="whitespace-nowrap">
            <Trash2 className="w-4 h-4" /> {t('delete_selected')} ({selectedCount})
          </Button>
        </PermissionGuard>

        {/* Activate/Deactivate Buttons (only when no deleted items selected) */}
        {!hasDeletedSelected && (
          <PermissionGuard resource={resource} action="update">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onActivate} className="whitespace-nowrap">
                {t('actions.activate')} ({selectedCount})
              </Button>
              <Button variant="outline" size="sm" onClick={onDeactivate} className="whitespace-nowrap">
                {t('actions.deactivate')} ({selectedCount})
              </Button>
            </div>
          </PermissionGuard>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
