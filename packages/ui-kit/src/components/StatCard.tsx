import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { cn } from '../utils';
import { Card, CardContent } from './Card';

export interface StatCardProps {
  /** The main value to display */
  value: string | number;
  /** Label for the stat */
  label: string;
  /** Description text */
  description?: string;
  /** Icon component */
  icon?: LucideIcon | React.ReactNode;
  /** Gradient color classes (e.g. 'from-blue-500 to-blue-600') */
  color?: string;
  /** Optional trend icon (pass null to hide) */
  trendIcon?: LucideIcon | null;
  /** Optional click handler or link behavior */
  onClick?: () => void;
  /** Additional classes */
  className?: string;
  /** Animation delay */
  delay?: number;
}

/**
 * Standardized Statistic Card for Dashboards.
 */
export function StatCard({
  value,
  label,
  description,
  icon,
  color = 'from-primary to-primary/80',
  trendIcon,
  onClick,
  className,
  delay = 0,
}: StatCardProps) {
  const Icon = icon as React.ElementType;
  const TrendIcon = trendIcon === undefined ? TrendingUp : trendIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn("h-full", className)}
    >
      <Card 
        className={cn(
          "hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden h-full",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        <CardContent className="p-0 h-full flex flex-col">
          <div className="flex items-start gap-4 p-5 flex-1">
            <div className={cn(
               "p-3 rounded-xl bg-gradient-to-br text-white shadow-lg mt-1",
               color
            )}>
              {icon && (typeof icon === 'function' || (typeof icon === 'object' && !React.isValidElement(icon))) ? <Icon className="w-6 h-6" /> : icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {TrendIcon && <TrendIcon className="w-5 h-5 text-muted-foreground shrink-0" />}
          </div>
          <div className={cn("h-1 bg-gradient-to-r", color)} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
