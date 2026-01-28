import { useMemo, useEffect, useRef, useState, useLayoutEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Users, Shield, LayoutDashboard, FileClock, Settings, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { APP_NAME } from '@/config/constants';
import { useLayout, useLayoutMode, useDocumentTitle } from '@superapp/core-logic';
import { PermissionGuard } from '@superapp/ui-kit';

// ============================================================================
// Types
// ============================================================================

const ICON_BUTTON_CLASS = 'p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer flex items-center justify-center shrink-0';
const ICON_CLASS = 'w-5 h-5 text-muted-foreground';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  resource: string;
}

// ============================================================================
// Internal Sub-components (Following StandardHeader Architecture)
// ============================================================================

interface MoreMenuProps {
  items: NavItem[];
  locationPathname: string;
}

function MoreMenu({ items, locationPathname }: MoreMenuProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative shrink-0"
      onMouseEnter={() => { setIsHovered(true); }}
      onMouseLeave={() => { setIsHovered(false); }}
    >
      <div className={cn(ICON_BUTTON_CLASS, isHovered && 'bg-surface')}>
        <MoreVertical className={cn(
          ICON_CLASS,
          items.some(item => locationPathname.startsWith(item.to)) && "text-primary"
        )} />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full pt-2 w-56 z-50 origin-top-right"
          >
            <div className="bg-popover border border-border rounded-lg shadow-xl p-1 dark:bg-slate-900 ring-1 ring-black/5">
              {items.map((item) => {
                const isActive = locationPathname.startsWith(item.to);
                return (
                  <PermissionGuard key={item.to} resource={item.resource} action="view">
                    <NavLink
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                        isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-surface"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.icon}
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>
                    </NavLink>
                  </PermissionGuard>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ResponsiveAdminNavProps {
  items: NavItem[];
  itemClassName: (isActive: boolean) => string;
  layoutMode?: string;
}

function ResponsiveAdminNav({ items, itemClassName, layoutMode }: ResponsiveAdminNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => { cancelAnimationFrame(frame) };
  }, []);

  useLayoutEffect(() => {
    if (!mounted || !containerRef.current || !measureRef.current) return;

    const calculate = () => {
      const container = containerRef.current;
      const measure = measureRef.current;
      if (!container || !measure) return;

      const containerWidth = container.getBoundingClientRect().width;
      
      // CRITICAL: If container has no width yet, don't calculate or we'll hide everything.
      // Wait for the next resize observer trigger when the element is actually laid out.
      if (containerWidth === 0) return;

      const itemElements = Array.from(measure.children) as HTMLElement[];
      const itemWidths = itemElements.map(el => el.getBoundingClientRect().width);

      let totalWidth = 0;
      let count = items.length;
      const moreButtonWidth = 44; 

      let fitsAll = true;
      for (let i = 0; i < itemWidths.length; i++) {
        const itemWidth = itemWidths[i] || 0;
        if (itemWidth === 0) continue; 
        
        totalWidth += itemWidth + 4; // gap
        if (totalWidth > containerWidth) {
          fitsAll = false;
          break;
        }
      }

      if (!fitsAll) {
        totalWidth = moreButtonWidth;
        count = 0;
        for (let i = 0; i < itemWidths.length; i++) {
          const itemWidth = itemWidths[i] || 0;
          if (itemWidth === 0) {
            count = i + 1;
            continue;
          }

          if (totalWidth + itemWidth + 4 > containerWidth) {
            break;
          }
          totalWidth += itemWidth + 4;
          count = i + 1;
        }
      }

      setVisibleCount(count);
    };

    const observer = new ResizeObserver(calculate);
    observer.observe(containerRef.current);
    calculate();

    return () => { observer.disconnect() };
  }, [mounted, items]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center gap-1 min-w-0 h-full w-full">
      {/* Actual Navigation Items */}
      <div className="flex items-center gap-1 min-w-0">
        {visibleItems.map((item) => (
          <PermissionGuard key={item.to} resource={item.resource} action="view">
            <NavLink
              to={item.to}
              className={({ isActive }) => itemClassName(isActive)}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </NavLink>
          </PermissionGuard>
        ))}
      </div>
        
      {hiddenItems.length > 0 && (
        <MoreMenu items={hiddenItems} locationPathname={location.pathname} />
      )}

      {/* Measurement Div - Mimic actual items perfectly */}
      <div 
        ref={measureRef}
        className="absolute invisible pointer-events-none flex gap-1 whitespace-nowrap"
        aria-hidden="true"
        style={{ left: -9999, top: 0 }}
      >
        {items.map((item) => (
          <div key={item.to} className="shrink-0 flex items-center">
            <PermissionGuard resource={item.resource} action="view">
               <div className={cn(
                  "flex items-center gap-2 font-medium whitespace-nowrap",
                  layoutMode === 'modern' ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm"
               )}>
                {item.icon}
                {item.label}
              </div>
            </PermissionGuard>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AdminLayout() {
  const { t } = useTranslation(['uikit', 'users', 'roles', 'activity_logs']);
  const layoutMode = useLayoutMode();
  const { setHeaderContent } = useLayout();

  const navItems: NavItem[] = useMemo(() => [
    {
      to: '/admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: t('uikit:admin_dashboard.dashboard'),
      resource: 'dashboard',
    },
    {
      to: '/admin/settings',
      icon: <Settings className="w-4 h-4" />,
      label: t('uikit:settings'),
      resource: 'all',
    },
    {
      to: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      label: t('users:entities'),
      resource: 'users',
    },
    {
      to: '/admin/roles',
      icon: <Shield className="w-4 h-4" />,
      label: t('roles:entities'),
      resource: 'roles',
    },
    {
      to: '/admin/activity-logs',
      icon: <FileClock className="w-4 h-4" />,
      label: t('activity_logs:entities'),
      resource: 'activity_logs',
    },
  ], [t]);

  const { pathname } = useLocation();

  const title = useMemo(() => {
    // Exact match logic for admin sub-pages
    const item = navItems.find(item => pathname === item.to);
    if (item) {
      return `${item.label} | ${APP_NAME}`;
    }
    return null;
  }, [pathname, navItems]);

  useDocumentTitle(title);

  useEffect(() => {
    if (layoutMode === 'modern') {
      setHeaderContent(
        <ResponsiveAdminNav 
          items={navItems}
          layoutMode={layoutMode}
          itemClassName={(isActive) => cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted/20 hover:text-foreground'
          )}
        />
      );
    } else {
      setHeaderContent(null);
    }
    
    return () => {
      setHeaderContent(null);
    };
  }, [layoutMode, navItems, setHeaderContent]);

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs - Only show in non-modern layout */}
      {layoutMode !== 'modern' && (
        <div className="flex items-center p-1 bg-muted/30 rounded-lg w-full transition-all border border-border/50">
          <ResponsiveAdminNav 
            items={navItems}
            layoutMode={layoutMode}
            itemClassName={(isActive) => cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              'hover:bg-background/80',
              isActive
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground'
            )}
          />
        </div>
      )}

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
