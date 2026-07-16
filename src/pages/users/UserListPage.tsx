import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, MoreVertical, Eye, Power, PowerOff, Lock, Unlock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { useAuditLog } from '../../lib/audit';
import { hasPermission, PERMISSIONS } from '../../lib/permissions';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { ConfirmDialog } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';
import type { Profile, UserRole } from '../../types';

const PAGE_SIZE = 10;

export function UserListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const navigate = useNavigate();
  const [users, setUsers] = useState<(Profile & { user_roles?: UserRole[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ profile: Profile; action: 'suspend' | 'activate' | 'lock' | 'unlock' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const perms = user?.permissions || [];
  const canCreate = hasPermission(perms, PERMISSIONS.USERS_CREATE);
  const canEdit = hasPermission(perms, PERMISSIONS.USERS_EDIT);
  const canSuspend = hasPermission(perms, PERMISSIONS.USERS_SUSPEND);
  const canActivate = hasPermission(perms, PERMISSIONS.USERS_ACTIVATE);
  const canLock = hasPermission(perms, PERMISSIONS.USERS_LOCK);
  const canUnlock = hasPermission(perms, PERMISSIONS.USERS_UNLOCK);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('profiles').select('*, user_roles(*, role:roles(*))', { count: 'exact' });
    if (search) q = q.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    q = q.order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data, count, error } = await q;
    if (error) { toast('error', 'Failed to load users', error.message); }
    else { setUsers((data || []) as (Profile & { user_roles?: UserRole[] })[]); setTotal(count || 0); }
    setLoading(false);
  }, [page, search, statusFilter, toast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const { profile, action } = confirmAction;
    let update: Partial<Profile> = {};
    let auditAction = '';
    if (action === 'suspend') { update = { status: 'SUSPENDED' }; auditAction = 'USER_SUSPENDED'; }
    else if (action === 'activate') { update = { status: 'ACTIVE' }; auditAction = 'USER_ACTIVATED'; }
    else if (action === 'lock') { update = { status: 'LOCKED', locked_until: new Date(Date.now() + 86400000).toISOString() }; auditAction = 'USER_LOCKED'; }
    else if (action === 'unlock') { update = { status: 'ACTIVE', locked_until: null, failed_login_attempts: 0 }; auditAction = 'USER_UNLOCKED'; }
    const { error } = await supabase.from('profiles').update(update).eq('id', profile.id);
    if (error) { toast('error', `Failed to ${action} user`, error.message); }
    else { await log(auditAction, 'USER', profile.id, profile.email); toast('success', `User ${action}ed`, profile.email); loadUsers(); }
    setActionLoading(false); setConfirmAction(null);
  };

  const actionLabel = (a: string) => ({ suspend: 'Suspend', activate: 'Activate', lock: 'Lock', unlock: 'Unlock' }[a] || a);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-secondary-900">User Management</h1><p className="text-sm text-secondary-500 mt-1">Manage user accounts, roles, and access.</p></div>
        {canCreate && <Button onClick={() => navigate('/users/new')} leftIcon={<Plus className="h-4 w-4" />}>Add User</Button>}
      </div>
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><Input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} /></div>
        <div className="sm:w-48"><Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}><option value="all">All Status</option><option value="ACTIVE">Active</option><option value="PENDING_VERIFICATION">Pending</option><option value="SUSPENDED">Suspended</option><option value="LOCKED">Locked</option></Select></div>
      </div>
      <div className="card overflow-hidden">
        {loading ? <LoadingState message="Loading users..." /> : users.length === 0 ? (
          <EmptyState icon={<Users className="h-7 w-7" />} title="No users found" message="Try adjusting your filters or create a new user." />
        ) : (
          <>
            <DataTable columns={[
              { key: 'name', header: 'User', render: (u) => {
                const p = u as Profile & { user_roles?: UserRole[] };
                return <div className="flex items-center gap-3"><Avatar firstName={p.first_name} lastName={p.last_name} size="sm" /><div><p className="font-medium text-secondary-900">{p.first_name} {p.last_name}</p><p className="text-xs text-secondary-400">{p.email}</p></div></div>;
              }},
              { key: 'roles', header: 'Roles', render: (u) => {
                const roles = (u as Profile & { user_roles?: UserRole[] }).user_roles || [];
                if (!roles.length) return <span className="text-secondary-400 text-xs">No roles</span>;
                return <div className="flex flex-wrap gap-1">{roles.slice(0, 2).map((r) => <span key={r.id} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{r.role?.name}</span>)}{roles.length > 2 && <span className="text-xs text-secondary-400">+{roles.length - 2}</span>}</div>;
              }},
              { key: 'status', header: 'Status', render: (u) => <StatusBadge status={(u as Profile).status} /> },
              { key: 'created_at', header: 'Joined', render: (u) => <span className="text-secondary-500 text-xs">{formatDate((u as Profile).created_at)}</span> },
              { key: 'actions', header: '', className: 'text-right', render: (u) => {
                const p = u as Profile;
                const isSelf = p.id === user?.id;
                return (
                  <div className="relative inline-block">
                    <button onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === p.id ? null : p.id); }} className="p-1.5 rounded-lg hover:bg-secondary-100 text-secondary-500"><MoreVertical className="h-4 w-4" /></button>
                    {actionMenu === p.id && (
                      <><div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                        <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-lg shadow-elevated border border-secondary-200 py-1 animate-scale-in">
                          <button onClick={() => { setActionMenu(null); navigate(`/users/${p.id}`); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"><Eye className="h-4 w-4" /> View Details</button>
                          {canEdit && !isSelf && <button onClick={() => { setActionMenu(null); navigate(`/users/${p.id}/edit`); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"><Users className="h-4 w-4" /> Edit & Roles</button>}
                          {canSuspend && p.status === 'ACTIVE' && !isSelf && <button onClick={() => { setActionMenu(null); setConfirmAction({ profile: p, action: 'suspend' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"><PowerOff className="h-4 w-4" /> Suspend</button>}
                          {canActivate && p.status === 'SUSPENDED' && !isSelf && <button onClick={() => { setActionMenu(null); setConfirmAction({ profile: p, action: 'activate' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-success-600 hover:bg-success-50"><Power className="h-4 w-4" /> Activate</button>}
                          {canLock && p.status !== 'LOCKED' && !isSelf && <button onClick={() => { setActionMenu(null); setConfirmAction({ profile: p, action: 'lock' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"><Lock className="h-4 w-4" /> Lock Account</button>}
                          {canUnlock && p.status === 'LOCKED' && !isSelf && <button onClick={() => { setActionMenu(null); setConfirmAction({ profile: p, action: 'unlock' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-success-600 hover:bg-success-50"><Unlock className="h-4 w-4" /> Unlock</button>}
                        </div>
                      </>
                    )}
                  </div>
                );
              }},
            ]} data={users} rowKey={(u) => u.id} onRowClick={(u) => navigate(`/users/${u.id}`)} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={total} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
      <ConfirmDialog open={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleAction}
        title={`${actionLabel(confirmAction?.action || '')} User`}
        message={`Are you sure you want to ${confirmAction?.action} "${confirmAction?.profile.email}"?`}
        confirmLabel={actionLabel(confirmAction?.action || '')}
        variant={confirmAction?.action === 'activate' || confirmAction?.action === 'unlock' ? 'success' : 'danger'} loading={actionLoading} />
    </div>
  );
}
