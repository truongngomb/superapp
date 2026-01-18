import { MarkdownPage } from '@superapp/shared-types';
import { Badge, Button } from '@superapp/ui-kit';
import { Edit, Trash2, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@superapp/core-logic';
import { useTranslation } from 'react-i18next';

interface MarkdownPageMobileCardProps {
  page: MarkdownPage;
  onEdit: (page: MarkdownPage) => void;
  onDelete: (page: MarkdownPage) => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: () => void;
}

export function MarkdownPageMobileCard({
  page,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  onClick
}: MarkdownPageMobileCardProps) {
  const { t } = useTranslation(['markdown', 'common']);

  return (
    <div 
      className={cn(
        "relative bg-surface rounded-lg border p-4 transition-all",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-border-hover",
        page.isDeleted && "opacity-60 grayscale"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox (if select mode) */}
        {onSelect && (
          <div className="pt-1" onClick={(e) => { e.stopPropagation(); }}>
             <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={isSelected}
              onChange={(e) => { onSelect(e.target.checked); }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate pr-6">
                {page.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span className="font-mono bg-surface-muted px-1.5 py-0.5 rounded">
                  /{page.slug}
                </span>
                {page.showInMenu && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                    {page.menuPosition}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Ver: {page.updated ? new Date(page.updated).toLocaleDateString() : 'N/A'}
            </span>
            {page.coverImage && (
              <span className="flex items-center gap-1" title="Has cover image">
                <ImageIcon className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={page.isPublished ? 'success' : 'secondary'} className="h-5 text-[10px]">
              {page.isPublished ? t('status.published') : t('status.draft')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/pages/${page.slug}`, '_blank');
          }}
          disabled={!page.isPublished}
          title={t('view_page')}
        >
          <Globe className="w-4 h-4 text-blue-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(page);
          }}
        >
          <Edit className="w-4 h-4 text-yellow-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(page);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
