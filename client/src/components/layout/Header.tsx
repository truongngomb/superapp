/**
 * Header Component
 * Application header with navigation, theme toggle, and user menu
 */

import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LogOut, Menu, Moon, Sun, User, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/hooks';
import { useTheme } from '@/context';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { PermissionGuard } from '../common/PermissionGuard';

// ============================================================================
// Types
// ============================================================================

interface HeaderProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

interface NavLinkItem {
  path: string;
  labelKey: string;
  icon?: LucideIcon;
  /** If true, check permission before showing */
  permission?: { resource: string; action: string };
  /** Match path prefix instead of exact match */
  matchPrefix?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const NAV_LINKS = [
  { path: '/', labelKey: 'home'},
  { path: '/categories', labelKey: 'categories' },
  { 
    path: '/admin/dashboard', 
    labelKey: 'admin', 
    permission: { resource: 'roles', action: 'read' },
    matchPrefix: true,
  },
] as const;

const ICON_BUTTON_CLASS = 'p-2 rounded-lg hover:bg-surface transition-colors';
const ICON_CLASS = 'w-5 h-5 text-muted';

// ============================================================================
// Sub-components
// ============================================================================

interface NavLinkProps {
  link: NavLinkItem;
  isActive: boolean;
  label: string;
}

function NavLink({ link, isActive, label }: NavLinkProps) {
  const Icon = link.icon;
  const content = (
    <Link
      to={link.path}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        Icon && 'flex items-center gap-1.5',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:text-foreground hover:bg-surface'
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
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
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = useCallback(() => {
    void logout()
      .catch(() => { /* Ignore logout errors */ })
      .then(() => { void navigate('/'); });
  }, [logout, navigate]);

  const isLinkActive = useCallback((link: NavLinkItem) => {
    if (link.matchPrefix) {
      return location.pathname.startsWith(link.path.split('/').slice(0, -1).join('/') || link.path);
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
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              link={link}
              isActive={isLinkActive(link)}
              label={t(link.labelKey)}
            />
          ))}
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

          {/* Auth section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <UserAvatar avatar={user.avatar} name={user.name} email={user.email} />
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
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
