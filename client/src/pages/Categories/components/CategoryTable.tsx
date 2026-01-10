import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, RotateCcw, Copy } from 'lucide-react';
import { Button, Checkbox, Badge } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';
import type { Category } from '@/types';
import { CATEGORY_ICONS, type CategoryIcon } from './icons';

interface CategoryTableProps {
  categories: Category[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onDuplicate?: (category: Category) => void;
}

/**
 * CategoryTable Component
 * 
 * Table view for categories with columns: Checkbox, Icon, Name, Description, Status, Actions
 */
export function CategoryTable({
  categories,
  selectedIds,
  onSelectOne,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
}: CategoryTableProps) {
  const { t } = useTranslation(['categories', 'common']);

  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted-foreground">
          <tr>
            <th className="w-12 h-12 px-4 text-left">&nbsp;</th>
            <th className="w-12 h-12 px-4 text-left">&nbsp;</th>
            <th className="h-12 px-4 text-left font-medium">
              {t('common:name')}
            </th>
            <th className="h-12 px-4 text-left font-medium hidden md:table-cell">
              {t('categories:form.desc_label')}
            </th>
            <th className="w-24 h-12 px-4 text-left font-medium">
              {t('common:status')}
            </th>
            <th className="w-32 h-12 px-4 text-right font-medium">
              {t('common:actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const IconComponent = (CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.folder) as CategoryIcon;
            const isSelected = selectedIds.includes(category.id);

            return (
              <tr
                key={category.id}
                className={cn(
                  'border-t border-border transition-colors hover:bg-muted/5',
                  isSelected && 'bg-primary/5'
                )}
              >
                <td className="p-4 align-middle">
                  <PermissionGuard resource="categories" action="delete">
                    <Checkbox
                      checked={isSelected}
                      onChange={(checked) => { onSelectOne(category.id, checked); }}
                    />
                  </PermissionGuard>
                </td>
                <td className="p-4 align-middle">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <span className="font-medium text-foreground">{category.name}</span>
                </td>
                <td className="p-4 align-middle hidden md:table-cell">
                  <span className="text-muted-foreground line-clamp-1">
                    {category.description || '-'}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  {category.isActive ? (
                    <Badge variant="success" size="sm">{t('common:active')}</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">{t('common:inactive')}</Badge>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center justify-end gap-1">
                    {!category.isDeleted && (
                      <PermissionGuard resource="categories" action="update">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { onEdit(category); }}
                          aria-label={t('common:edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </PermissionGuard>
                    )}

                    {!category.isDeleted && onDuplicate && (
                      <PermissionGuard resource="categories" action="create">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { onDuplicate(category); }}
                          aria-label={t('common:duplicate', { defaultValue: 'Duplicate' })}
                        >
                          <Copy className="w-4 h-4 text-blue-500" />
                        </Button>
                      </PermissionGuard>
                    )}

                    {category.isDeleted && onRestore && (
                      <PermissionGuard resource="categories" action="update">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { onRestore(category.id); }}
                          aria-label={t('common:restore', { defaultValue: 'Restore' })}
                        >
                          <RotateCcw className="w-4 h-4 text-primary" />
                        </Button>
                      </PermissionGuard>
                    )}

                    <PermissionGuard resource="categories" action="delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { onDelete(category.id); }}
                        aria-label={t('common:delete')}
                      >
                        <Trash2
                          className={cn(
                            'w-4 h-4',
                            category.isDeleted ? 'text-red-700' : 'text-red-500'
                          )}
                        />
                      </Button>
                    </PermissionGuard>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
