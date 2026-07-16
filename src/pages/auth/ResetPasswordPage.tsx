import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); }
    else { setDone(true); setLoading(false); }
  };

  if (done) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="flex items-start gap-2.5 rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-sm text-success-700 animate-fade-in">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Your password has been updated successfully. You can now sign in with your new password.</span>
          </div>
          <Button className="w-full" size="lg" onClick={() => navigate('/login')}>Continue to Sign In</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Set a new password</h1>
          <p className="text-sm text-secondary-500 mt-1.5">Choose a strong password for your account.</p>
        </div>
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="New Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required leftIcon={<Lock className="h-4 w-4" />} />
          <Input label="Confirm Password" type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required leftIcon={<Lock className="h-4 w-4" />} />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Update Password</Button>
        </form>
        <p className="text-sm text-secondary-500 text-center"><Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Back to Sign In</Link></p>
      </div>
    </AuthLayout>
  );
}
