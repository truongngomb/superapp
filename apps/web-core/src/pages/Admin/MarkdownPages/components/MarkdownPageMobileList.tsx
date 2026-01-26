/**
 * MarkdownPageMobileList Component
 * 
 * Mobile list view with infinite scroll functionality.
 */
import { useTranslation } from 'react-i18next';
import { 
  ResourceMobileList,
  ResourceMobileCard,
  ResourceCardSkeleton,
  Badge,
} from '@superapp/ui-kit';
import { Edit, Trash2, Globe, FileText, Image as ImageIcon, Languages, Link as LinkIcon, Menu } from 'lucide-react';
import type { MarkdownPage } from '@superapp/shared-types';

interface MarkdownPageMobileListProps {
  /** All pages to display */
  pages: MarkdownPage[];
  /** Whether there are more items to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void | Promise<void>;
  /** Whether initial loading */
  isLoading: boolean;
  /** Selected page IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelect?: (id: string, checked: boolean) => void;
  /** Callback to edit page */
  onEdit: (page: MarkdownPage) => void;
  /** Callback to manage translations */
  onManageTranslations: (page: MarkdownPage) => void;
  /** Callback to delete page */
  onDelete: (page: MarkdownPage) => void;
}

export function MarkdownPageMobileList({
  pages,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  selectedIds = [],
  onSelect,
  onEdit,
  onManageTranslations,
  onDelete,
}: MarkdownPageMobileListProps) {
  const { t, i18n } = useTranslation(['markdown', 'uikit']);
  
  return (
    <ResourceMobileList<MarkdownPage>
      items={pages}
      keyExtractor={(item) => item.id}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      skeleton={<div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <ResourceCardSkeleton key={i} infoRowsCount={2} actionsCount={4} />)}</div>}
      renderItem={(page, index) => {
        const lang = i18n.language;
        const trans = page.translations[lang] || page.translations['en'] || Object.values(page.translations)[0];
        const title = trans?.title || t('uikit:untitled');
        const slug = trans?.slug || '';

        return (
          <ResourceMobileCard
            key={page.id}
            id={page.id}
            index={index}
            title={(
              <div className="flex flex-col">
                <h3 className="font-bold text-lg text-foreground truncate pr-6 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={page.isPublished ? 'success' : 'secondary'} className="h-4 text-[10px] px-1 font-medium">
                    {page.isPublished ? t('status.published') : t('status.draft')}
                  </Badge>
                  {page.showInMenu && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-none">
                       <Menu className="w-2.5 h-2.5 mr-1" />
                       {t('form.show_in_menu')}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            status={{
              isDeleted: page.isDeleted,
              isActive: page.isPublished
            }}
            isSelected={selectedIds.includes(page.id)}
            onSelect={onSelect ? (_id, checked) => { onSelect(page.id, checked); } : undefined}
            infoRows={[
              {
                icon: LinkIcon,
                label: t('form.slug_label'),
                value: <span className="font-mono text-xs">/{slug}</span>,
                iconBgColor: 'bg-emerald-500/10',
                iconColor: 'text-emerald-500'
              },
              {
                icon: FileText,
                label: t('uikit:form.updated_at'),
                value: page.updated ? new Date(page.updated).toLocaleDateString(i18n.language) : t('uikit:n_a'),
                iconBgColor: 'bg-blue-500/10',
                iconColor: 'text-blue-500'
              },
              ...(page.parentId ? [{
                icon: LinkIcon,
                label: t('form.parent_page'),
                value: page.parentId,
                iconBgColor: 'bg-purple-500/10',
                iconColor: 'text-purple-500'
              }] : []),
              ...(page.coverImage ? [{
                 icon: ImageIcon,
                 label: t('form.has_cover'),
                 value: t('uikit:yes'),
                 iconBgColor: 'bg-amber-500/10',
                 iconColor: 'text-amber-500'
              }] : [])
            ]}
            actions={[
              {
                icon: Globe,
                label: t('view_page'),
                onClick: () => { window.open(`/pages/${slug}`, '_blank'); },
                permission: { resource: 'markdown_pages', action: 'view' },
                iconColor: 'text-blue-500'
              },
              {
                icon: Languages,
                label: t('manage_translations'),
                onClick: () => { onManageTranslations(page); },
                permission: { resource: 'markdown_pages', action: 'update' },
                iconColor: 'text-blue-500'
              },
              {
                icon: Edit,
                label: t('uikit:edit'),
                onClick: () => { onEdit(page); },
                permission: { resource: 'markdown_pages', action: 'update' },
                iconColor: 'text-yellow-600'
              },
              {
                icon: Trash2,
                label: t('uikit:delete'),
                onClick: () => { onDelete(page); },
                variant: 'danger',
                permission: { resource: 'markdown_pages', action: 'delete' }
              }
            ]}
          />
        );
      }}
    />
  );
}
