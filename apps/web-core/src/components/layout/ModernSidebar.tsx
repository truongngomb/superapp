/**
 * Modern Sidebar Component
 * Sidebar with profile card at top and vertical navigation
 */

import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { cn } from '@/utils';
import { NAVIGATION_ITEMS } from '@/config/navigation';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useAuth } from '@/hooks';
import { Button } from '@/components/common';

interface ModernSidebarProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  desktopOpen?: boolean;
}

export function ModernSidebar({ open, onClose, className, desktopOpen = true }: ModernSidebarProps) {
  const { t } = useTranslation(['common', 'users', 'roles', 'categories', 'home', 'auth']);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {open && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
           />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-muted/30 shadow-sm transition-[width,transform] duration-300 ease-in-out lg:z-0 lg:h-[calc(100vh-4rem)] border-r border-border",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop behavior: use width transition for push effect, removing transform
          desktopOpen ? "lg:translate-x-0 lg:static lg:w-72" : "lg:translate-x-0 lg:static lg:w-0 lg:border-r-0 lg:overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col h-full w-72 overflow-hidden bg-gradient-to-b from-background to-surface/50">
           {/* Mobile Header (Close Button) */}
            <div className="lg:hidden flex items-center justify-end p-2">
               <Button variant="ghost" size="sm" onClick={onClose} className="p-2 text-muted-foreground h-9 w-9">
                  <X className="w-5 h-5" />
               </Button>
            </div>

           {/* User Profile Card (Prominent) */}
           <div className="p-6 flex flex-col items-center border-b border-border">
              <div className="relative w-24 h-24 mb-4">
                 <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-4 ring-background shadow-lg">
                    {user?.avatar ? (
                       <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                       <User className="w-10 h-10 text-primary" />
                    )}
                 </div>
                 <div className="absolute bottom-0 right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
              <h3 className="text-lg font-bold text-foreground text-center">{user?.name || 'User'}</h3>
              <p className="text-sm text-muted-foreground text-center uppercase tracking-wider mt-1">{t('auth:role.admin', { defaultValue: 'Admin' })}</p>
           </div>

           {/* Navigation */}
           <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              {NAVIGATION_ITEMS.map((item) => {
                 const Icon = item.icon;
                 const isActive = item.matchPrefix 
                   ? location.pathname.startsWith(item.path)
                   : location.pathname === item.path;

                 const link = (
                   <Link
                     key={item.path}
                     to={item.path}
                     onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                     className={cn(
                       'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                       'flex items-center gap-3',
                       isActive
                         ? 'bg-primary/10 text-primary'
                         : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                     )}
                   >
                     <Icon className="w-5 h-5" />
                     {t(item.labelKey)}
                   </Link>
                 );

                 if (item.permission) {
                   return (
                     <PermissionGuard
                       key={item.path}
                       resource={item.permission.resource}
                       action={item.permission.action}
                     >
                       {link}
                     </PermissionGuard>
                   );
                 }

                 return link;
              })}
           </nav>
           
           {/* Footer */}
           <div className="p-2 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                 © 2026 Admin Portal<br/>v1.0.0
              </p>
           </div>
        </div>
      </aside>
    </>
  );
}
