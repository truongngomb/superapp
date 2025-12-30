import { motion } from 'framer-motion';
import { Edit2, Trash2, Folder } from 'lucide-react';
import { Button } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import type { Category } from '@/types';

interface CategoryRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
  };
}

export function CategoryRow({ index, style, data }: CategoryRowProps) {
  const category = data.categories[index];
  if (!category) return null;

  return (
    <div style={style} className="px-1 py-1">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-4 flex items-center gap-4"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: category.color + '20' }}
        >
          <Folder className="w-5 h-5" style={{ color: category.color }} />
        </div>
        <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground truncate">{category.name}</h3>
          {!category.isActive && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              Inactive
            </span>
          )}
        </div>
        <p className="text-sm text-muted line-clamp-1">{category.description}</p>
      </div>
        <div className="flex items-center gap-2">
          <PermissionGuard resource="categories" action="update">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); data.onEdit(category); }}
              aria-label="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard resource="categories" action="delete">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); data.onDelete(category.id); }}
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </PermissionGuard>
        </div>
      </motion.div>
    </div>
  );
}
