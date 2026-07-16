import { initials } from '../../lib/format';
import { cn } from '../../lib/cn';

interface AvatarProps { firstName: string; lastName: string; size?: 'sm' | 'md' | 'lg'; className?: string }
const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
const colors = ['bg-primary-100 text-primary-700', 'bg-accent-100 text-accent-700', 'bg-success-100 text-success-700', 'bg-warning-100 text-warning-700', 'bg-danger-100 text-danger-700'];

function getColor(name: string) { return colors[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length]; }

export function Avatar({ firstName, lastName, size = 'md', className }: AvatarProps) {
  return <div className={cn('rounded-full flex items-center justify-center font-semibold shrink-0', sizes[size], getColor(firstName + lastName), className)}>{initials(firstName, lastName)}</div>;
}
