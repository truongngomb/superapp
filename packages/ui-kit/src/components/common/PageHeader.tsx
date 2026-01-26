import { motion } from 'framer-motion';
import { Plus, Loader2, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { PermissionGuard } from './PermissionGuard';
import { fade } from '../../utils/animations';

interface PageHeaderProps {
  /** The resource name for permission checks */
  resource: string;
  /** Page title translation key (e.g., "categories:title") */
  titleKey: string;
  /** Page subtitle translation key (e.g., "categories:subtitle") */
  subtitleKey: string;
  /** Whether export is in progress (optional) */
  exporting?: boolean;
  /** Number of items (optional) */
  itemCount?: number;
  /** Callback when export is clicked (optional) */
  onExport?: () => void;
  /** Whether to show export button (defaults to true if onExport provided) */
  showExport?: boolean;
  /** Callback when create button is clicked (optional) */
  onCreateClick?: () => void;
  /** Create button translation key (optional) */
  createButtonKey?: string;
  /** Icon to show in header (optional) */
  icon?: React.ReactNode;
  /** Extra actions to show in the header */
  children?: React.ReactNode;
}

export function PageHeader({
  resource,
  titleKey,
  subtitleKey,
  exporting = false,
  itemCount = 0,
  onExport,
  showExport = !!onExport,
  onCreateClick,
  createButtonKey,
  icon,
  children,
}: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={fade}
      initial="initial"
      animate="animate"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
    >
      <div className="flex items-start gap-3 flex-1 overflow-hidden">
        {icon}
        <div className="overflow-hidden">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{t(titleKey)}</h1>
          <p className="text-muted mt-1 truncate">{t(subtitleKey)}</p>
        </div>
        {showExport && onExport && (
          <PermissionGuard resource={resource} action="view">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onExport}
              disabled={exporting || itemCount === 0}
              className="p-2 h-10 w-10 hover:bg-[#217346]/10 shrink-0"
              title={t('uikit:export_excel', { defaultValue: 'Export Excel' })}
            >
              {exporting ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#217346]" />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-[#217346]" />
              )}
            </Button>
          </PermissionGuard>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {onCreateClick && createButtonKey && (
          <PermissionGuard resource={resource} action="create">
            <Button onClick={onCreateClick} className="gap-2">
              <Plus className="w-5 h-5" />
              {t(createButtonKey)}
            </Button>
          </PermissionGuard>
        )}
      </div>
    </motion.div>
  );
}
