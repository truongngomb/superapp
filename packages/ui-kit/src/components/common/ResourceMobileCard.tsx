import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Archive, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../utils';
import { Checkbox } from '../Checkbox';
import { Button } from '../Button';

export interface ResourceInfoRow {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export interface ResourceAction {
  icon: LucideIcon;
  label?: string;
  onClick: () => void;
  variant?: 'ghost' | 'outline' | 'primary' | 'danger' | 'secondary';
  className?: string;
  showOnMobile?: boolean; // Whether to show text label on small mobile
  permission?: {
    resource: string;
    action: string;
  };
  iconColor?: string;
}

interface ResourceMobileCardProps {
  id: string;
  index: number;
  title: ReactNode;
  icon?: ReactNode; // Can be a LucideIcon component or a custom element like Avatar
  status?: {
    isActive?: boolean;
    isDeleted?: boolean;
  };
  infoRows?: ResourceInfoRow[];
  actions?: ResourceAction[];
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  className?: string;
  /** Custom Status Config (optional override) */
  statusConfig?: {
    icon: LucideIcon;
    color: string;
    bgColor: string;
  };
}

export function ResourceMobileCard({
  id,
  index,
  title,
  icon,
  status,
  infoRows = [],
  actions = [],
  isSelected,
  onSelect,
  className,
  statusConfig: customStatusConfig,
}: ResourceMobileCardProps) {
  
  // Default status mapping
  const getStatusConfig = () => {
    if (customStatusConfig) return customStatusConfig;
    
    if (status?.isDeleted) {
      return { 
        icon: Archive, 
        color: 'text-amber-400', 
        bgColor: 'bg-amber-400/20',
      };
    }
    if (status?.isActive) {
      return { 
        icon: CheckCircle2, 
        color: 'text-emerald-400', 
        bgColor: 'bg-emerald-400/20',
      };
    }
    return { 
      icon: XCircle, 
      color: 'text-red-400', 
      bgColor: 'bg-red-400/20',
    };
  };
  
  const statusCfg = getStatusConfig();
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "card border shadow-xl bg-card text-card-foreground overflow-hidden",
        isSelected && "ring-2 ring-primary",
        className
      )}
    >
      {/* ============ HEADER SECTION ============ */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Selection Checkbox */}
          {onSelect && (
            <Checkbox
              checked={isSelected ?? false}
              onChange={(checked: boolean) => { onSelect(id, checked); }}
            />
          )}

          {/* Icon/Avatar Area */}
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}

          {/* Title Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-bold text-sm">#{index + 1}</span>
              <div className="font-bold text-lg text-foreground truncate leading-tight">
                {title}
              </div>
            </div>
          </div>

          {/* Status Icon */}
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <StatusIcon className={cn("w-6 h-6", statusCfg.color)} />
          </div>
        </div>
      </div>

      {/* ============ INFO ROWS SECTION ============ */}
      <div className="mx-4 mb-4 space-y-2">
        {infoRows.map((row, idx) => (
          <div key={idx} className="flex items-center bg-muted/30 rounded p-2">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                row.iconBgColor || "bg-primary/10"
              )}>
                <row.icon className={cn("w-3.5 h-3.5", row.iconColor || "text-primary")} />
              </div>
              <span className="text-sm">{row.label}:</span>
            </div>
            <div className="ml-auto text-sm font-semibold text-foreground text-right truncate max-w-[60%]">
              {row.value}
            </div>
          </div>
        ))}
      </div>

      {/* ============ BOTTOM ACTION BUTTONS ============ */}
      {actions.length > 0 && (
        <div className="flex border-t border-border bg-muted/10">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant="ghost"
              onClick={action.onClick}
              className={cn(
                "flex-1 h-auto py-3.5 rounded-none border-r last:border-r-0 border-border",
                action.variant === 'danger' && "text-red-500 hover:bg-red-500/10 hover:text-red-600",
                action.variant === 'primary' && "text-primary hover:bg-primary/10 hover:text-primary",
                action.variant === 'secondary' && "text-muted-foreground hover:bg-muted/50",
                action.className
              )}
            >
              <action.icon className={cn("w-4 h-4", action.iconColor)} />
              {action.label && (
                <span className={cn(
                  "text-sm font-medium ml-2",
                  !action.showOnMobile && "hidden xs:inline"
                )}>
                  {action.label}
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
