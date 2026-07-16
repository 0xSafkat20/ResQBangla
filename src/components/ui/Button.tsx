import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-soft',
  secondary: 'bg-secondary-800 text-white hover:bg-secondary-900 shadow-soft',
  outline: 'border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400',
  ghost: 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-soft',
  success: 'bg-success-600 text-white hover:bg-success-700 shadow-soft',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2', icon: 'h-10 w-10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, leftIcon, children, disabled, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
