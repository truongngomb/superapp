import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from './Badge';
import { Checkbox } from './Checkbox';

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
  /** Whether this row is selected (shows checkbox) */
  isSelected?: boolean;
  /** Callback when selection changes */
  onSelect?: (selected: boolean) => void;
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
  onClick,
  isSelected,
  onSelect
}: DataRowProps) {
  const { t } = useTranslation('common');

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(checked);
  };

  return (
    <div style={style} className={`px-1 py-1 ${className || ''}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={onClick}
        className="card p-4 flex flex-col md:flex-row items-start md:items-center gap-4 transition-colors hover:bg-muted/5 cursor-default"
      >
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Checkbox for selection */}
          {onSelect && (
            <Checkbox
              checked={isSelected ?? false}
              onChange={handleCheckboxChange}
            />
          )}

          {/* Icon / Avatar Area */}
          {icon && (
            <div 
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgColor && !iconBgColor.includes('#') ? iconBgColor : ''}`}
              style={iconBgColor && iconBgColor.includes('#') ? { backgroundColor: iconBgColor } : undefined}
            >
              {icon}
            </div>
          )}

          {/* Title & Badges - Mobile: Next to icon, Desktop: Part of main flow */}
          <div className="md:hidden flex-1 min-w-0">
             <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-foreground truncate">{title}</h3>
                {typeof isActive === 'boolean' && !isActive && (
                  <Badge variant="danger" size="sm">{t('inactive')}</Badge>
                )}
                {badges}
             </div>
          </div>
        </div>

        {/* Main Content - Desktop: Standard flow, Mobile: Below icon */}
        <div className="flex-1 min-w-0 w-full md:w-auto pl-14 md:pl-0 -mt-2 md:mt-0">
          <div className="hidden md:flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{title}</h3>
            {typeof isActive === 'boolean' && !isActive && (
              <Badge variant="danger" size="sm">{t('inactive')}</Badge>
            )}
            {badges}
          </div>
          
          {description && (
            <p className="text-sm text-muted line-clamp-2 md:truncate mt-1 md:mt-0">{description}</p>
          )}
        </div>

        {/* Meta Info */}
        {meta && (
          <div className="hidden md:block text-sm text-muted whitespace-nowrap">
            {meta}
          </div>
        )}

        {/* Actions - Mobile: Right aligned, Desktop: Right aligned */}
        {actions && (
          <div className="flex items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
            {actions}
          </div>
        )}
      </motion.div>
    </div>
  );
}
