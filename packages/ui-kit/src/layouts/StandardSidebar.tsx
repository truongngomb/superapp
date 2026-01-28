import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../components/Button';
import { GradientText } from '../components/GradientText';
import { ISidebarProps } from '@superapp/shared-types';

export function StandardSidebar({ open, onClose, items, currentPath, t = (k) => k }: ISidebarProps) {
  
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
                <GradientText className="text-xl font-bold">{t('uikit:brand')}</GradientText>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 h-9 w-9"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {items.map((item) => {
                const Icon = (item.icon || (() => null)) as React.ElementType;
                const isActive = item.matchPrefix 
                  ? currentPath.startsWith(item.path)
                  : currentPath === item.path;

                let link;
                
                if (item.isTitle) {
                   link = (
                      <div key={item.path} className="px-4 py-2 mt-4 mb-2 text-xs font-bold text-muted-foreground tracking-wider cursor-default">
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
                            : 'text-muted-foreground hover:text-foreground hover:bg-surface'
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

                // Render Children
                const content = (
                  <div key={item.path}>
                    {link}
                    {item.children && item.children.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                        {item.children.map(child => {
                          const ChildIcon = (child.icon || (() => null)) as React.ElementType;
                          const isChildActive = currentPath === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={onClose}
                              className={cn(
                                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                                isChildActive
                                  ? 'text-primary font-medium'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                              )}
                            >
                              <ChildIcon className="w-5 h-5" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );

                // Note: Permission wrapping is handled by parent (filtering items)
                return content;
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
