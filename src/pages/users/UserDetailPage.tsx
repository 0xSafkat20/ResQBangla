import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Shield, Edit3, Plus, X, Power, PowerOff, Lock, Unlock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { useAuditLog } from '../../lib/audit';
import { hasPermission, PERMISSIONS } from '../../lib/permissions';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { formatDate, formatDateTime } from '../../lib/format';
import type { Profile, UserRole, Role, District, Organization } from '../../types';

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const [profile, setProfile] = useState<(Profile & { user_roles?: UserRole[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [roleExpiry, setRoleExpiry] = useState('');
  const [roleNote, setRoleNote] = useState('');
  const [assigningRole, setAssigningRole] = useState(false);
  const [removingRole, setRemovingRole] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ action: 'suspend' | 'activate' | 'lock' | 'unlock' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const perms = currentUser?.permissions || [];
  const canEdit = hasPermission(perms, PERMISSIONS.USERS_EDIT);
  const canAssignRole = hasPermission(perms, PERMISSIONS.USERS_ASSIGN_ROLE);
  const canRemoveRole = hasPermission(perms, PERMISSIONS.USERS_REMOVE_ROLE);
  const canSuspend = hasPermission(perms, PERMISSIONS.USERS_SUSPEND);
  const canActivate = hasPermission(perms, PERMISSIONS.USERS_ACTIVATE);
  const canLock = hasPermission(perms, PERMISSIONS.USERS_LOCK);
  const canUnlock = hasPermission(perms, PERMISSIONS.USERS_UNLOCK);
  const isSelf = profile?.id === currentUser?.id;

  const loadUser = async () => {
    setLoading(true); setError(false);
    const { data, error } = await supabase.from('profiles').select('*, user_roles(*, role:roles(*), district:districts(*), organization:organizations(*))').eq('id', id).maybeSingle();
    if (error || !data) { setError(true); } else { setProfile(data as Profile & { user_roles?: UserRole[] }); }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
    supabase.from('roles').select('*').eq('active', true).order('name').then(({ data }) => setRoles((data || []) as Role[]));
    supabase.from('districts').select('*').eq('active', true).order('name_en').then(({ data }) => setDistricts((data || []) as District[]));
    supabase.from('organizations').select('*').eq('active', true).order('name').then(({ data }) => setOrganizations((data || []) as Organization[]));
  }, [id]);

  const handleAssignRole = async () => {
    if (!selectedRole || !id) return;
    setAssigningRole(true);
    const insert: Record<string, unknown> = {
      user_id: id, role_id: selectedRole,
      district_id: selectedDistrict || null, organization_id: selectedOrg || null,
      expires_at: roleExpiry ? new Date(roleExpiry).toISOString() : null,
      note: roleNote || null,
    };
    const { error } = await supabase.from('user_roles').insert(insert);
    if (error) { toast('error', 'Failed to assign role', error.message); }
    else {
      const role = roles.find((r) => r.id === selectedRole);
      await log('ROLE_ASSIGNED', 'USER', id, profile?.email || null, 'SUCCESS', null, { role: role?.name, expires_at: roleExpiry || null });
      toast('success', 'Role assigned', role?.name || 'Role');
      setShowRoleModal(false); setSelectedRole(''); setSelectedDistrict(''); setSelectedOrg(''); setRoleExpiry(''); setRoleNote('');
      loadUser();
    }
    setAssigningRole(false);
  };

  const handleRemoveRole = async (userRoleId: string) => {
    setRemovingRole(userRoleId);
    const { error } = await supabase.from('user_roles').delete().eq('id', userRoleId);
    if (error) { toast('error', 'Failed to remove role', error.message); }
    else { await log('ROLE_REMOVED', 'USER', id || null, profile?.email || null); toast('success', 'Role removed'); loadUser(); }
    setRemovingRole(null);
  };

  const handleStatusAction = async () => {
    if (!confirmAction || !id) return;
    setActionLoading(true);
    const { action } = confirmAction;
    let update: Partial<Profile> = {};
    let auditAction = '';
    if (action === 'suspend') { update = { status: 'SUSPENDED' }; auditAction = 'USER_SUSPENDED'; }
    else if (action === 'activate') { update = { status: 'ACTIVE' }; auditAction = 'USER_ACTIVATED'; }
    else if (action === 'lock') { update = { status: 'LOCKED', locked_until: new Date(Date.now() + 86400000).toISOString() }; auditAction = 'USER_LOCKED'; }
    else if (action === 'unlock') { update = { status: 'ACTIVE', locked_until: null, failed_login_attempts: 0 }; auditAction = 'USER_UNLOCKED'; }
    const { error } = await supabase.from('profiles').update(update).eq('id', id);
    if (error) { toast('error', `Failed to ${action} user`, error.message); }
    else { await log(auditAction, 'USER', id, profile?.email || null); toast('success', `User ${action}ed`, profile?.email || ''); loadUser(); }
    setActionLoading(false); setConfirmAction(null);
  };

  if (loading) return <LoadingState message="Loading user..." />;
  if (error || !profile) return <ErrorState message="User not found" onRetry={() => navigate('/users')} />;

  const actionLabel = (a: string) => ({ suspend: 'Suspend', activate: 'Activate', lock: 'Lock', unlock: 'Unlock' }[a] || a);

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold text-secondary-900">User Details</h1>
      </div>
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <Avatar firstName={profile.first_name} lastName={profile.last_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-secondary-900">{profile.first_name} {profile.last_name}</h2>
              <StatusBadge status={profile.status} />
            </div>
            <p className="text-sm text-secondary-500 mt-1">{profile.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !isSelf && profile.status === 'ACTIVE' && canSuspend && (
              <Button variant="outline" size="sm" leftIcon={<PowerOff className="h-3.5 w-3.5" />} onClick={() => setConfirmAction({ action: 'suspend' })}>Suspend</Button>
            )}
            {canEdit && !isSelf && profile.status === 'SUSPENDED' && canActivate && (
              <Button variant="outline" size="sm" leftIcon={<Power className="h-3.5 w-3.5" />} onClick={() => setConfirmAction({ action: 'activate' })}>Activate</Button>
            )}
            {canEdit && !isSelf && profile.status !== 'LOCKED' && canLock && (
              <Button variant="outline" size="sm" leftIcon={<Lock className="h-3.5 w-3.5" />} onClick={() => setConfirmAction({ action: 'lock' })}>Lock</Button>
            )}
            {canEdit && !isSelf && profile.status === 'LOCKED' && canUnlock && (
              <Button variant="outline" size="sm" leftIcon={<Unlock className="h-3.5 w-3.5" />} onClick={() => setConfirmAction({ action: 'unlock' })}>Unlock</Button>
            )}
            {canEdit && <Button variant="outline" size="sm" onClick={() => navigate(`/users/${id}/edit`)} leftIcon={<Edit3 className="h-3.5 w-3.5" />}>Edit</Button>}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="px-5 py-4 border-b border-secondary-100"><h3 className="text-sm font-semibold text-secondary-900">Account Information</h3></div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField icon={Mail} label="Email" value={profile.email} />
          <InfoField icon={Phone} label="Phone" value={profile.phone || '—'} />
          <InfoField icon={Calendar} label="Joined" value={formatDate(profile.created_at)} />
          <InfoField icon={Calendar} label="Last Login" value={formatDateTime(profile.last_login_at)} />
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100">
          <h3 className="text-sm font-semibold text-secondary-900">Assigned Roles</h3>
          {canAssignRole && <Button size="sm" onClick={() => setShowRoleModal(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>Assign Role</Button>}
        </div>
        <div className="divide-y divide-secondary-50">
          {(!profile.user_roles || profile.user_roles.length === 0) ? (
            <div className="px-5 py-8 text-center text-sm text-secondary-400">No roles assigned</div>
          ) : profile.user_roles.map((ur) => (
            <div key={ur.id} className="flex items-center gap-3 px-5 py-3">
              <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center"><Shield className="h-4 w-4 text-primary-600" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900">{ur.role?.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {ur.district && <span className="text-xs text-secondary-400">{ur.district.name_en}</span>}
                  {ur.organization && <span className="text-xs text-secondary-400">· {ur.organization.name}</span>}
                  {ur.expires_at && <Badge variant="warning">Expires {formatDate(ur.expires_at)}</Badge>}
                  {ur.note && <span className="text-xs text-secondary-400 italic">"{ur.note}"</span>}
                </div>
              </div>
              {canRemoveRole && <button onClick={() => handleRemoveRole(ur.id)} disabled={removingRole === ur.id} className="p-1.5 rounded-lg text-secondary-400 hover:text-danger-500 hover:bg-danger-50"><X className="h-4 w-4" /></button>}
            </div>
          ))}
        </div>
      </div>
      <Modal open={showRoleModal} onClose={() => setShowRoleModal(false)} title="Assign Role" description={`Assign a role to ${profile.email}`}
        footer={<><Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button><Button onClick={handleAssignRole} loading={assigningRole} disabled={!selectedRole}>Assign</Button></>}>
        <div className="space-y-4">
          <Select label="Role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}><option value="">— Select Role —</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select>
          <div className="grid grid-cols-2 gap-4">
            <Select label="District (optional)" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}><option value="">— None —</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</Select>
            <Select label="Organization (optional)" value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)}><option value="">— None —</option>{organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</Select>
          </div>
          <Input label="Expiry Date (optional)" type="datetime-local" value={roleExpiry} onChange={(e) => setRoleExpiry(e.target.value)} hint="Leave blank for no expiry" />
          <Textarea label="Note (optional)" value={roleNote} onChange={(e) => setRoleNote(e.target.value)} placeholder="Add context for this role assignment..." rows={2} />
        </div>
      </Modal>
      <ConfirmDialog open={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleStatusAction}
        title={`${actionLabel(confirmAction?.action || '')} User`}
        message={`Are you sure you want to ${confirmAction?.action} "${profile.email}"?`}
        confirmLabel={actionLabel(confirmAction?.action || '')}
        variant={confirmAction?.action === 'activate' || confirmAction?.action === 'unlock' ? 'success' : 'danger'} loading={actionLoading} />
    </div>
  );
}

function InfoField({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="space-y-1"><div className="flex items-center gap-1.5 text-xs text-secondary-400"><Icon className="h-3.5 w-3.5" />{label}</div><p className="text-sm text-secondary-900 font-medium">{value}</p></div>;
}
