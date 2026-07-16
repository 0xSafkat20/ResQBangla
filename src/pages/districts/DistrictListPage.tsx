import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Search, MoreVertical, Edit3, Power, PowerOff } from 'lucide-react';
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
import { formatDateTime } from '../../lib/format';
import type { District, Division } from '../../types';

const PAGE_SIZE = 10;

export function DistrictListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<District[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ district: District; action: 'deactivate' | 'restore' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const perms = user?.permissions || [];
  const canCreate = hasPermission(perms, PERMISSIONS.DISTRICTS_CREATE);
  const canEdit = hasPermission(perms, PERMISSIONS.DISTRICTS_EDIT);
  const canDeactivate = hasPermission(perms, PERMISSIONS.DISTRICTS_DEACTIVATE);
  const canRestore = hasPermission(perms, PERMISSIONS.DISTRICTS_RESTORE);

  const loadDistricts = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('districts').select('*, division:divisions(*)', { count: 'exact' });
    if (search) q = q.or(`name_en.ilike.%${search}%,code.ilike.%${search}%,name_bn.ilike.%${search}%`);
    if (statusFilter === 'active') q = q.eq('active', true);
    else if (statusFilter === 'inactive') q = q.eq('active', false);
    if (divisionFilter !== 'all') q = q.eq('division_id', divisionFilter);
    q = q.order('name_en').range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data, count, error } = await q;
    if (error) { toast('error', 'Failed to load districts', error.message); }
    else { setDistricts((data || []) as District[]); setTotal(count || 0); }
    setLoading(false);
  }, [page, search, statusFilter, divisionFilter, toast]);

  useEffect(() => { supabase.from('divisions').select('*').order('name_en').then(({ data }) => setDivisions((data || []) as Division[])); }, []);
  useEffect(() => { loadDistricts(); }, [loadDistricts]);

  const handleToggleActive = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const { district, action } = confirmAction;
    const { error } = await supabase.from('districts').update({ active: action === 'restore' }).eq('id', district.id);
    if (error) { toast('error', `Failed to ${action} district`, error.message); }
    else {
      await log(action === 'restore' ? 'DISTRICT_RESTORED' : 'DISTRICT_DEACTIVATED', 'DISTRICT', district.id, district.name_en);
      toast('success', `District ${action === 'restore' ? 'restored' : 'deactivated'}`, district.name_en);
      loadDistricts();
    }
    setActionLoading(false); setConfirmAction(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-secondary-900">Districts</h1><p className="text-sm text-secondary-500 mt-1">Manage administrative districts and their status.</p></div>
        {canCreate && <Button onClick={() => navigate('/districts/new')} leftIcon={<Plus className="h-4 w-4" />}>Add District</Button>}
      </div>
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><Input placeholder="Search by name or code..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} /></div>
        <div className="sm:w-48"><Select value={divisionFilter} onChange={(e) => { setDivisionFilter(e.target.value); setPage(1); }}><option value="all">All Divisions</option>{divisions.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</Select></div>
        <div className="sm:w-40"><Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></Select></div>
      </div>
      <div className="card overflow-hidden">
        {loading ? <LoadingState message="Loading districts..." /> : districts.length === 0 ? (
          <EmptyState icon={<MapPin className="h-7 w-7" />} title="No districts found" message="Try adjusting your filters or create a new district." />
        ) : (
          <>
            <DataTable columns={[
              { key: 'name_en', header: 'District', render: (d) => <div><p className="font-medium text-secondary-900">{(d as District).name_en}</p><p className="text-xs text-secondary-400">{(d as District).code}</p></div> },
              { key: 'name_bn', header: 'Bangla Name', render: (d) => <span className="text-secondary-600">{(d as District).name_bn || '—'}</span> },
              { key: 'division', header: 'Division', render: (d) => (d as District).division?.name_en || '—' },
              { key: 'active', header: 'Status', render: (d) => (d as District).active ? <Badge variant="success" dot>Active</Badge> : <Badge variant="danger" dot>Inactive</Badge> },
              { key: 'updated_at', header: 'Last Updated', render: (d) => <span className="text-secondary-500 text-xs">{formatDateTime((d as District).updated_at)}</span> },
              { key: 'actions', header: '', className: 'text-right', render: (d) => {
                const district = d as District;
                return (
                  <div className="relative inline-block">
                    <button onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === district.id ? null : district.id); }} className="p-1.5 rounded-lg hover:bg-secondary-100 text-secondary-500"><MoreVertical className="h-4 w-4" /></button>
                    {actionMenu === district.id && (
                      <><div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                        <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-lg shadow-elevated border border-secondary-200 py-1 animate-scale-in">
                          {canEdit && <button onClick={() => { setActionMenu(null); navigate(`/districts/${district.id}/edit`); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"><Edit3 className="h-4 w-4" /> Edit</button>}
                          {district.active && canDeactivate && <button onClick={() => { setActionMenu(null); setConfirmAction({ district, action: 'deactivate' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"><PowerOff className="h-4 w-4" /> Deactivate</button>}
                          {!district.active && canRestore && <button onClick={() => { setActionMenu(null); setConfirmAction({ district, action: 'restore' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-success-600 hover:bg-success-50"><Power className="h-4 w-4" /> Restore</button>}
                        </div>
                      </>
                    )}
                  </div>
                );
              }},
            ]} data={districts} rowKey={(d) => d.id} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={total} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
      <ConfirmDialog open={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleToggleActive}
        title={confirmAction?.action === 'restore' ? 'Restore District' : 'Deactivate District'}
        message={`Are you sure you want to ${confirmAction?.action} "${confirmAction?.district.name_en}"?`}
        confirmLabel={confirmAction?.action === 'restore' ? 'Restore' : 'Deactivate'}
        variant={confirmAction?.action === 'restore' ? 'success' : 'danger'} loading={actionLoading} />
    </div>
  );
}
