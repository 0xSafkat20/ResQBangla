import { useState, useEffect, useCallback } from 'react';
import { ScrollText, Search, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { hasPermission, PERMISSIONS } from '../../lib/permissions';
import { Input, Select } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { Modal } from '../../components/ui/Modal';
import { formatDateTime, formatRelativeTime, titleCase } from '../../lib/format';
import type { AuditLog } from '../../types';

const PAGE_SIZE = 15;
const ACTIONS = [
  'USER_CREATED', 'USER_UPDATED', 'USER_SUSPENDED', 'USER_ACTIVATED', 'USER_LOCKED', 'USER_UNLOCKED',
  'ROLE_ASSIGNED', 'ROLE_REMOVED',
  'DISTRICT_CREATED', 'DISTRICT_UPDATED', 'DISTRICT_DEACTIVATED', 'DISTRICT_RESTORED',
  'ORGANIZATION_CREATED', 'ORGANIZATION_UPDATED', 'ORGANIZATION_DEACTIVATED', 'ORGANIZATION_RESTORED',
  'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DEACTIVATED', 'ROLE_RESTORED',
  'PROFILE_UPDATED', 'PASSWORD_CHANGED',
];

export function AuditListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const canViewDetails = hasPermission(user?.permissions || [], PERMISSIONS.AUDIT_VIEW_DETAILS);

  const loadLogs = useCallback(async () => {
    setLoading(true); setError(false);
    let q = supabase.from('audit_logs').select('*, district:districts(*), organization:organizations(*)', { count: 'exact' });
    if (search) q = q.or(`actor_email.ilike.%${search}%,entity_name.ilike.%${search}%`);
    if (actionFilter !== 'all') q = q.eq('action', actionFilter);
    if (resultFilter !== 'all') q = q.eq('result', resultFilter);
    q = q.order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data, count, error } = await q;
    if (error) { setError(true); toast('error', 'Failed to load audit logs', error.message); }
    else { setLogs((data || []) as AuditLog[]); setTotal(count || 0); }
    setLoading(false);
  }, [page, search, actionFilter, resultFilter, toast]);

  useEffect(() => { loadLogs(); }, [loadLogs]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div><h1 className="text-2xl font-bold text-secondary-900">Audit Logs</h1><p className="text-sm text-secondary-500 mt-1">System activity log and action history.</p></div>
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><Input placeholder="Search by actor or entity..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} /></div>
        <div className="sm:w-56"><Select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}><option value="all">All Actions</option>{ACTIONS.map((a) => <option key={a} value={a}>{titleCase(a.replace(/_/g, ' '))}</option>)}</Select></div>
        <div className="sm:w-40"><Select value={resultFilter} onChange={(e) => { setResultFilter(e.target.value); setPage(1); }}><option value="all">All Results</option><option value="SUCCESS">Success</option><option value="FAILURE">Failure</option><option value="WARNING">Warning</option></Select></div>
      </div>
      <div className="card overflow-hidden">
        {loading ? <LoadingState message="Loading audit logs..." /> : error ? <ErrorState message="Failed to load audit logs" onRetry={loadLogs} /> : logs.length === 0 ? (
          <EmptyState icon={<ScrollText className="h-7 w-7" />} title="No audit logs found" message="Try adjusting your filters." />
        ) : (
          <>
            <DataTable columns={[
              { key: 'created_at', header: 'Timestamp', render: (l) => <span className="text-secondary-500 text-xs">{formatDateTime((l as AuditLog).created_at)}</span> },
              { key: 'actor_email', header: 'Actor', render: (l) => <span className="font-medium text-secondary-900">{(l as AuditLog).actor_email || 'System'}</span> },
              { key: 'action', header: 'Action', render: (l) => <span className="text-secondary-600">{titleCase((l as AuditLog).action.replace(/_/g, ' '))}</span> },
              { key: 'entity_name', header: 'Entity', render: (l) => <span className="text-secondary-600">{(l as AuditLog).entity_name || '—'}</span> },
              { key: 'result', header: 'Result', render: (l) => <StatusBadge status={(l as AuditLog).result} /> },
              { key: 'actions', header: '', className: 'text-right', render: (l) => canViewDetails ? <button onClick={(e) => { e.stopPropagation(); setSelectedLog(l as AuditLog); }} className="p-1.5 rounded-lg hover:bg-secondary-100 text-secondary-500"><Eye className="h-4 w-4" /></button> : null },
            ]} data={logs} rowKey={(l) => l.id} onRowClick={(l) => canViewDetails && setSelectedLog(l)} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={total} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
      <Modal open={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Log Detail" size="md">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DF label="Timestamp" value={formatDateTime(selectedLog.created_at)} />
              <DF label="Relative" value={formatRelativeTime(selectedLog.created_at)} />
              <DF label="Actor" value={selectedLog.actor_email || 'System'} />
              <DF label="Actor Type" value={titleCase(selectedLog.actor_type)} />
              <DF label="Action" value={titleCase(selectedLog.action.replace(/_/g, ' '))} />
              <DF label="Result" value={selectedLog.result} />
              <DF label="Entity Type" value={selectedLog.entity_type ? titleCase(selectedLog.entity_type) : '—'} />
              <DF label="Entity Name" value={selectedLog.entity_name || '—'} />
              <DF label="District" value={selectedLog.district?.name_en || '—'} />
              <DF label="Organization" value={selectedLog.organization?.name || '—'} />
              <DF label="Reason" value={selectedLog.reason || '—'} />
              <DF label="Correlation ID" value={selectedLog.correlation_id} />
            </div>
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <p className="text-xs font-medium text-secondary-500 mb-2">Metadata</p>
                <pre className="bg-secondary-50 rounded-lg p-3 text-xs text-secondary-700 overflow-x-auto">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function DF({ label, value }: { label: string; value: string }) {
  return <div className="space-y-0.5"><p className="text-xs text-secondary-400">{label}</p><p className="text-sm text-secondary-900 font-medium">{value}</p></div>;
}
