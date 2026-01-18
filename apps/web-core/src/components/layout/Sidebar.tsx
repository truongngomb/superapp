import { Link, useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/common';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useAppMenu } from '@/hooks';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  // const { t } = useTranslation(['common', 'users', 'roles', 'categories', 'home', 'auth']);
  const location = useLocation();
  const { menuItems } = useAppMenu();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 z-50 h-full w-72 bg-background border-r border-border shadow-xl md:hidden safe-area-top safe-area-bottom safe-area-left"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-gradient">SuperApp</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 h-9 w-9"
              >
                <X className="w-5 h-5 text-muted" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.matchPrefix 
                  ? location.pathname.startsWith(item.path)
                  : location.pathname === item.path;

                let link;
                
                if (item.isTitle) {
                   link = (
                      <div key={item.path} className="px-4 py-2 mt-4 mb-2 text-xs font-bold text-muted uppercase tracking-wider cursor-default">
                         {item.label}
                      </div>
                   );
                } else {
                    link = (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted hover:text-foreground hover:bg-surface'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-indicator"
                            className="absolute left-0 w-1 h-8 rounded-r-full bg-primary"
                          />
                        )}
                      </Link>
                    );
                }

                const content = (
                  <div key={item.path}>
                    {link}
                    {/* Render Children */}
                    {item.children && item.children.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                        {item.children.map(child => {
                          const ChildIcon = child.icon;
                          const isChildActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={onClose}
                              className={cn(
                                'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                                isChildActive
                                  ? 'text-primary font-medium'
                                  : 'text-muted hover:text-foreground hover:bg-surface'
                              )}
                            >
                              <ChildIcon className="w-4 h-4" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );

                if (item.permission) {
                  return (
                    <PermissionGuard
                      key={item.path}
                      resource={item.permission.resource}
                      action={item.permission.action}
                    >
                      {content}
                    </PermissionGuard>
                  );
                }

                return content;
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
