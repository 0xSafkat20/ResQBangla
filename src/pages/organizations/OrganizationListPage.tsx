import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, MoreVertical, Edit3, Power, PowerOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { useAuditLog } from '../../lib/audit';
import { hasPermission, PERMISSIONS } from '../../lib/permissions';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { ConfirmDialog } from '../../components/ui/Modal';
import { formatDateTime, titleCase } from '../../lib/format';
import type { Organization } from '../../types';

const PAGE_SIZE = 10;
const ORG_TYPES = ['NGO', 'FIRE_SERVICE', 'RED_CRESCENT', 'GOVERNMENT', 'MILITARY', 'VOLUNTEER', 'OTHER'];

export function OrganizationListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ org: Organization; action: 'deactivate' | 'restore' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const perms = user?.permissions || [];
  const canCreate = hasPermission(perms, PERMISSIONS.ORGANIZATIONS_CREATE);
  const canEdit = hasPermission(perms, PERMISSIONS.ORGANIZATIONS_EDIT);
  const canDeactivate = hasPermission(perms, PERMISSIONS.ORGANIZATIONS_DEACTIVATE);
  const canRestore = hasPermission(perms, PERMISSIONS.ORGANIZATIONS_RESTORE);

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('organizations').select('*, district:districts(*)', { count: 'exact' });
    if (search) q = q.or(`name.ilike.%${search}%,reference_number.ilike.%${search}%,email.ilike.%${search}%`);
    if (statusFilter === 'active') q = q.eq('active', true);
    else if (statusFilter === 'inactive') q = q.eq('active', false);
    if (typeFilter !== 'all') q = q.eq('type', typeFilter);
    q = q.order('name').range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data, count, error } = await q;
    if (error) { toast('error', 'Failed to load organizations', error.message); }
    else { setOrgs((data || []) as Organization[]); setTotal(count || 0); }
    setLoading(false);
  }, [page, search, statusFilter, typeFilter, toast]);

  useEffect(() => { loadOrgs(); }, [loadOrgs]);

  const handleToggleActive = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const { org, action } = confirmAction;
    const { error } = await supabase.from('organizations').update({ active: action === 'restore' }).eq('id', org.id);
    if (error) { toast('error', `Failed to ${action} organization`, error.message); }
    else {
      await log(action === 'restore' ? 'ORGANIZATION_RESTORED' : 'ORGANIZATION_DEACTIVATED', 'ORGANIZATION', org.id, org.name);
      toast('success', `Organization ${action === 'restore' ? 'restored' : 'deactivated'}`, org.name);
      loadOrgs();
    }
    setActionLoading(false); setConfirmAction(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-secondary-900">Organizations</h1><p className="text-sm text-secondary-500 mt-1">Manage response organizations and their status.</p></div>
        {canCreate && <Button onClick={() => navigate('/organizations/new')} leftIcon={<Plus className="h-4 w-4" />}>Add Organization</Button>}
      </div>
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><Input placeholder="Search by name, reference, or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} /></div>
        <div className="sm:w-44"><Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}><option value="all">All Types</option>{ORG_TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}</Select></div>
        <div className="sm:w-36"><Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></Select></div>
      </div>
      <div className="card overflow-hidden">
        {loading ? <LoadingState message="Loading organizations..." /> : orgs.length === 0 ? (
          <EmptyState icon={<Building2 className="h-7 w-7" />} title="No organizations found" message="Try adjusting your filters or create a new organization." />
        ) : (
          <>
            <DataTable columns={[
              { key: 'name', header: 'Organization', render: (o) => <div><p className="font-medium text-secondary-900">{(o as Organization).name}</p><p className="text-xs text-secondary-400">{(o as Organization).reference_number || '—'}</p></div> },
              { key: 'type', header: 'Type', render: (o) => <Badge variant="info">{titleCase((o as Organization).type)}</Badge> },
              { key: 'district', header: 'District', render: (o) => (o as Organization).district?.name_en || '—' },
              { key: 'email', header: 'Email', render: (o) => <span className="text-secondary-600">{(o as Organization).email || '—'}</span> },
              { key: 'active', header: 'Status', render: (o) => (o as Organization).active ? <Badge variant="success" dot>Active</Badge> : <Badge variant="danger" dot>Inactive</Badge> },
              { key: 'updated_at', header: 'Last Updated', render: (o) => <span className="text-secondary-500 text-xs">{formatDateTime((o as Organization).updated_at)}</span> },
              { key: 'actions', header: '', className: 'text-right', render: (o) => {
                const org = o as Organization;
                return (
                  <div className="relative inline-block">
                    <button onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === org.id ? null : org.id); }} className="p-1.5 rounded-lg hover:bg-secondary-100 text-secondary-500"><MoreVertical className="h-4 w-4" /></button>
                    {actionMenu === org.id && (
                      <><div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                        <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-lg shadow-elevated border border-secondary-200 py-1 animate-scale-in">
                          {canEdit && <button onClick={() => { setActionMenu(null); navigate(`/organizations/${org.id}/edit`); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"><Edit3 className="h-4 w-4" /> Edit</button>}
                          {org.active && canDeactivate && <button onClick={() => { setActionMenu(null); setConfirmAction({ org, action: 'deactivate' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"><PowerOff className="h-4 w-4" /> Deactivate</button>}
                          {!org.active && canRestore && <button onClick={() => { setActionMenu(null); setConfirmAction({ org, action: 'restore' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-success-600 hover:bg-success-50"><Power className="h-4 w-4" /> Restore</button>}
                        </div>
                      </>
                    )}
                  </div>
                );
              }},
            ]} data={orgs} rowKey={(o) => o.id} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={total} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
      <ConfirmDialog open={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleToggleActive}
        title={confirmAction?.action === 'restore' ? 'Restore Organization' : 'Deactivate Organization'}
        message={`Are you sure you want to ${confirmAction?.action} "${confirmAction?.org.name}"?`}
        confirmLabel={confirmAction?.action === 'restore' ? 'Restore' : 'Deactivate'}
        variant={confirmAction?.action === 'restore' ? 'success' : 'danger'} loading={actionLoading} />
    </div>
  );
}
