import { useCallback, useState, useLayoutEffect, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, Moon, Sun, X, ChevronDown, MoreVertical } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { cn } from '../utils';
import { GradientText } from '../components/GradientText';
import { IMenuItem, IHeaderProps } from '@superapp/shared-types';

export interface StandardHeaderProps extends IHeaderProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  isAuthenticated?: boolean;
  menuItems?: IMenuItem[];
  isDark?: boolean;
  onToggleTheme?: () => void;
  // Render slots for complex/app-specific components
  renderLanguageSwitcher?: () => React.ReactNode;
  renderNotifications?: () => React.ReactNode;
  renderUserActions?: () => React.ReactNode;
  
  // Translation helpers passed as props to avoid i18n dependency
  t?: (key: string, options?: Record<string, unknown>) => string;
}

const ICON_BUTTON_CLASS = 'p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer';
const ICON_CLASS = 'w-5 h-5 text-muted-foreground';

// ============================================================================
// Internal Sub-components
// ============================================================================

interface NavLinkProps {
  link: IMenuItem;
  isActive: boolean;
  label: string;
  isLinkActive: (link: IMenuItem) => boolean;
}

function NavLink({ link, isActive, label, isLinkActive }: NavLinkProps) {
  const Icon = (link.icon || (() => null)) as React.ElementType;
  const hasChildren = link.children && link.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  
  const commonClasses = cn(
    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
    'flex items-center gap-1.5',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:text-foreground hover:bg-surface',
     link.isTitle ? 'cursor-default' : 'cursor-pointer'
  );

  const content = (
    <div 
      className="relative"
      onMouseEnter={() => {setIsHovered(true)}}
      onMouseLeave={() => {setIsHovered(false)}}
    >
      {link.isTitle ? (
        <div className={commonClasses}>
           <Icon className="w-4 h-4" />
           {label}
           {hasChildren && <ChevronDown className={cn("w-3 h-3 ml-0.5 transition-transform", isHovered ? "rotate-180" : "")} />}
        </div>
      ) : (
        <div className={commonClasses}> 
        {/* Note: In ui-kit, we might want to use a generic Link or just Link from router-dom if router context exists.
            The wrapper ensures Link works. */}
          <Link
            to={link.path}
            className="flex items-center gap-1.5 w-full h-full"
          >
            <Icon className="w-4 h-4" />
            {label}
            {hasChildren && <ChevronDown className={cn("w-3 h-3 ml-0.5 transition-transform", isHovered ? "rotate-180" : "")} />}
          </Link>
        </div>
      )}
      
      {/* Submenu Dropdown */}
      {hasChildren && (
         <div className={cn(
            "absolute left-0 top-full pt-2 min-w-[12rem] w-max max-w-[18rem] z-50 transition-all duration-200 ease-in-out origin-top-left",
            isHovered 
                ? "opacity-100 translate-y-0 pointer-events-auto" 
                : "opacity-0 -translate-y-2 pointer-events-none"
         )}>
            <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden p-1 bg-white dark:bg-slate-900">
               {link.children?.map(child => {
                 const ChildIcon = (child.icon || (() => null)) as React.ElementType;
                 const isChildActive = isLinkActive(child);
                 return (
                   <Link
                      key={child.path}
                      to={child.path}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                        isChildActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-muted-foreground hover:text-foreground hover:bg-surface"
                      )}
                   >
                      <ChildIcon className={cn("w-4 h-4", isChildActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="whitespace-nowrap">{child.label}</span>
                   </Link>
                 );
               })}
            </div>
         </div>
      )}
    </div>
  );

  return content;
}

interface MoreMenuProps {
  items: IMenuItem[];
  isLinkActive: (link: IMenuItem) => boolean;
}

