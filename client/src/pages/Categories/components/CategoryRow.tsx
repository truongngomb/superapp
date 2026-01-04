import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, RotateCcw } from 'lucide-react';
import { Button, DataRow } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import type { Category } from '@/types';
import { CATEGORY_ICONS, type CategoryIcon } from './icons';

interface CategoryRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    onRestore?: (id: string) => void;
  };
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function CategoryRow({ index, style, data, isSelected, onSelect }: CategoryRowProps) {
  const { t } = useTranslation();
  const category = data.categories[index];
  if (!category) return null;

  // Resolve icon component
  const IconComponent = (CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.folder) as CategoryIcon;

  const actions = (
    <>
      {!category.isDeleted && (
        <PermissionGuard resource="categories" action="update">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); data.onEdit(category); }}
            aria-label={t('edit')}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </PermissionGuard>
      )}
      
      {category.isDeleted && data.onRestore && (
        <PermissionGuard resource="categories" action="update">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { 
                e.stopPropagation(); 
                if (data.onRestore) {
                  data.onRestore(category.id);
                }
            }}
            aria-label={t('restore', { defaultValue: 'Restore' })}
          >
            <RotateCcw className="w-4 h-4 text-primary" />
          </Button>
        </PermissionGuard>
      )}

      {!category.isDeleted && (
        <PermissionGuard resource="categories" action="delete">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); data.onDelete(category.id); }}
            aria-label={t('delete')}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </PermissionGuard>
      )}
    </>
  );

  return (
    <DataRow
      style={style}
      icon={<IconComponent className="w-5 h-5" style={{ color: category.color }} />}
      iconBgColor={category.color + '20'} // Using hex + opacity for bg
      title={category.name}
      description={category.description}
      isActive={category.isActive}
      actions={actions}
      isSelected={isSelected}
      onSelect={onSelect ? (checked) => { onSelect(category.id, checked); } : undefined}
    />
  );
}

