import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string; leftIcon?: ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700">{label}{props.required && <span className="text-danger-500 ml-0.5">*</span>}</label>}
        <div className="relative">
          {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none">{leftIcon}</div>}
          <input ref={ref} id={inputId} className={cn('input-base', leftIcon && 'pl-10', error && 'input-error', className)} {...props} />
        </div>
        {error ? <p className="text-xs text-danger-600">{error}</p> : hint ? <p className="text-xs text-secondary-400">{hint}</p> : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; hint?: string; children: ReactNode;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, id, children, ...props }, ref) => {
    const sid = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={sid} className="block text-sm font-medium text-secondary-700">{label}{props.required && <span className="text-danger-500 ml-0.5">*</span>}</label>}
        <select ref={ref} id={sid} className={cn('input-base appearance-none bg-no-repeat pr-10', error && 'input-error', className)}
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          {...props}>{children}</select>
        {error ? <p className="text-xs text-danger-600">{error}</p> : hint ? <p className="text-xs text-secondary-400">{hint}</p> : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string; hint?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-secondary-700">{label}{props.required && <span className="text-danger-500 ml-0.5">*</span>}</label>}
      <textarea ref={ref} id={id || props.name} className={cn('input-base resize-none', error && 'input-error', className)} {...props} />
      {error ? <p className="text-xs text-danger-600">{error}</p> : hint ? <p className="text-xs text-secondary-400">{hint}</p> : null}
    </div>
  )
);
Textarea.displayName = 'Textarea';
