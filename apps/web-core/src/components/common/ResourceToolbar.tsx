/**
 * ResourceToolbar Component
 * A reusable toolbar component for resource list pages.
 * Encapsulates Select All, View Switcher, and Show Archived toggle.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Checkbox, Toggle, ViewSwitcher, type ViewMode } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { fadeScale, delayedTransition } from '@/config';

interface ResourceToolbarProps {
  /** The resource name for permission checks */
  resource: 'categories' | 'roles' | 'users' | 'markdown_pages';
  /** Number of items in the list */
  itemCount: number;
  /** Total number of items (for display) */
  totalItems: number;
  /** Whether the user can select items */
  canSelect: boolean;
  /** Number of selected items */
  selectedCount: number;
  /** Total items in list (for select all logic) */
  totalListItems: number;
  /** Callback when select all is triggered */
  onSelectAll: (checked: boolean) => void;
  /** Current view mode */
  viewMode: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: ViewMode) => void;
  /** Whether archived items are shown */
  showArchived: boolean;
  /** Callback when show archived changes */
  onShowArchivedChange: (show: boolean) => void;
  /** Optional custom batch actions to render */
  batchActions?: React.ReactNode;
  /** Whether currently on mobile (hides view switcher) */
  isMobile?: boolean;
}

export function ResourceToolbar({
  resource,
  itemCount,
  totalItems,
  canSelect,
  selectedCount,
  totalListItems,
  onSelectAll,
  viewMode,
  onViewModeChange,
  showArchived,
  onShowArchivedChange,
  batchActions,
  isMobile = false,
}: ResourceToolbarProps) {
  const { t } = useTranslation('common');

  // Determine checkbox state
  const checkboxState = selectedCount === 0 
    ? false 
    : selectedCount === totalListItems 
      ? true 
      : 'indeterminate';

  return (
    <div className="flex items-center justify-between gap-4 mb-2 md:mb-4">
      {/* Left side: Select All, View Switcher (desktop), Show Archived */}
      <div className="flex items-center gap-4">
        <AnimatePresence mode="popLayout">
          {itemCount > 0 && canSelect && (
            <motion.div
              key="select-all"
              variants={fadeScale}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex items-center p-4 bg-surface rounded-lg"
            >
              <Checkbox
                triState
                checked={checkboxState}
                onChange={onSelectAll}
                label={t('select_all')}
                hideLabelOnMobile
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hide ViewSwitcher on mobile - auto-locks to mobile view */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={delayedTransition(0.1)}
          >
            <ViewSwitcher value={viewMode} onChange={onViewModeChange} />
          </motion.div>
        )}

        <PermissionGuard resource={resource} action="manage">
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={delayedTransition(0.2)}
          >
            <Toggle
              checked={showArchived}
              onChange={onShowArchivedChange}
              label={t('show_archived')}
              hideLabelOnMobile
            />
          </motion.div>
        </PermissionGuard>
      </div>

      {/* Right side: Batch Actions + Total Items (always same row) */}
      <div className="flex items-center gap-3">
        {batchActions}
        <p className="text-sm text-muted whitespace-nowrap">{t('total_items', { count: totalItems })}</p>
      </div>
    </div>
  );
}
