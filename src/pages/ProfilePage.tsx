import { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, Lock, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/toast';
import { useAuditLog } from '../lib/audit';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/States';
import { formatDate } from '../lib/format';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { log } = useAuditLog();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!editing) { setFirstName(user?.firstName || ''); setLastName(user?.lastName || ''); setPhone(user?.phone || ''); }
  }, [user, editing]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ first_name: firstName, last_name: lastName, phone }).eq('id', user?.id);
    if (error) { toast('error', 'Update failed', error.message); }
    else {
      await log('PROFILE_UPDATED', 'USER', user?.id || null, user?.email || null);
      await refreshUser();
      toast('success', 'Profile updated', 'Your changes have been saved.');
      setEditing(false);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast('error', 'Passwords do not match'); return; }
    if (newPassword.length < 8) { toast('error', 'Password too short', 'Must be at least 8 characters.'); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast('error', 'Password change failed', error.message); }
    else { await log('PASSWORD_CHANGED', 'USER', user?.id || null, user?.email || null); toast('success', 'Password changed', 'Your password has been updated.'); setNewPassword(''); setConfirmPassword(''); }
    setChangingPassword(false);
  };

  if (!user) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">My Profile</h1>
        <p className="text-sm text-secondary-500 mt-1">View and manage your account information.</p>
      </div>
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-secondary-900">{user.firstName} {user.lastName}</h2>
              <StatusBadge status={user.status} />
            </div>
            <p className="text-sm text-secondary-500 mt-1">{user.email}</p>
            {user.roles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {user.roles.map((ur) => (
                  <span key={ur.id} className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-0.5 text-xs font-medium"><Shield className="h-3 w-3" />{ur.role?.name}</span>
                ))}
              </div>
            )}
          </div>
          {!editing && <Button variant="outline" onClick={() => setEditing(true)} leftIcon={<Save className="h-4 w-4" />}>Edit</Button>}
        </div>
      </div>
      <div className="card">
        <div className="px-5 py-4 border-b border-secondary-100"><h3 className="text-sm font-semibold text-secondary-900">Personal Information</h3></div>
        <div className="p-5 space-y-4">
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880..." />
              <Input label="Email" value={user.email} disabled />
              <div className="md:col-span-2 flex gap-3 pt-2">
                <Button onClick={handleSave} loading={saving}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField icon={User} label="First Name" value={user.firstName} />
              <InfoField icon={User} label="Last Name" value={user.lastName} />
              <InfoField icon={Mail} label="Email" value={user.email} />
              <InfoField icon={Phone} label="Phone" value={user.phone || '—'} />
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <div className="px-5 py-4 border-b border-secondary-100"><h3 className="text-sm font-semibold text-secondary-900">Security</h3></div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField icon={Calendar} label="Member Since" value={formatDate(user.createdAt)} />
            <InfoField icon={Shield} label="Account Status" value={user.status} />
          </div>
          <div className="border-t border-secondary-100 pt-4 space-y-4">
            <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-secondary-500" /><h4 className="text-sm font-medium text-secondary-700">Change Password</h4></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
              <Input type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
              <div className="flex items-end"><Button onClick={handleChangePassword} loading={changingPassword}>Update Password</Button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-secondary-400"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className="text-sm text-secondary-900 font-medium">{value}</p>
    </div>
  );
}
