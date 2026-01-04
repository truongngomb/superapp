/**
 * ConfirmModal Component
 * Reusable modal for confirming actions like delete
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Card, CardContent } from './Card';

// ============================================================================
// Types
// ============================================================================

interface ConfirmModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Title of the modal */
  title: string;
  /** Description/message to display */
  message: string;
  /** Text for confirm button (default: "Delete") */
  confirmText?: string;
  /** Text for cancel button (default: "Cancel") */
  cancelText?: string;
  /** Whether confirm action is in progress */
  loading?: boolean;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Variant for styling (default: "danger") */
  variant?: 'danger' | 'warning' | 'info';
}

// ============================================================================
// Component
// ============================================================================

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  loading = false,
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) {
  const { t } = useTranslation('common');
  const finalConfirmText = confirmText || t('delete');
  const finalCancelText = cancelText || t('cancel');

  const iconColorClass = {
    danger: 'text-red-500 bg-red-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    info: 'text-blue-500 bg-blue-500/10',
  }[variant];

  const confirmButtonClass = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-blue-500 hover:bg-blue-600 text-white',
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); }}
            className="w-full max-w-md"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColorClass}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {title}
                  </h2>
                  <p className="text-muted mb-6">
                    {message}
                  </p>
                  <div className="flex gap-3 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={loading}
                      className="flex-1"
                    >
                      {finalCancelText}
                    </Button>
                    <Button
                      type="button"
                      onClick={onConfirm}
                      loading={loading}
                      className={`flex-1 ${confirmButtonClass}`}
                    >
                      {finalConfirmText}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
