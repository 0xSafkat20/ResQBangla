import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-primary-500', className)} />;
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-secondary-500">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-12 w-12 rounded-full bg-danger-50 flex items-center justify-center"><span className="text-danger-500 text-xl">!</span></div>
      <p className="text-sm text-secondary-600">{message}</p>
      {onRetry && <button onClick={onRetry} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Try again</button>}
    </div>
  );
}

export function EmptyState({ icon, title, message }: { icon?: ReactNode; title: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon && <div className="h-14 w-14 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-400">{icon}</div>}
      <div>
        <p className="text-sm font-medium text-secondary-700">{title}</p>
        {message && <p className="text-sm text-secondary-400 mt-1">{message}</p>}
      </div>
    </div>
  );
}