function MoreMenu({ items, isLinkActive }: MoreMenuProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => {setIsHovered(true)}}
      onMouseLeave={() => {setIsHovered(false)}}
    >
      <div className={cn(ICON_BUTTON_CLASS, isHovered && 'bg-surface')}>
        <MoreVertical className={cn(ICON_CLASS, items.some(isLinkActive) && "text-primary")} />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full pt-2 min-w-[14rem] w-max max-w-[20rem] z-50 origin-top-right"
          >
            <div className="bg-popover border border-border rounded-lg shadow-xl p-1 bg-white dark:bg-slate-900 ring-1 ring-black/5">
              {items.map((link) => {
                const Icon = (link.icon || (() => null)) as React.ElementType;
                const isActive = isLinkActive(link);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                      isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="whitespace-nowrap">{link.label}</span>
                    </div>
                    {link.children && link.children.length > 0 && (
                      <ChevronDown className="w-3 h-3 text-muted-foreground -rotate-90" />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DesktopNavProps {
  items: IMenuItem[];
  isLinkActive: (link: IMenuItem) => boolean;
}

function DesktopNav({ items, isLinkActive }: DesktopNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => {cancelAnimationFrame(frame)};
  }, []);

  useLayoutEffect(() => {
    if (!mounted || !containerRef.current || !measureRef.current) return;

    const calculate = () => {
      const container = containerRef.current;
      const measure = measureRef.current;
      if (!container || !measure) return;

      const containerWidth = container.offsetWidth;
      const itemElements = Array.from(measure.children) as HTMLElement[];
      const itemWidths = itemElements.map(el => el.offsetWidth + 4); // +4 for gap

      let totalWidth = 0;
      let count = items.length;
      const moreButtonWidth = 44; 

      let fitsAll = true;
      for (let i = 0; i < itemWidths.length; i++) {
        totalWidth += itemWidths[i];
        if (totalWidth > containerWidth) {
          fitsAll = false;
          break;
        }
      }

      if (!fitsAll) {
        totalWidth = moreButtonWidth;
        count = 0;
        for (let i = 0; i < itemWidths.length; i++) {
          if (totalWidth + itemWidths[i] > containerWidth) {
            break;
          }
          totalWidth += itemWidths[i];
          count++;
        }
      } else {
        count = items.length;
      }

      setVisibleCount(count);
    };

    const observer = new ResizeObserver(calculate);
    observer.observe(containerRef.current);
    calculate();

    return () => {
      observer.disconnect();
    };
  }, [items, mounted]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center gap-1 min-w-0 relative">
      {/* Hidden measurement div - always render all items here to measure their full widths */}
      <div 
        ref={measureRef} 
        className="absolute flex gap-1 invisible pointer-events-none whitespace-nowrap"
        aria-hidden="true"
        style={{ left: -9999, top: 0 }}
      >
        {items.map((link) => (
          <NavLink
            key={`measure-${link.path}`}
            link={link}
            isActive={isLinkActive(link)}
            label={link.label || ''}
            isLinkActive={isLinkActive}
          />
        ))}
      </div>

      {/* Actual visible items */}
      <div className="flex items-center gap-1 min-w-0">
        {visibleItems.map((link) => (
          <NavLink
            key={link.path}
            link={link}
            isActive={isLinkActive(link)}
            label={link.label || ''}
            isLinkActive={isLinkActive}
          />
        ))}
      </div>

      {hiddenItems.length > 0 && (
        <MoreMenu 
          items={hiddenItems} 
          isLinkActive={isLinkActive} 
        />
      )}
    </div>
  );
}

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  email?: string;
}

function UserAvatar({ avatar, name, email }: UserAvatarProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-surface">
      <Avatar src={avatar} name={name} size="sm" />
      <span className="text-sm font-medium hidden sm:inline max-w-[100px] truncate">
        {name || email || '---'}
      </span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function StandardHeader({ 
  onMenuToggle, 
  menuOpen, 
  user, 
  isAuthenticated, 
  onLogout,
  isDark,
  onToggleTheme,
  menuItems = [],
  renderLanguageSwitcher,
  renderNotifications,
  renderUserActions,
  t = (k) => k
}: StandardHeaderProps) {
  
  // Use location for active state
  const location = useLocation();

  const isLinkActive = useCallback((link: IMenuItem): boolean => {
    const checkActive = (item: IMenuItem): boolean => {
      const active = item.matchPrefix 
        ? location.pathname.startsWith(item.path)
        : location.pathname === item.path;
      
      if (active) return true;

      if (item.children) {
        return item.children.some(child => checkActive(child));
      }

      return false;
    };

    return checkActive(link);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
          >
            <span className="text-white font-bold text-lg">S</span>
          </motion.div>
          <GradientText className="text-xl font-bold hidden sm:inline">
            {t('uikit:brand')}
          </GradientText>
        </Link>

        {/* Desktop Navigation */}
      <div className="hidden md:flex flex-1 min-w-0">
        <DesktopNav 
          items={menuItems}
          isLinkActive={isLinkActive}
        />
      </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Slot: Language Switcher */}
          {renderLanguageSwitcher && renderLanguageSwitcher()}

          {/* Theme toggle */}
          {onToggleTheme && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className={ICON_BUTTON_CLASS}
              aria-label={isDark ? t('uikit:switch_theme_light') : t('uikit:switch_theme_dark')}
            >
              {isDark ? <Sun className={ICON_CLASS} /> : <Moon className={ICON_CLASS} />}
            </motion.button>
          )}

          {/* Slot: Notifications */}
          {isAuthenticated && renderNotifications && renderNotifications()}

          {/* Auth section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
               {/* Note: NotificationCenter logic moved to renderNotifications slot */}
               
              <UserAvatar avatar={user.avatar} name={user.name} email={user.email} />
              
              {renderUserActions ? renderUserActions() : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className={cn(ICON_BUTTON_CLASS, 'text-muted-foreground hover:text-red-500')}
                  aria-label={t('uikit:logout')}
                  title={t('uikit:logout')}
                >
                  <LogOut className={ICON_CLASS} />
                </motion.button>
              )}
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t('uikit:login')}
              </motion.button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onMenuToggle}
            className={cn(ICON_BUTTON_CLASS, 'md:hidden')}
            aria-label={t('uikit:toggle_menu')}
          >
            {menuOpen ? <X className={ICON_CLASS} /> : <Menu className={ICON_CLASS} />}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
