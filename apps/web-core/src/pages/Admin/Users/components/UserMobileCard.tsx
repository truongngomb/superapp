/**
 * UserMobileCard Component
 * 
 * Mobile card designed to match the Pokemon Scanner style used in CategoryMobileCard.
 * - Dark/Light card matching theme
 * - Header: Avatar + #Order + Name + Status Icon
 * - Info rows for Email and Role
 * - Bottom action buttons
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
  Mail,
  Shield
} from 'lucide-react';
import { Checkbox, Avatar, Badge, Button } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { cn } from '@/utils';
import type { User, Role } from '@superapp/shared-types';

interface UserMobileCardProps {
  user: User;
  roles: Role[];
  index?: number;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onAssignRole: (user: User) => void;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function UserMobileCard({
  user,
  roles,
  index = 0,
  onEdit,
  onDelete,
  onRestore,
  onAssignRole,
  isSelected,
  onSelect,
}: UserMobileCardProps) {
  const { t } = useTranslation(['users', 'common']);
  
  // Status config matches Categories
  const getStatusConfig = () => {
    if (user.isDeleted) {
      return { 
        icon: Archive, 
        color: 'text-amber-400', 
        bgColor: 'bg-amber-400/20',
        borderColor: 'border-amber-400/30'
      };
    }
    if (user.isActive) {
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
              onChange={(checked) => { onSelect(user.id, checked); }}
            />
          )}

          {/* Avatar (w-12 / 48px) */}
          <div className="w-12 h-12 flex-shrink-0">
            <Avatar src={user.avatar} name={user.name} className="w-12 h-12 rounded-full ring-2 ring-background" />
          </div>

          {/* Name & Order */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-bold text-sm">#{index + 1}</span>
              <h3 className="font-bold text-lg text-foreground truncate leading-tight">
                {user.name}
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
        {/* Email Row */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-sm">{t('users:form.email', { defaultValue: 'Email' })}:</span>
            </div>
            <span className="ml-auto text-sm font-semibold text-foreground text-right truncate max-w-[60%]">
              {user.email}
            </span>
        </div>

        {/* Roles Row */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2 min-h-[44px]">
           <div className="flex items-center gap-3 text-muted-foreground self-start mt-1">
             <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
               <Shield className="w-3.5 h-3.5 text-purple-400" />
             </div>
             <span className="text-sm">{t('users:form.role', { defaultValue: 'Role' })}:</span>
           </div>
           <div className="ml-auto flex flex-wrap justify-end gap-1 max-w-[70%]">
             {user.roles && user.roles.length > 0 ? (
               user.roles.map((roleId) => {
                 const role = roles.find(r => r.id === roleId);
                 return (
                  <Badge key={roleId} variant="secondary" className="text-xs h-6 px-2 font-medium">
                    {role ? role.name : roleId}
                  </Badge>
                 );
               })
             ) : (
               <span className="text-xs italic text-muted-foreground">{t('common:no_roles')}</span>
             )}
           </div>
        </div>
      </div>

      {/* ============ BOTTOM ACTION BUTTONS ============ */}
      <div className="flex border-t border-[#2a3142]">
        {/* Edit / Restore */}
        {!user.isDeleted ? (
          <PermissionGuard resource="users" action="update">
             <Button
               variant="ghost"
               onClick={() => { onEdit(user); }}
               className="flex-1 h-auto py-3.5 rounded-none text-muted-foreground hover:bg-[#2a3142] hover:text-muted-foreground border-r border-[#2a3142]"
             >
               <Edit2 className="w-4 h-4" />
               <span className="text-sm font-medium hidden xs:inline">{t('common:edit')}</span>
             </Button>
          </PermissionGuard>
        ) : onRestore && (
          <PermissionGuard resource="users" action="update">
             <Button
               variant="ghost"
               onClick={() => { onRestore(user.id); }}
               className="flex-1 h-auto py-3.5 rounded-none text-primary hover:bg-primary/10 hover:text-primary border-r border-[#2a3142]"
             >
               <RotateCcw className="w-4 h-4" />
               <span className="text-sm font-medium hidden xs:inline">{t('common:restore')}</span>
             </Button>
          </PermissionGuard>
        )}

        {/* Assign Role Button */}
        {!user.isDeleted && (
           <PermissionGuard resource="users" action="update">
             <Button
               variant="ghost"
               onClick={() => { onAssignRole(user); }}
               className="flex-1 h-auto py-3.5 rounded-none text-blue-400 hover:bg-blue-400/10 hover:text-blue-400 border-r border-[#2a3142]"
             >
               <Shield className="w-4 h-4" />
               <span className="text-sm font-medium hidden xs:inline">{t('users:assign_role_btn')}</span>
             </Button>
           </PermissionGuard>
        )}

        {/* Delete Button */}
        <PermissionGuard resource="users" action="delete">
           <Button
             variant="ghost"
             onClick={() => { onDelete(user.id); }}
             className={cn(
               "flex-1 h-auto py-3.5 rounded-none transition-colors",
               user.isDeleted 
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
