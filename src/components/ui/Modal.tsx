import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

interface ModalProps {
  open: boolean; onClose: () => void; title: string; description?: string;
  children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}
const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-secondary-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-white rounded-2xl shadow-elevated animate-slide-in-up max-h-[90vh] flex flex-col', sizes[size])}>
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-secondary-100">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">{title}</h2>
            {description && <p className="text-sm text-secondary-500 mt-1">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-1"><X className="h-5 w-5" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-secondary-100 bg-secondary-50/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
  confirmLabel?: string; cancelLabel?: string; variant?: 'danger' | 'primary' | 'success'; loading?: boolean;
}
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="outline" onClick={onClose} disabled={loading}>{cancelLabel}</Button><Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button></>}>
      <p className="text-sm text-secondary-600">{message}</p>
    </Modal>
  );
}
