import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Modal } from './Modal';
import { cn } from '../utils';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

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

  const footer = (
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
        className={cn('flex-1', confirmButtonClass)}
      >
        {finalConfirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel} // Closing modal = cancel
      title={title}
      size="sm"
      showCloseButton={false} // No X button for confirm modals usually
      footer={footer}
    >
      <div className="flex flex-col items-center text-center">
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-4', iconColorClass)}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-muted-foreground">
          {message}
        </p>
      </div>
    </Modal>
  );
}
