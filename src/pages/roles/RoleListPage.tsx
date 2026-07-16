import { useState, useEffect } from 'react';
import { Shield, Plus, Search, MoreVertical, Edit3, Power, PowerOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { useAuditLog } from '../../lib/audit';
import { hasPermission, PERMISSIONS, PERMISSION_GROUPS } from '../../lib/permissions';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { titleCase } from '../../lib/format';
import type { Role } from '../../types';

export function RoleListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ role: Role; action: 'deactivate' | 'restore' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', permissions: [] as string[] });
  const [saving, setSaving] = useState(false);

  const perms = user?.permissions || [];
  const canCreate = hasPermission(perms, PERMISSIONS.ROLES_CREATE);
  const canEdit = hasPermission(perms, PERMISSIONS.ROLES_EDIT);
  const canDeactivate = hasPermission(perms, PERMISSIONS.ROLES_DEACTIVATE);
  const canRestore = hasPermission(perms, PERMISSIONS.ROLES_RESTORE);

  const loadRoles = async () => {
    setLoading(true);
    let q = supabase.from('roles').select('*').order('name');
    if (search) q = q.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) { toast('error', 'Failed to load roles', error.message); }
    else { setRoles((data || []) as Role[]); }
    setLoading(false);
  };

  useEffect(() => { loadRoles(); }, []);

  const openCreate = () => { setEditingRole(null); setForm({ code: '', name: '', description: '', permissions: [] }); setShowForm(true); };
  const openEdit = (role: Role) => { setEditingRole(role); setForm({ code: role.code, name: role.name, description: role.description || '', permissions: role.permissions }); setShowForm(true); setActionMenu(null); };

  const handleSave = async () => {
    setSaving(true);
    if (editingRole) {
      const { error } = await supabase.from('roles').update({ name: form.name, description: form.description || null, permissions: form.permissions }).eq('id', editingRole.id);
      if (error) { toast('error', 'Update failed', error.message); }
      else { await log('ROLE_UPDATED', 'ROLE', editingRole.id, form.name); toast('success', 'Role updated', form.name); setShowForm(false); loadRoles(); }
    } else {
      const { error } = await supabase.from('roles').insert({ code: form.code, name: form.name, description: form.description || null, permissions: form.permissions, is_system_role: false });
      if (error) { toast('error', 'Create failed', error.message); }
      else { await log('ROLE_CREATED', 'ROLE', null, form.name); toast('success', 'Role created', form.name); setShowForm(false); loadRoles(); }
    }
    setSaving(false);
  };

  const handleToggleActive = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const { role, action } = confirmAction;
    const { error } = await supabase.from('roles').update({ active: action === 'restore' }).eq('id', role.id);
    if (error) { toast('error', `Failed to ${action} role`, error.message); }
    else { await log(action === 'restore' ? 'ROLE_RESTORED' : 'ROLE_DEACTIVATED', 'ROLE', role.id, role.name); toast('success', `Role ${action === 'restore' ? 'restored' : 'deactivated'}`, role.name); loadRoles(); }
    setActionLoading(false); setConfirmAction(null);
  };

  const togglePermission = (perm: string) => {
    setForm((f) => ({ ...f, permissions: f.permissions.includes(perm) ? f.permissions.filter((p) => p !== perm) : [...f.permissions, perm] }));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-secondary-900">Roles & Permissions</h1><p className="text-sm text-secondary-500 mt-1">Manage system roles and their permissions.</p></div>
        {canCreate && <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Add Role</Button>}
      </div>
      <div className="card p-4"><Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} /></div>
      <div className="card overflow-hidden">
        {loading ? <LoadingState message="Loading roles..." /> : roles.length === 0 ? (
          <EmptyState icon={<Shield className="h-7 w-7" />} title="No roles found" />
        ) : (
          <DataTable columns={[
            { key: 'name', header: 'Role', render: (r) => <div><p className="font-medium text-secondary-900">{(r as Role).name}</p><p className="text-xs text-secondary-400">{(r as Role).code}</p></div> },
            { key: 'description', header: 'Description', render: (r) => <span className="text-secondary-600 text-sm">{(r as Role).description || '—'}</span> },
            { key: 'permissions', header: 'Permissions', render: (r) => <Badge variant="primary">{(r as Role).permissions.length} permissions</Badge> },
            { key: 'is_system_role', header: 'Type', render: (r) => (r as Role).is_system_role ? <Badge variant="neutral">System</Badge> : <Badge>Custom</Badge> },
            { key: 'active', header: 'Status', render: (r) => (r as Role).active ? <Badge variant="success" dot>Active</Badge> : <Badge variant="danger" dot>Inactive</Badge> },
            { key: 'actions', header: '', className: 'text-right', render: (r) => {
              const role = r as Role;
              return (
                <div className="relative inline-block">
                  <button onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === role.id ? null : role.id); }} className="p-1.5 rounded-lg hover:bg-secondary-100 text-secondary-500"><MoreVertical className="h-4 w-4" /></button>
                  {actionMenu === role.id && (
                    <><div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                      <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-lg shadow-elevated border border-secondary-200 py-1 animate-scale-in">
                        {canEdit && <button onClick={() => openEdit(role)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"><Edit3 className="h-4 w-4" /> Edit</button>}
                        {role.active && canDeactivate && !role.is_system_role && <button onClick={() => { setActionMenu(null); setConfirmAction({ role, action: 'deactivate' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"><PowerOff className="h-4 w-4" /> Deactivate</button>}
                        {!role.active && canRestore && !role.is_system_role && <button onClick={() => { setActionMenu(null); setConfirmAction({ role, action: 'restore' }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-success-600 hover:bg-success-50"><Power className="h-4 w-4" /> Restore</button>}
                      </div>
                    </>
                  )}
                </div>
              );
            }},
          ]} data={roles} rowKey={(r) => r.id} />
        )}
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingRole ? 'Edit Role' : 'Add Role'} description={editingRole ? `Editing ${editingRole.name}` : 'Create a new role with specific permissions'} size="lg"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editingRole ? 'Save Changes' : 'Create Role'}</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Role Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CUSTOM_ROLE" required disabled={!!editingRole} hint={editingRole ? 'Code cannot be changed' : 'Unique identifier'} />
            <Input label="Role Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Custom Role" required />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe this role's purpose..." rows={2} />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-secondary-900">Permissions</h4>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(PERMISSION_GROUPS).map(([group, groupPerms]) => (
                <div key={group}>
                  <p className="text-xs font-medium text-secondary-500 mb-2">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {groupPerms.map((perm) => {
                      const active = form.permissions.includes(perm);
                      return <button key={perm} type="button" onClick={() => togglePermission(perm)} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-secondary-600 border-secondary-300 hover:border-secondary-400'}`}>{titleCase(perm.replace(/\./g, ' '))}</button>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleToggleActive}
        title={confirmAction?.action === 'restore' ? 'Restore Role' : 'Deactivate Role'}
        message={`Are you sure you want to ${confirmAction?.action} "${confirmAction?.role.name}"?`}
        confirmLabel={confirmAction?.action === 'restore' ? 'Restore' : 'Deactivate'}
        variant={confirmAction?.action === 'restore' ? 'success' : 'danger'} loading={actionLoading} />
    </div>
  );
}
