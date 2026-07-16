import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from './cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast { id: string; type: ToastType; title: string; message?: string }

interface ToastContextValue { toast: (type: ToastType, title: string, message?: string) => void }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const styles: Record<ToastType, string> = {
  success: 'bg-success-50 border-success-200 text-success-800',
  error: 'bg-danger-50 border-danger-200 text-danger-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info: 'bg-primary-50 border-primary-200 text-primary-800',
};
const iconColors: Record<ToastType, string> = {
  success: 'text-success-500', error: 'text-danger-500',
  warning: 'text-warning-500', info: 'text-primary-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts((p) => [...p, { id, type, title, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  }, []);
  const dismiss = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={cn('pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-elevated animate-slide-in-right', styles[t.type])}>
              <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[t.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t.title}</p>
                {t.message && <p className="text-sm opacity-80 mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-50 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
