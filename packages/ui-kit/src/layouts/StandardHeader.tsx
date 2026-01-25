import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu, Moon, Sun, User, X, ChevronDown } from 'lucide-react';
import { cn } from '../utils';
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
const ICON_CLASS = 'w-5 h-5 text-muted';

// ============================================================================
// Internal Sub-components
// ============================================================================

interface NavLinkProps {
  link: IMenuItem;
  isActive: boolean;
  label: string;
}

function NavLink({ link, isActive, label }: NavLinkProps) {
  const Icon = (link.icon || (() => null)) as React.ElementType;
  const hasChildren = link.children && link.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  
  const commonClasses = cn(
    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
    'flex items-center gap-1.5',
    isActive && !link.isTitle
      ? 'bg-primary/10 text-primary'
      : 'text-muted hover:text-foreground hover:bg-surface',
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
            "absolute left-0 top-full pt-2 w-48 z-50 transition-all duration-200 ease-in-out origin-top-left",
            isHovered 
                ? "opacity-100 translate-y-0 pointer-events-auto" 
                : "opacity-0 -translate-y-2 pointer-events-none"
         )}>
            <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden p-1 bg-white dark:bg-slate-900">
               {link.children?.map(child => {
                 const ChildIcon = (child.icon || (() => null)) as React.ElementType;
                 return (
                   <Link
                      key={child.path}
                      to={child.path}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors"
                   >
                      <ChildIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{child.label}</span>
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

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  email?: string;
}

function UserAvatar({ avatar, name, email }: UserAvatarProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-surface">
      {avatar ? (
        <img
          src={avatar}
          alt={name || 'User'}
          className="w-7 h-7 rounded-full object-cover"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      )}
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

  const isLinkActive = useCallback((link: IMenuItem) => {
    if (link.matchPrefix) {
      return location.pathname.startsWith(link.path);
    }
    return location.pathname === link.path;
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
          <span className="text-xl font-bold text-gradient hidden sm:inline">
            {t('uikit:brand')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((link) => (
            <NavLink
              key={link.path}
              link={link}
              isActive={isLinkActive(link)}
              label={link.label}
            />
          ))}
        </nav>

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
                  className={cn(ICON_BUTTON_CLASS, 'text-muted hover:text-red-500')}
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
