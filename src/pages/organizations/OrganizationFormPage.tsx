import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../lib/toast';
import { useAuditLog } from '../../lib/audit';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/States';
import { titleCase } from '../../lib/format';
import type { District, Organization, OrganizationType } from '../../types';

const ORG_TYPES: OrganizationType[] = ['NGO', 'FIRE_SERVICE', 'RED_CRESCENT', 'GOVERNMENT', 'MILITARY', 'VOLUNTEER', 'OTHER'];

export function OrganizationFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'NGO' as OrganizationType, reference_number: '', district_id: '', email: '', phone: '', address: '', active: true });

  useEffect(() => {
    supabase.from('districts').select('*').eq('active', true).order('name_en').then(({ data }) => setDistricts((data || []) as District[]));
    if (isEdit) {
      supabase.from('organizations').select('*').eq('id', id).maybeSingle().then(({ data, error }) => {
        if (error || !data) { toast('error', 'Organization not found'); navigate('/organizations'); return; }
        const o = data as Organization;
        setForm({ name: o.name, type: o.type, reference_number: o.reference_number || '', district_id: o.district_id || '', email: o.email || '', phone: o.phone || '', address: o.address || '', active: o.active });
        setLoading(false);
      });
    }
  }, [id, isEdit, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { name: form.name, type: form.type, reference_number: form.reference_number || null, district_id: form.district_id || null, email: form.email || null, phone: form.phone || null, address: form.address || null, active: form.active };
    if (isEdit) {
      const { error } = await supabase.from('organizations').update(payload).eq('id', id);
      if (error) { toast('error', 'Update failed', error.message); }
      else { await log('ORGANIZATION_UPDATED', 'ORGANIZATION', id!, form.name); toast('success', 'Organization updated', form.name); navigate('/organizations'); }
    } else {
      const { data, error } = await supabase.from('organizations').insert(payload).select().single();
      if (error) { toast('error', 'Create failed', error.message); }
      else { await log('ORGANIZATION_CREATED', 'ORGANIZATION', data.id, form.name); toast('success', 'Organization created', form.name); navigate('/organizations'); }
    }
    setSaving(false);
  };

  if (loading) return <LoadingState message="Loading organization..." />;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/organizations')}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold text-secondary-900">{isEdit ? 'Edit Organization' : 'Add Organization'}</h1><p className="text-sm text-secondary-500 mt-1">{isEdit ? 'Update organization information.' : 'Register a new response organization.'}</p></div>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <Input label="Organization Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Bangladesh Fire Service" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OrganizationType })}>{ORG_TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}</Select>
          <Select label="District" value={form.district_id} onChange={(e) => setForm({ ...form, district_id: e.target.value })}><option value="">— Select District —</option>{districts.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</Select>
          <Input label="Reference Number" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} placeholder="BFS-001" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@org.gov.bd" />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880..." />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <label htmlFor="active" className="text-sm text-secondary-700">Active</label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>{isEdit ? 'Save Changes' : 'Create Organization'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/organizations')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
