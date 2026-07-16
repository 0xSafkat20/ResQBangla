import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Column<T> { key: string; header: string; render?: (row: T) => ReactNode; className?: string }
interface DataTableProps<T> {
  columns: Column<T>[]; data: T[]; rowKey: (row: T) => string;
  onRowClick?: (row: T) => void; emptyState?: ReactNode;
}

export function DataTable<T>({ columns, data, rowKey, onRowClick, emptyState }: DataTableProps<T>) {
  if (data.length === 0 && emptyState) return <div className="p-6">{emptyState}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-secondary-200 bg-secondary-50/50">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider whitespace-nowrap', col.className)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100">
          {data.map((row) => (
            <tr key={rowKey(row)} onClick={() => onRowClick?.(row)}
              className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-secondary-50')}>
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 text-sm text-secondary-700', col.className)}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
