import { type ReactNode, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Building2, Shield, ScrollText, User, LogOut, Menu, X, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { hasPermission, PERMISSIONS } from '../../lib/permissions';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/cn';

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; permission: string }

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
  { to: '/users', label: 'User Management', icon: Users, permission: PERMISSIONS.USERS_VIEW },
  { to: '/districts', label: 'Districts', icon: MapPin, permission: PERMISSIONS.DISTRICTS_VIEW },
  { to: '/organizations', label: 'Organizations', icon: Building2, permission: PERMISSIONS.ORGANIZATIONS_VIEW },
  { to: '/roles', label: 'Roles & Permissions', icon: Shield, permission: PERMISSIONS.ROLES_VIEW },
  { to: '/audit', label: 'Audit Logs', icon: ScrollText, permission: PERMISSIONS.AUDIT_VIEW },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const visibleNav = navItems.filter((item) => hasPermission(user?.permissions || [], item.permission));
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-secondary-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn('fixed lg:sticky top-0 z-40 h-screen w-64 bg-secondary-900 text-white flex flex-col transition-transform duration-300 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center gap-3 px-6 h-16 border-b border-secondary-800">
          <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center"><ShieldCheck className="h-6 w-6" /></div>
          <div><p className="font-bold text-sm">National Smart Disaster Response</p><p className="text-xs text-secondary-400">Admin Platform</p></div>
          <button className="ml-auto lg:hidden text-secondary-400" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
          {visibleNav.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-800 hover:text-white')}>
              <item.icon className="h-5 w-5 shrink-0" />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-secondary-800 p-3 space-y-1">
          <NavLink to="/profile" onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-secondary-800 text-white' : 'text-secondary-300 hover:bg-secondary-800 hover:text-white')}>
            <User className="h-5 w-5" />My Profile
          </NavLink>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-300 hover:bg-danger-600 hover:text-white transition-colors">
            <LogOut className="h-5 w-5" />Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-secondary-200 flex items-center px-4 lg:px-6 gap-4">
          <button className="lg:hidden text-secondary-600" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-secondary-300 shrink-0" />}
                <span className={cn('truncate', i === breadcrumbs.length - 1 ? 'text-secondary-900 font-medium' : 'text-secondary-400')}>{crumb}</span>
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-secondary-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-secondary-400">{user?.roles?.[0]?.role?.name || 'User'}</p>
            </div>
            <Avatar firstName={user?.firstName || ''} lastName={user?.lastName || ''} size="sm" />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

function generateBreadcrumbs(path: string): string[] {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return ['Home'];
  const crumbs = ['Home'];
  for (const part of parts) {
    if (part === 'dashboard') crumbs.push('Dashboard');
    else if (part === 'users') crumbs.push('Users');
    else if (part === 'districts') crumbs.push('Districts');
    else if (part === 'organizations') crumbs.push('Organizations');
    else if (part === 'roles') crumbs.push('Roles');
    else if (part === 'audit') crumbs.push('Audit Logs');
    else if (part === 'profile') crumbs.push('Profile');
    else if (part === 'new') crumbs.push('Create');
    else if (part === 'edit') crumbs.push('Edit');
    else crumbs.push(part.charAt(0).toUpperCase() + part.slice(1));
  }
  return crumbs;
}
