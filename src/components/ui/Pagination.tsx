import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

interface PaginationProps { page: number; totalPages: number; onPageChange: (p: number) => void; totalItems?: number; pageSize?: number }

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize = 10 }: PaginationProps) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems || 0);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-secondary-100">
      <p className="text-sm text-secondary-500">{totalItems ? `Showing ${start}–${end} of ${totalItems}` : `Page ${page} of ${totalPages}`}</p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
        {getPageNumbers(page, totalPages).map((p, i) => p === '...' ? <span key={`e-${i}`} className="px-2 text-secondary-400">…</span> : (
          <button key={p} onClick={() => onPageChange(p as number)} className={cn('h-8 w-8 rounded-lg text-sm font-medium transition-colors', p === page ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:bg-secondary-100')}>{p}</button>
        ))}
        <Button variant="outline" size="icon" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}
