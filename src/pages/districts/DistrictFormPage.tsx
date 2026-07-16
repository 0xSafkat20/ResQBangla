import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../lib/toast';
import { useAuditLog } from '../../lib/audit';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/States';
import type { Division, District } from '../../types';

export function DistrictFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name_en: '', name_bn: '', division_id: '', active: true });

  useEffect(() => {
    supabase.from('divisions').select('*').order('name_en').then(({ data }) => setDivisions((data || []) as Division[]));
    if (isEdit) {
      supabase.from('districts').select('*').eq('id', id).maybeSingle().then(({ data, error }) => {
        if (error || !data) { toast('error', 'District not found'); navigate('/districts'); return; }
        const d = data as District;
        setForm({ code: d.code, name_en: d.name_en, name_bn: d.name_bn || '', division_id: d.division_id || '', active: d.active });
        setLoading(false);
      });
    }
  }, [id, isEdit, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { name_en: form.name_en, name_bn: form.name_bn || null, division_id: form.division_id || null, active: form.active };
    if (isEdit) {
      const { error } = await supabase.from('districts').update(payload).eq('id', id);
      if (error) { toast('error', 'Update failed', error.message); }
      else { await log('DISTRICT_UPDATED', 'DISTRICT', id!, form.name_en); toast('success', 'District updated', form.name_en); navigate('/districts'); }
    } else {
      const { data, error } = await supabase.from('districts').insert({ ...payload, code: form.code }).select().single();
      if (error) { toast('error', 'Create failed', error.message); }
      else { await log('DISTRICT_CREATED', 'DISTRICT', data.id, form.name_en); toast('success', 'District created', form.name_en); navigate('/districts'); }
    }
    setSaving(false);
  };

  if (loading) return <LoadingState message="Loading district..." />;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/districts')}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold text-secondary-900">{isEdit ? 'Edit District' : 'Add District'}</h1><p className="text-sm text-secondary-500 mt-1">{isEdit ? 'Update district information.' : 'Create a new administrative district.'}</p></div>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="District Code" name="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="DHK-01" required disabled={isEdit} hint={isEdit ? 'Code cannot be changed' : 'Unique identifier'} />
          <Select label="Division" value={form.division_id} onChange={(e) => setForm({ ...form, division_id: e.target.value })}><option value="">— Select Division —</option>{divisions.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</Select>
          <Input label="Name (English)" name="name_en" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder="Dhaka" required />
          <Input label="Name (Bangla)" name="name_bn" value={form.name_bn} onChange={(e) => setForm({ ...form, name_bn: e.target.value })} placeholder="ঢাকা" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
          <label htmlFor="active" className="text-sm text-secondary-700">Active</label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>{isEdit ? 'Save Changes' : 'Create District'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/districts')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
