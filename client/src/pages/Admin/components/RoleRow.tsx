import { motion } from 'framer-motion';
import { Shield, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Role } from '@/types';
import { Button } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';

interface RoleRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (id: string) => void;
  };
}

export function RoleRow({ index, style, data }: RoleRowProps) {
  const { t } = useTranslation(['roles', 'common']);
  const role = data.roles[index];
  if (!role) return null;

  return (
    <div style={style} className="px-1 py-1">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-4 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{role.name}</h3>
          <p className="text-sm text-muted truncate">{role.description}</p>
          <div className="mt-1 text-xs text-muted">
            {Object.entries(role.permissions).filter(([, actions]) => actions.length > 0).length} {t('roles:resources_configured')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard resource="roles" action="update">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); data.onEdit(role); }}
              aria-label={t('common:edit')}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard resource="roles" action="delete">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); data.onDelete(role.id); }}
              aria-label={t('common:delete')}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </PermissionGuard>
        </div>
      </motion.div>
    </div>
  );
}
