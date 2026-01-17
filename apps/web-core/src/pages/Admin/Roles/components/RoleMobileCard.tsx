/**
 * RoleMobileCard Component
 * 
 * Mobile card for Roles matching the style of other mobile resources.
 */
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Edit2, 
  Trash2, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Archive,
  Copy,
  FileText
} from 'lucide-react';
import { Checkbox, Button } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';
import type { Role } from '@superapp/shared-types';

interface RoleMobileCardProps {
  role: Role;
  index?: number;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onDuplicate?: (role: Role) => void;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function RoleMobileCard({
  role,
  index = 0,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
  isSelected,
  onSelect,
}: RoleMobileCardProps) {
  const { t } = useTranslation(['roles', 'common']);
  
  // Status config
  const getStatusConfig = () => {
    if (role.isDeleted) {
      return { 
        icon: Archive, 
        color: 'text-amber-400', 
        bgColor: 'bg-amber-400/20',
        borderColor: 'border-amber-400/30'
      };
    }
    if (role.isActive) {
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
          {/* Checkbox */}
          {onSelect && (
            <Checkbox
              checked={isSelected ?? false}
              onChange={(checked) => { onSelect(role.id, checked); }}
            />
          )}

          {/* Name & Order */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-bold text-sm">#{index + 1}</span>
              <h3 className="font-bold text-lg text-foreground truncate leading-tight">
                {role.name}
              </h3>
            </div>
          </div>

          {/* Status Icon */}
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <StatusIcon className={cn("w-6 h-6", status.color)} />
          </div>
        </div>
      </div>

      {/* ============ INFO ROWS SECTION ============ */}
      <div className="mx-4 mb-4">
        {/* Description Row */}
        {role.description && (
          <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-sm">{t('roles:form.description', { defaultValue: 'Description' })}:</span>
            </div>
            <span className="ml-auto text-sm font-semibold text-foreground text-right truncate max-w-[60%]">
              {role.description}
            </span>
          </div>
        )}
      </div>

      {/* ============ BOTTOM ACTION BUTTONS ============ */}
      <div className="flex border-t border-[#2a3142]">
        {/* Edit / Restore */}
        {!role.isDeleted ? (
          <PermissionGuard resource="roles" action="update">
             <Button
               variant="ghost"
               onClick={() => { onEdit(role); }}
               className="flex-1 h-auto py-3.5 rounded-none text-muted-foreground hover:bg-[#2a3142] hover:text-muted-foreground border-r border-[#2a3142]"
             >
               <Edit2 className="w-4 h-4" />
               <span className="text-sm font-medium hidden xs:inline">{t('common:edit')}</span>
             </Button>
          </PermissionGuard>
        ) : onRestore && (
          <PermissionGuard resource="roles" action="update">
             <Button
               variant="ghost"
               onClick={() => { onRestore(role.id); }}
               className="flex-1 h-auto py-3.5 rounded-none text-primary hover:bg-primary/10 hover:text-primary border-r border-[#2a3142]"
             >
               <RotateCcw className="w-4 h-4" />
               <span className="text-sm font-medium hidden xs:inline">{t('common:restore')}</span>
             </Button>
          </PermissionGuard>
        )}

        {/* Duplicate Button */}
        {!role.isDeleted && onDuplicate && (
           <PermissionGuard resource="roles" action="create">
             <Button
               variant="ghost"
               onClick={() => { onDuplicate(role); }}
               className="flex-1 h-auto py-3.5 rounded-none text-blue-400 hover:bg-blue-400/10 hover:text-blue-400 border-r border-[#2a3142]"
             >
               <Copy className="w-4 h-4" />
               <span className="text-sm font-medium hidden xs:inline">{t('common:duplicate')}</span>
             </Button>
           </PermissionGuard>
        )}

        {/* Delete Button */}
        <PermissionGuard resource="roles" action="delete">
           <Button
             variant="ghost"
             onClick={() => { onDelete(role.id); }}
             className={cn(
               "flex-1 h-auto py-3.5 rounded-none transition-colors",
               role.isDeleted 
                 ? "text-red-600 hover:bg-red-600/10 hover:text-red-700" 
                 : "text-red-400 hover:bg-red-400/10 hover:text-red-400"
             )}
           >
             <Trash2 className="w-4 h-4" />
             <span className="text-sm font-medium hidden xs:inline">{t('common:delete')}</span>
           </Button>
        </PermissionGuard>
      </div>
    </motion.div>
  );
}
