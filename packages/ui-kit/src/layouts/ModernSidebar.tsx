import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../components/Button';
import { ISidebarProps } from '@superapp/shared-types';

export interface ModernSidebarProps extends ISidebarProps {
  desktopOpen?: boolean;
  className?: string;
  user?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
  footerText?: React.ReactNode;
  t?: (key: string, options?: Record<string, unknown>) => string;
}

export function ModernSidebar({ 
  open, 
  onClose, 
  className, 
  desktopOpen = true,
  items,
  user,
  currentPath,
  footerText,
  t = (k) => k
}: ModernSidebarProps) {

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
              <h3 className="text-lg font-bold text-foreground text-center">{user?.name || t('uikit:unknown_user')}</h3>
              <p className="text-sm text-muted-foreground text-center uppercase tracking-wider mt-1">
                {user?.role || t('uikit:role')}
              </p>
           </div>

           {/* Navigation */}
           <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              {items.map((item) => {
                  const Icon = (item.icon || (() => null)) as React.ElementType;
                 const isActive = item.matchPrefix 
                   ? currentPath.startsWith(item.path)
                   : currentPath === item.path;
                   
                 let link;
                 
                 if (item.isTitle) {
                    link = (
                        <div key={item.path} className="px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 text-muted-foreground hover:text-foreground hover:bg-surface">
                           <Icon className="w-5 h-5" />
                           <span className='truncate'>{item.label}</span>
                        </div>
                    );
                 } else {
                     link = (
                       <Link
                         key={item.path}
                         to={item.path}
                         onClick={() => { if(typeof window !== 'undefined' && window.innerWidth < 1024) onClose?.(); }}
                         className={cn(
                           'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                           'flex items-center gap-3',
                           isActive
                             ? 'bg-primary/10 text-primary'
                             : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                         )}
                       >
                         <Icon className="w-5 h-5" />
                         <span className="truncate">{item.label}</span>
                       </Link>
                     );
                 }

                 return (
                   <div key={item.path}>
                     {link}
                     {/* Render Children (Level 2) - Indented */}
                     {item.children && item.children.length > 0 && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                          {item.children.map(child => {
                            const ChildIcon = (child.icon || (() => null)) as React.ElementType;
                            const isChildActive = currentPath === child.path;
                            return (
                              <Link
                                key={child.path}
                                to={child.path}
                                onClick={() => { if(typeof window !== 'undefined' && window.innerWidth < 1024) onClose?.(); }}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                                  isChildActive
                                    ? 'text-primary font-medium bg-primary/5'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                                )}
                              >
                                <ChildIcon className="w-4 h-4" />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                     )}
                   </div>
                 );
              })}
           </nav>
           
           {/* Footer */}
           <div className="p-2 border-t border-border text-center">
              <div className="text-xs text-muted-foreground leading-tight">
                 {footerText || (
                   <>
                      <div>{t('uikit:brand')} {t('uikit:admin')}</div>
                      <div>{t('uikit:version')}</div>
                   </>
                 )}
              </div>
           </div>
        </div>
      </aside>
    </>
  );
}
