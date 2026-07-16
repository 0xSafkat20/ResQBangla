import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.firstName, form.lastName);
    if (error) { setError(error); setLoading(false); }
    else navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Create your account</h1>
          <p className="text-sm text-secondary-500 mt-1.5">Register to access the NSDRMS platform.</p>
        </div>
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" name="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required leftIcon={<User className="h-4 w-4" />} />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required leftIcon={<User className="h-4 w-4" />} />
          </div>
          <Input label="Email Address" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.gov.bd" required leftIcon={<Mail className="h-4 w-4" />} />
          <Input label="Password" type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" required leftIcon={<Lock className="h-4 w-4" />} />
          <Input label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" required leftIcon={<Lock className="h-4 w-4" />} />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Create Account</Button>
        </form>
        <p className="text-sm text-secondary-500 text-center">Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link></p>
      </div>
    </AuthLayout>
  );
}
