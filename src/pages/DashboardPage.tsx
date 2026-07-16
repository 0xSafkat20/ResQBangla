import { useEffect, useState } from 'react';
import { Users, Building2, MapPin, Shield, Activity, ScrollText, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { hasPermission, PERMISSIONS } from '../lib/permissions';
import { StatusBadge } from '../components/ui/Badge';
import { LoadingState, ErrorState } from '../components/ui/States';
import { formatRelativeTime, titleCase } from '../lib/format';
import { cn } from '../lib/cn';
import type { AuditLog } from '../types';

interface Stats { totalUsers: number; activeUsers: number; totalDistricts: number; totalOrganizations: number; totalRoles: number; recentAudit: AuditLog[] }

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true); setError(false);
    try {
      const [usersRes, activeRes, distRes, orgRes, rolesRes, auditRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('districts').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('roles').select('*', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(8),
      ]);
      setStats({
        totalUsers: usersRes.count || 0,
        activeUsers: activeRes.count || 0,
        totalDistricts: distRes.count || 0,
        totalOrganizations: orgRes.count || 0,
        totalRoles: rolesRes.count || 0,
        recentAudit: (auditRes.data || []) as AuditLog[],
      });
    } catch { setError(true); }
    setLoading(false);
  };

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error || !stats) return <ErrorState message="Failed to load dashboard data" onRetry={loadStats} />;

  const perms = user?.permissions || [];
  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary', show: hasPermission(perms, PERMISSIONS.USERS_VIEW) },
    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'success', show: hasPermission(perms, PERMISSIONS.USERS_VIEW) },
    { label: 'Active Districts', value: stats.totalDistricts, icon: MapPin, color: 'accent', show: hasPermission(perms, PERMISSIONS.DISTRICTS_VIEW) },
    { label: 'Organizations', value: stats.totalOrganizations, icon: Building2, color: 'warning', show: hasPermission(perms, PERMISSIONS.ORGANIZATIONS_VIEW) },
    { label: 'System Roles', value: stats.totalRoles, icon: Shield, color: 'primary', show: true },
  ].filter((c) => c.show);
  const colorMap: Record<string, string> = { primary: 'bg-primary-50 text-primary-600', success: 'bg-success-50 text-success-600', accent: 'bg-accent-50 text-accent-600', warning: 'bg-warning-50 text-warning-600' };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-sm text-secondary-500 mt-1">Welcome back, {user?.firstName}. Here's the system overview.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5 space-y-3 hover:shadow-card transition-shadow">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', colorMap[card.color])}><card.icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-secondary-900">{card.value}</p><p className="text-xs text-secondary-500 mt-0.5">{card.label}</p></div>
          </div>
        ))}
      </div>
      {hasPermission(perms, PERMISSIONS.AUDIT_VIEW) && (
        <div className="card">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-secondary-100">
            <Activity className="h-4 w-4 text-secondary-500" /><h2 className="text-sm font-semibold text-secondary-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-secondary-50">
            {stats.recentAudit.length === 0 ? <div className="px-5 py-8 text-center text-sm text-secondary-400">No recent activity</div> : stats.recentAudit.map((log) => (
              <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary-50/50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center shrink-0"><ScrollText className="h-4 w-4 text-secondary-500" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary-700"><span className="font-medium">{log.actor_email || 'System'}</span> — <span className="text-secondary-500">{titleCase(log.action.replace(/_/g, ' '))}</span></p>
                  <p className="text-xs text-secondary-400 mt-0.5">{log.entity_name && `${log.entity_name} · `}{formatRelativeTime(log.created_at)}</p>
                </div>
                <StatusBadge status={log.result} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
