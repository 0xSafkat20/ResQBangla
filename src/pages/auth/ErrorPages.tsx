import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-warning-50 flex items-center justify-center mx-auto"><ShieldAlert className="h-10 w-10 text-warning-500" /></div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Access Denied</h1>
          <p className="text-secondary-500 mt-2">You don't have permission to access this page. Contact your administrator if you believe this is an error.</p>
        </div>
        <Link to="/dashboard"><Button variant="primary">Go to Dashboard</Button></Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-7xl font-bold text-secondary-200">404</div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Page Not Found</h1>
          <p className="text-secondary-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <Link to="/dashboard"><Button variant="primary">Go Home</Button></Link>
      </div>
    </div>
  );
}
