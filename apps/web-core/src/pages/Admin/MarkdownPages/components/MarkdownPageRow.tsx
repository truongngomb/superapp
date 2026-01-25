import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Globe, FileText } from 'lucide-react';
import { Button, DataRow } from '@/components/common';
import { cn } from '@/utils';
import type { MarkdownPage } from '@superapp/shared-types';
import { Avatar, PermissionGuard } from '@superapp/ui-kit';
import { LanguageManagementButton } from './LanguageManagementButton';


interface MarkdownPageRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    pages: MarkdownPage[];
    onEdit: (page: MarkdownPage) => void; // Edit default language only
    onManageTranslations: (page: MarkdownPage) => void; // Manage all languages
    onDelete: (page: MarkdownPage) => void;
  };
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function MarkdownPageRow({ index, style, data, isSelected, onSelect }: MarkdownPageRowProps) {
  const { t, i18n } = useTranslation(['markdown', 'uikit']);
  const page = data.pages[index];
  if (!page) return null;

  const lang = i18n.language;
  const trans = page.translations[lang] || page.translations['en'] || Object.values(page.translations)[0];
  const title = trans?.title || t('uikit:untitled');
  const slug = trans?.slug || '';

  const actions = (
    <div className="flex items-center gap-1">
      <PermissionGuard resource="markdown_pages" action="update">
        <LanguageManagementButton 
          page={page} 
          onManageTranslations={data.onManageTranslations}
        />
      </PermissionGuard>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={(e) => {
          e.stopPropagation();
          window.open(`/pages/${slug}`, '_blank');
        }}
        disabled={!page.isPublished}
        title={t('view_page')}
      >
        <Globe className="w-4 h-4 text-blue-500" />
      </Button>

      <PermissionGuard resource="markdown_pages" action="update">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => { e.stopPropagation(); data.onEdit(page); }}
          title={t('uikit:edit')}
        >
          <Edit2 className="w-4 h-4 text-yellow-600" />
        </Button>
      </PermissionGuard>

      <PermissionGuard resource="markdown_pages" action="delete">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
          onClick={(e) => { e.stopPropagation(); data.onDelete(page); }}
          title={t('uikit:delete')}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </PermissionGuard>
    </div>
  );

  const icon = page.coverImage ? (
    <Avatar 
      src={page.coverImage} 
      alt={title}
      name={title}
      size="sm"
      className="w-10 h-10 rounded-lg"
    />
  ) : (
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      <FileText className="w-5 h-5" />
    </div>
  );

  return (
    <DataRow
      style={style}
      icon={icon}
      title={title}
      description={`/${slug}`}
      badges={
        <div className="flex items-center gap-2">
           {page.showInMenu && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium whitespace-nowrap">
              {t('form.show_in_menu')}
            </span>
          )}
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap",
            page.isPublished ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
          )}>
            {page.isPublished ? t('status.published') : t('status.draft')}
          </span>
        </div>
      }
      actions={actions}
      isSelected={isSelected}
      onSelect={onSelect ? (checked) => { onSelect(page.id, checked); } : undefined}
    />
  );
}
