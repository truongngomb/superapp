/**
 * CategoryMobileList Component
 * 
 * Mobile list view with infinite scroll functionality.
 */
import { useTranslation } from 'react-i18next';
import { 
  ResourceMobileCard, 
  ResourceMobileList,
  ResourceCardSkeletonList,
  CATEGORY_ICONS,
  type CategoryIcon
} from '@superapp/ui-kit';
import { 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Copy,
  FileText
} from 'lucide-react';
import type { Category } from '@/types';

interface CategoryMobileListProps {
  /** All categories to display */
  categories: Category[];
  /** Whether there are more items to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void | Promise<void>;
  /** Whether initial loading */
  isLoading: boolean;
  /** Selected category IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelect?: (id: string, checked: boolean) => void;
  /** Callback to edit category */
  onEdit: (category: Category) => void;
  /** Callback to delete category */
  onDelete: (id: string) => void;
  /** Callback to restore category */
  onRestore?: (id: string) => void;
  /** Callback to duplicate category */
  onDuplicate?: (category: Category) => void;
}

export function CategoryMobileList({
  categories,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  selectedIds = [],
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
}: CategoryMobileListProps) {
  const { t } = useTranslation(['categories', 'uikit']);
  
  return (
    <ResourceMobileList<Category>
      items={categories}
      keyExtractor={(item) => item.id}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      skeleton={<ResourceCardSkeletonList count={5} infoRowsCount={1} actionsCount={3} />}
      renderItem={(category, index) => {
        const IconComponent = (CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.folder) as CategoryIcon;
        
        return (
          <ResourceMobileCard
            key={category.id}
            id={category.id}
            index={index}
            title={category.name}
            icon={
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: category.color + '30' }}
              >
                <IconComponent 
                  className="w-6 h-6" 
                  style={{ color: category.color }}
                />
              </div>
            }
            status={{
              isActive: category.isActive,
              isDeleted: category.isDeleted
            }}
            isSelected={selectedIds.includes(category.id)}
            onSelect={onSelect}
            infoRows={[
              ...(category.description ? [{
                icon: FileText,
                label: t('uikit:form.description'),
                value: category.description,
                iconBgColor: 'bg-blue-500/20',
                iconColor: 'text-blue-400'
              }] : [])
            ]}
            actions={[
              ...(!category.isDeleted ? [{
                icon: Edit2,
                label: t('uikit:edit'),
                onClick: () => { onEdit(category); },
                permission: { resource: 'categories', action: 'update' }
              }] : (onRestore ? [{
                icon: RotateCcw,
                label: t('uikit:restore'),
                onClick: () => { onRestore(category.id); },
                permission: { resource: 'categories', action: 'update' },
                variant: 'primary' as const
              }] : [])),
              ...(!category.isDeleted && onDuplicate ? [{
                 icon: Copy,
                 label: t('uikit:duplicate'),
                 onClick: () => { onDuplicate(category); },
                 permission: { resource: 'categories', action: 'create' },
                 iconColor: 'text-blue-400'
              }] : []),
              {
                icon: Trash2,
                label: t('uikit:delete'),
                onClick: () => { onDelete(category.id); },
                variant: 'danger',
                permission: { resource: 'categories', action: 'delete' },
                className: category.isDeleted ? 'text-red-700' : 'text-red-400'
              }
            ]}
          />
        );
      }}
    />
  );
}
