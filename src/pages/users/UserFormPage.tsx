import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../lib/toast';
import { useAuditLog } from '../../lib/audit';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/States';
import type { Profile, Role, District, Organization } from '../../types';

export function UserFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', roleId: '', districtId: '', organizationId: '' });

  useEffect(() => {
    supabase.from('roles').select('*').eq('active', true).order('name').then(({ data }) => setRoles((data || []) as Role[]));
    supabase.from('districts').select('*').eq('active', true).order('name_en').then(({ data }) => setDistricts((data || []) as District[]));
    supabase.from('organizations').select('*').eq('active', true).order('name').then(({ data }) => setOrganizations((data || []) as Organization[]));
    if (isEdit) {
      supabase.from('profiles').select('*, user_roles(*, role:roles(*))').eq('id', id).maybeSingle().then(({ data, error }) => {
        if (error || !data) { toast('error', 'User not found'); navigate('/users'); return; }
        const p = data as Profile & { user_roles?: { role_id: string; district_id: string | null; organization_id: string | null }[] };
        const firstRole = p.user_roles?.[0];
        setForm({ email: p.email, password: '', firstName: p.first_name, lastName: p.last_name, phone: p.phone || '', roleId: firstRole?.role_id || '', districtId: firstRole?.district_id || '', organizationId: firstRole?.organization_id || '' });
        setLoading(false);
      });
    }
  }, [id, isEdit, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    if (isEdit) {
      const { error } = await supabase.from('profiles').update({ first_name: form.firstName, last_name: form.lastName, phone: form.phone || null }).eq('id', id);
      if (error) { toast('error', 'Update failed', error.message); }
      else {
        await log('USER_UPDATED', 'USER', id!, form.email);
        if (form.roleId) {
          const { data: existing } = await supabase.from('user_roles').select('id').eq('user_id', id);
          if (existing && existing.length > 0) {
            await supabase.from('user_roles').update({ role_id: form.roleId, district_id: form.districtId || null, organization_id: form.organizationId || null }).eq('id', existing[0].id);
          } else {
            await supabase.from('user_roles').insert({ user_id: id, role_id: form.roleId, district_id: form.districtId || null, organization_id: form.organizationId || null });
          }
        }
        toast('success', 'User updated', form.email);
        navigate(`/users/${id}`);
      }
    } else {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast('error', 'Authentication required'); setSaving(false); return; }
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}`, 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, phone: form.phone, roleId: form.roleId || undefined, districtId: form.districtId || undefined, organizationId: form.organizationId || undefined }),
      });
      const result = await response.json();
      if (!response.ok) { toast('error', 'Create failed', result.error || 'Unknown error'); }
      else { toast('success', 'User created', form.email); navigate('/users'); }
    }
    setSaving(false);
  };

  if (loading) return <LoadingState message="Loading user..." />;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(isEdit ? `/users/${id}` : '/users')}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold text-secondary-900">{isEdit ? 'Edit User' : 'Add User'}</h1><p className="text-sm text-secondary-500 mt-1">{isEdit ? 'Update user information and role.' : 'Create a new user account with a role.'}</p></div>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={isEdit} hint={isEdit ? 'Email cannot be changed' : undefined} />
          {!isEdit && <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="At least 8 characters" />}
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880..." />
        </div>
        <div className="border-t border-secondary-100 pt-4">
          <h3 className="text-sm font-semibold text-secondary-900 mb-3">Role Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Role" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}><option value="">— Select Role —</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select>
            <Select label="District" value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value })}><option value="">— None —</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</Select>
            <Select label="Organization" value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })}><option value="">— None —</option>{organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</Select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>{isEdit ? 'Save Changes' : 'Create User'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(isEdit ? `/users/${id}` : '/users')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
