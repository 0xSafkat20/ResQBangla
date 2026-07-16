import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSent(true); setLoading(false); }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Reset your password</h1>
          <p className="text-sm text-secondary-500 mt-1.5">Enter your email and we'll send you a recovery link.</p>
        </div>
        {sent ? (
          <div className="space-y-6">
            <div className="flex items-start gap-2.5 rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-sm text-success-700 animate-fade-in">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Recovery link sent to <strong>{email}</strong>. Check your inbox and follow the instructions to reset your password.</span>
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email Address" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.gov.bd" required leftIcon={<Mail className="h-4 w-4" />} />
              <Button type="submit" className="w-full" size="lg" loading={loading}>Send Recovery Link</Button>
            </form>
            <p className="text-sm text-secondary-500 text-center"><Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" />Back to Sign In</Link></p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
