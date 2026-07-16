import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-14V14h-2v6h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-14V14H4v6H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20"><ShieldCheck className="h-7 w-7" /></div>
            <div><p className="text-lg font-bold">NSDRMS</p><p className="text-xs text-primary-200">National Smart Disaster Response</p></div>
          </div>
          <div className="space-y-6 max-w-md">
            <h1 className="text-3xl font-bold leading-tight">Coordinated disaster response starts here.</h1>
            <p className="text-primary-200 text-lg leading-relaxed">Manage districts, organizations, responders, and resources through a unified national platform.</p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div><p className="text-2xl font-bold">64</p><p className="text-xs text-primary-300">Districts</p></div>
              <div><p className="text-2xl font-bold">8</p><p className="text-xs text-primary-300">Divisions</p></div>
              <div><p className="text-2xl font-bold">24/7</p><p className="text-xs text-primary-300">Monitoring</p></div>
            </div>
          </div>
          <p className="text-xs text-primary-300">Government of Bangladesh · Phase 1</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-secondary-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
