/**
 * Header Component
 * Application header with navigation, theme toggle, and user menu
 */

import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import { cn } from '@/utils';
import { useAuth, useActivityLogContext } from '@/hooks';
import { useTheme } from '@/context';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { PermissionGuard } from '../common/PermissionGuard';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Bell } from 'lucide-react';
import { useAppMenu } from '@/hooks';

// ============================================================================
// ============================================================================
// Types
import type { AppMenuItem } from '@/hooks';

interface HeaderProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const ICON_BUTTON_CLASS = 'p-2 rounded-lg hover:bg-surface transition-colors';
const ICON_CLASS = 'w-5 h-5 text-muted';

// ============================================================================
// Sub-components
// ============================================================================

interface NavLinkProps {
  link: AppMenuItem;
  isActive: boolean;
  label: string;
}

function NavLink({ link, isActive, label }: NavLinkProps) {
  const Icon = link.icon;
  
  if (link.isTitle) {
    return (
       <div className={cn(
          'px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 mb-1 cursor-default',
          'flex items-center gap-1.5'
       )}>
          <span className="truncate">{label}</span>
       </div>
    );
  }

  const content = (
    <Link
      to={link.path}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        'flex items-center gap-1.5',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:text-foreground hover:bg-surface'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );

  // Wrap with PermissionGuard if permission is defined
  if (link.permission) {
    return (
      <PermissionGuard resource={link.permission.resource} action={link.permission.action}>
        {content}
      </PermissionGuard>
    );
  }

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
        {name || email}
      </span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Header({ onMenuToggle, menuOpen }: HeaderProps) {
  const { t } = useTranslation(['common', 'users', 'roles', 'categories', 'home', 'auth']);
  /* Hook extracts */
  const location = useLocation();
  // navigate removed as we use window.location.href for logout
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useActivityLogContext();
  const { menuItems } = useAppMenu();

  const handleLogout = useCallback(() => {
    void logout()
      .catch(() => { /* Ignore logout errors */ })
      .finally(() => {
        // Force full reload to verify maintenance status (for Guest)
        window.location.href = '/';
      });
  }, [logout]);

  const isLinkActive = useCallback((link: AppMenuItem) => {
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
            SuperApp
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isLoading ? (
            // Skeleton Loading State
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-lg bg-muted/20 animate-pulse"
              />
            ))
          ) : (
            menuItems.map((link) => (
              <NavLink
                key={link.path}
                link={link}
                isActive={isLinkActive(link)}
                label={link.label}
              />
            ))
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Theme toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={ICON_BUTTON_CLASS}
            aria-label={isDark ? t('switch_theme_light') : t('switch_theme_dark')}
          >
            {isDark ? <Sun className={ICON_CLASS} /> : <Moon className={ICON_CLASS} />}
          </motion.button>

          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => { setIsNotificationsOpen(true); }}
                className={ICON_BUTTON_CLASS}
                aria-label={t('toggle_notifications', 'Thông báo')}
              >
                <Bell className={ICON_CLASS} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>
            </div>
          )}

          {/* Auth section */}
          {isLoading ? (
            // Skeleton User State
            <div className="flex items-center gap-2 px-2">
              <div className="h-8 w-8 rounded-full bg-muted/20 animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted/20 animate-pulse hidden sm:block" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <NotificationCenter
                isOpen={isNotificationsOpen}
                onClose={() => { setIsNotificationsOpen(false); }}
              />
              <UserAvatar avatar={user.avatar} name={user.name} email={user.email} />
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => { handleLogout(); }}
                className={cn(ICON_BUTTON_CLASS, 'text-muted hover:text-red-500')}
                aria-label={t('logout')}
                title={t('logout')}
              >
                <LogOut className={ICON_CLASS} />
              </motion.button>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t('login')}
              </motion.button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onMenuToggle}
            className={cn(ICON_BUTTON_CLASS, 'md:hidden')}
            aria-label={t('toggle_menu')}
          >
            {menuOpen ? <X className={ICON_CLASS} /> : <Menu className={ICON_CLASS} />}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
