import { MarkdownPage } from '@superapp/shared-types';
import { Badge, Button, Checkbox } from '@superapp/ui-kit';
import { Edit, Trash2, Globe, FileText, Image as ImageIcon, Languages, Link as LinkIcon } from 'lucide-react';
import { cn } from '@superapp/core-logic';
import { useTranslation } from 'react-i18next';
import { PermissionGuard } from '@/components/common/PermissionGuard';

interface MarkdownPageMobileCardProps {
  page: MarkdownPage;
  onEdit: (page: MarkdownPage) => void;
  onManageTranslations?: (page: MarkdownPage) => void;
  onDelete: (page: MarkdownPage) => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: () => void;
}

export function MarkdownPageMobileCard({
  page,
  onEdit,
  onManageTranslations,
  onDelete,
  isSelected,
  onSelect,
  onClick
}: MarkdownPageMobileCardProps) {
  const { t, i18n } = useTranslation(['markdown', 'uikit']);

  const lang = i18n.language;
  const trans = page.translations[lang] || page.translations['en'] || Object.values(page.translations)[0];
  const title = trans?.title || t('uikit:untitled');
  const slug = trans?.slug || '';

  return (
    <div 
      className={cn(
        "relative bg-surface rounded-lg border p-4 transition-all group",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-border-hover",
        page.isDeleted && "opacity-60 grayscale"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox (if select mode) */}
        {onSelect && (
          <div className="pt-1" onClick={(e) => { e.stopPropagation(); }}>
              <Checkbox
                checked={isSelected || false}
                onChange={onSelect}
              />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate pr-6 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span className="font-mono bg-surface-muted px-1.5 py-0.5 rounded text-[10px]">
                  /{slug}
                </span>
                {page.showInMenu && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-none">
                     {t('form.show_in_menu')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {page.updated ? new Date(page.updated).toLocaleDateString(i18n.language) : t('uikit:n_a')}
            </span>
            {page.coverImage && (
              <span className="flex items-center gap-1" title={t('form.has_cover')}>
                <ImageIcon className="w-3 h-3 text-blue-500" />
              </span>
            )}
            {page.parentId && (
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                {t('form.parent_page')}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 pt-1">
            <Badge variant={page.isPublished ? 'success' : 'secondary'} className="h-5 text-[10px] px-1.5 font-medium">
              {page.isPublished ? t('status.published') : t('status.draft')}
            </Badge>
            {page.isDeleted && (
               <Badge variant="danger" className="h-5 text-[10px] px-1.5 font-medium">
                 {t('uikit:status.deleted')}
               </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-1 mt-4 pt-3 border-t">
        <PermissionGuard resource="markdown_pages" action="view">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/pages/${slug}`, '_blank');
            }}
            disabled={!page.isPublished}
            title={t('view_page')}
          >
            <Globe className="w-4 h-4 text-blue-500" />
          </Button>
        </PermissionGuard>

        {onManageTranslations && (
          <PermissionGuard resource="markdown_pages" action="update">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onManageTranslations(page);
              }}
              title={t('manage_translations')}
            >
              <Languages className="w-4 h-4 text-blue-500" />
            </Button>
          </PermissionGuard>
        )}

        <PermissionGuard resource="markdown_pages" action="update">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(page);
            }}
          >
            <Edit className="w-4 h-4 text-yellow-600" />
          </Button>
        </PermissionGuard>

        <PermissionGuard resource="markdown_pages" action="delete">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(page);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </PermissionGuard>
      </div>
    </div>
  );
}

