/**
 * CategoryMobileCard Component
 * 
 * Mobile card designed to match Pokemon Scanner UI:
 * - Dark card with rounded corners
 * - Header: Icon (w-12) + #Order + Name + Status Icon
 * - Info rows like Despawn/Coords style
 * - Bottom action buttons
 */
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Copy,
  CheckCircle2,
  XCircle,
  Archive,
  FileText
} from 'lucide-react';
import { Checkbox } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';
import type { Category } from '@superapp/shared-types';
import { CATEGORY_ICONS, type CategoryIcon } from './icons';

interface CategoryMobileCardProps {
  category: Category;
  index?: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onDuplicate?: (category: Category) => void;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function CategoryMobileCard({
  category,
  index = 0,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
  isSelected,
  onSelect,
}: CategoryMobileCardProps) {
  const { t } = useTranslation(['categories', 'common']);
  
  // Resolve icon component
  const IconComponent = (CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.folder) as CategoryIcon;

  // Status icon config
  const getStatusConfig = () => {
    if (category.isDeleted) {
      return { 
        icon: Archive, 
        color: 'text-amber-400', 
        bgColor: 'bg-amber-400/20',
        borderColor: 'border-amber-400/30'
      };
    }
    if (category.isActive) {
      return { 
        icon: CheckCircle2, 
        color: 'text-emerald-400', 
        bgColor: 'bg-emerald-400/20',
        borderColor: 'border-emerald-400/30'
      };
    }
    return { 
      icon: XCircle, 
      color: 'text-red-400', 
      bgColor: 'bg-red-400/20',
      borderColor: 'border-red-400/30'
    };
  };
  
  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "card border shadow-xl",
        isSelected && "ring-2 ring-primary"
      )}
    >
      {/* ============ HEADER SECTION ============ */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Selection Checkbox */}
          {onSelect && (
            <Checkbox
              checked={isSelected ?? false}
              onChange={(checked) => { onSelect(category.id, checked); }}
            />
          )}

          {/* Category Icon - w-12 (48px) */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: category.color + '30' }}
          >
            <IconComponent 
              className="w-6 h-6" 
              style={{ color: category.color }}
            />
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-bold text-sm">#{index + 1}</span>
              <h3 className="font-bold text-lg text-foreground truncate">
                {category.name}
              </h3>
            </div>
          </div>

          {/* Status Icon */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <StatusIcon className={cn("w-6 h-6", status.color)} />
          </div>
        </div>
      </div>

      {/* ============ INFO ROWS SECTION (like Despawn/Coords) ============ */}
      <div className="mx-4 mb-4 p-2 bg-gray-100 dark:bg-gray-700/30">
        {/* Description Row */}
        {category.description && (
          <div className="flex items-center border-b border-[#2a3142]">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-sm">{t('categories:form.description', { defaultValue: 'Description' })}:</span>
            </div>
            <span className="ml-auto text-sm font-semibold text-foreground text-right max-w-[60%] truncate">
              {category.description}
            </span>
          </div>
        )}

        {/* Placeholder for future info rows - can add more like:
        <div className="flex items-center py-3 border-b border-[#2a3142]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <SomeIcon className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-sm">Label:</span>
          </div>
          <span className="ml-auto text-sm font-semibold text-foreground">
            Value
          </span>
        </div>
        */}
      </div>

      {/* ============ BOTTOM ACTION BUTTONS ============ */}
      <div className="flex border-t border-[#2a3142]">
        {/* Edit / Restore Button */}
        {!category.isDeleted ? (
          <PermissionGuard resource="categories" action="update">
            <button
              onClick={() => { onEdit(category); }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-muted-foreground hover:bg-[#2a3142] transition-colors border-r border-[#2a3142]"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm font-medium">{t('common:edit')}</span>
            </button>
          </PermissionGuard>
        ) : onRestore && (
          <PermissionGuard resource="categories" action="update">
            <button
              onClick={() => { onRestore(category.id); }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-primary hover:bg-primary/10 transition-colors border-r border-[#2a3142]"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">{t('common:restore')}</span>
            </button>
          </PermissionGuard>
        )}

        {/* Duplicate Button */}
        {!category.isDeleted && onDuplicate && (
          <PermissionGuard resource="categories" action="create">
            <button
              onClick={() => { onDuplicate(category); }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-blue-400 hover:bg-blue-400/10 transition-colors border-r border-[#2a3142]"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm font-medium">{t('common:duplicate')}</span>
            </button>
          </PermissionGuard>
        )}

        {/* Delete Button */}
        <PermissionGuard resource="categories" action="delete">
          <button
            onClick={() => { onDelete(category.id); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 transition-colors",
              category.isDeleted 
                ? "text-red-600 hover:bg-red-600/10" 
                : "text-red-400 hover:bg-red-400/10"
            )}
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">{t('common:delete')}</span>
          </button>
        </PermissionGuard>
      </div>
    </motion.div>
  );
}
