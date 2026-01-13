/**
 * PageHeader Component
 * Reusable header component for resource list pages.
 */
import { motion } from 'framer-motion';
import { Plus, Loader2, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@superapp/ui-kit';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { fade } from '@/config';

interface PageHeaderProps {
  /** The resource name for permission checks */
  resource: 'categories' | 'roles' | 'users';
  /** Page title translation key (e.g., "categories:title") */
  titleKey: string;
  /** Page subtitle translation key (e.g., "categories:subtitle") */
  subtitleKey: string;
  /** Whether export is in progress */
  exporting: boolean;
  /** Number of items (for disabling export when empty) */
  itemCount: number;
  /** Callback when export is clicked */
  onExport: () => void;
  /** Callback when create button is clicked */
  onCreateClick: () => void;
  /** Create button translation key (e.g., "categories:create_btn") */
  createButtonKey: string;
  /** Icon to show in header (optional) */
  icon?: React.ReactNode;
}

export function PageHeader({
  resource,
  titleKey,
  subtitleKey,
  exporting,
  itemCount,
  onExport,
  onCreateClick,
  createButtonKey,
  icon,
}: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={fade}
      initial="initial"
      animate="animate"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
    >
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t(titleKey)}</h1>
          <p className="text-muted mt-1">{t(subtitleKey)}</p>
        </div>
        <PermissionGuard resource={resource} action="view">
          <button
            type="button"
            onClick={onExport}
            disabled={exporting || itemCount === 0}
            className="p-2 rounded-lg hover:bg-[#217346]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#217346]" />
            ) : (
              <FileSpreadsheet className="w-6 h-6 text-[#217346]" />
            )}
          </button>
        </PermissionGuard>
      </div>
      <PermissionGuard resource={resource} action="create">
        <Button onClick={onCreateClick}>
          <Plus className="w-5 h-5" />
          {t(createButtonKey)}
        </Button>
      </PermissionGuard>
    </motion.div>
  );
}
