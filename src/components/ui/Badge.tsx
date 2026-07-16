import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps { variant?: BadgeVariant; children: ReactNode; className?: string; dot?: boolean }

const variants: Record<BadgeVariant, string> = {
  default: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  info: 'bg-accent-50 text-accent-700 border-accent-200',
  neutral: 'bg-secondary-800 text-white border-secondary-900',
};
const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-secondary-400', primary: 'bg-primary-500', success: 'bg-success-500',
  warning: 'bg-warning-500', danger: 'bg-danger-500', info: 'bg-accent-500', neutral: 'bg-white',
};

export function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', variants[variant], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    ACTIVE: { variant: 'success', label: 'Active' },
    PENDING_VERIFICATION: { variant: 'warning', label: 'Pending' },
    SUSPENDED: { variant: 'danger', label: 'Suspended' },
    LOCKED: { variant: 'danger', label: 'Locked' },
    UNVERIFIED: { variant: 'warning', label: 'Unverified' },
    VERIFIED: { variant: 'success', label: 'Verified' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    SUCCESS: { variant: 'success', label: 'Success' },
    FAILURE: { variant: 'danger', label: 'Failure' },
    WARNING: { variant: 'warning', label: 'Warning' },
  };
  const c = map[status] || { variant: 'default' as BadgeVariant, label: status };
  return <Badge variant={c.variant} dot>{c.label}</Badge>;
}
