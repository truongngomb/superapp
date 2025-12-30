/**
 * Modal Component
 * Reusable modal with fixed header/footer and scrollable content
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

// ============================================================================
// Types
// ============================================================================

interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: ReactNode;
  /** Maximum width of modal (default: "md") */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show close button in header (default: true) */
  showCloseButton?: boolean;
  /** Whether to auto-focus first input (default: true) */
  autoFocus?: boolean;
  /** Additional class for the modal container */
  className?: string;
}

// ============================================================================
// Size mappings
// ============================================================================

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

// ============================================================================
// Component
// ============================================================================

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  autoFocus = true,
  className = '',
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen && autoFocus) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        const firstInput = contentRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not(:disabled), textarea:not(:disabled)'
        );
        if (firstInput) {
          firstInput.focus();
          // Move cursor to end for text inputs
          if ('setSelectionRange' in firstInput && firstInput.value) {
            const len = firstInput.value.length;
            firstInput.setSelectionRange(len, len);
          }
        }
      }, 100);
      return () => { clearTimeout(timer); };
    }
  }, [isOpen, autoFocus]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('keydown', handleEscape); };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); }}
            className={`w-full ${sizeClasses[size]} ${className}`}
          >
            <Card className="flex flex-col max-h-[90vh]">
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <h2 className="text-xl font-bold text-foreground">
                  {title}
                </h2>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="p-1"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Scrollable Content */}
              <div ref={contentRef} className="flex-1 overflow-y-auto p-4">
                {children}
              </div>

              {/* Fixed Footer */}
              {footer && (
                <div className="p-4 border-t border-border shrink-0">
                  {footer}
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
