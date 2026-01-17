/**
 * BatchActionButtons Component
 * Reusable component for batch actions (Restore, Delete, Activate, Deactivate).
 * On small screens, shows only icons to save space.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
        className="flex items-center gap-2"
      >
        {/* Restore Button (only when showing archived) */}
        {showArchived && (
          <PermissionGuard resource={resource} action="update">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRestore} 
              className="gap-1.5"
              title={`${t('restore')} (${String(selectedCount)})`}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">({selectedCount})</span>
            </Button>
          </PermissionGuard>
        )}

        {/* Delete Button - Red/Danger color */}
        <PermissionGuard resource={resource} action="delete">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete} 
            className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            title={`${t('delete_selected')} (${String(selectedCount)})`}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">({selectedCount})</span>
          </Button>
        </PermissionGuard>

        {/* Activate/Deactivate Buttons (only when no deleted items selected) */}
        {!hasDeletedSelected && (
          <PermissionGuard resource={resource} action="update">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onActivate} 
              className="gap-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
              title={`${t('actions.activate')} (${String(selectedCount)})`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">({selectedCount})</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDeactivate} 
              className="gap-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
              title={`${t('actions.deactivate')} (${String(selectedCount)})`}
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">({selectedCount})</span>
            </Button>
          </PermissionGuard>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
