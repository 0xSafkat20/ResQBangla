import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) { setError(error); setLoading(false); }
    else navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Sign in to NSDRMS</h1>
          <p className="text-sm text-secondary-500 mt-1.5">Enter your credentials to access the platform.</p>
        </div>
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email Address" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.gov.bd" required leftIcon={<Mail className="h-4 w-4" />} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required leftIcon={<Lock className="h-4 w-4" />} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-secondary-400 hover:text-secondary-600">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex justify-end"><Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Forgot password?</Link></div>
          <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
        </form>
        <p className="text-sm text-secondary-500 text-center">Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Create one</Link></p>
      </div>
    </AuthLayout>
  );
}
