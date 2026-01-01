import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from './Badge';

interface DataRowProps {
  style?: React.CSSProperties;
  className?: string;
  icon?: React.ReactNode;
  iconBgColor?: string; // e.g. 'bg-primary/10' or raw hex with opacity if style used
  title: React.ReactNode;
  description?: React.ReactNode;
  badges?: React.ReactNode;
  isActive?: boolean; // If provided, shows Active/Inactive badge
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export function DataRow({
  style,
  className,
  icon,
  iconBgColor,
  title,
  description,
  badges,
  isActive,
  meta,
  actions,
  onClick
}: DataRowProps) {
  const { t } = useTranslation('common');

  return (
    <div style={style} className={`px-1 py-1 ${className || ''}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={onClick}
        className="card p-4 flex items-center gap-4 transition-colors hover:bg-muted/5 cursor-default"
      >
        {/* Icon / Avatar Area */}
        {icon && (
          <div 
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgColor && !iconBgColor.includes('#') ? iconBgColor : ''}`}
            style={iconBgColor && iconBgColor.includes('#') ? { backgroundColor: iconBgColor } : undefined}
          >
            {/* If icon is a raw node with its own styling, it renders here. 
                If we need to apply color prop to the icon, the caller should do it or we cloneElement (simpler to let caller handle) */}
            {icon}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{title}</h3>
            
            {/* Status Badge */}
            {typeof isActive === 'boolean' && !isActive && (
              <Badge variant="danger" size="sm">{t('inactive')}</Badge>
            )}
            
            {/* Custom Badges (e.g. Roles) */}
            {badges}
          </div>
          
          {description && (
            <p className="text-sm text-muted truncate">{description}</p>
          )}
        </div>

        {/* Meta Info (e.g. Date) - Hidden on small screens usually */}
        {meta && (
          <div className="hidden md:block text-sm text-muted whitespace-nowrap">
            {meta}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </motion.div>
    </div>
  );
}
