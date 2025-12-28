/**
 * Header Component
 * Application header with navigation, theme toggle, and user menu
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/hooks';
import { useTheme } from '@/context';

// ============================================================================
// Types
// ============================================================================

interface HeaderProps {
  /** Callback when mobile menu toggle is clicked */
  onMenuToggle?: () => void;
  /** Whether mobile menu is open */
  menuOpen?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/categories', label: 'Categories' },
] as const;

// ============================================================================
// Component
// ============================================================================

export function Header({ onMenuToggle, menuOpen }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    void logout()
      .catch(() => { /* Ignore logout errors */ })
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        navigate('/');
      });
  };

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
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === link.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-muted" />
            ) : (
              <Moon className="w-5 h-5 text-muted" />
            )}
          </motion.button>

          {/* Auth buttons */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* User avatar */}
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-surface">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:inline max-w-[100px] truncate">
                  {user.name || user.email}
                </span>
              </div>
              {/* Logout button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-red-500"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Login
              </motion.button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-surface transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-muted" />
            ) : (
              <Menu className="w-5 h-5 text-muted" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
