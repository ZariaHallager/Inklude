import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileSearch,
  Users,
  User,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  MessageCircleHeart,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyze', label: 'Analyze Text', icon: FileSearch },
  { to: '/identities', label: 'Identities', icon: Users },
  { to: '/my-profile', label: 'My Pronouns', icon: User },
  { to: '/neo-pronouns', label: 'Neo-Pronouns', icon: MessageCircleHeart },
  { to: '/templates', label: 'Templates', icon: BookOpen },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const ADMIN_ITEMS = [
  { to: '/admin', label: 'Admin Console', icon: Shield },
  { to: '/admin/users', label: 'User Management', icon: Settings },
];

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            <span className="text-accent">Ink</span>lude
          </Link>
          <p className="text-xs text-text-muted mt-1">Inclusive Language Intelligence</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-accent-glow text-accent-light font-medium'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Admin
                </span>
              </div>
              {ADMIN_ITEMS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-accent-glow text-accent-light font-medium'
                        : 'text-text-muted hover:text-text hover:bg-surface-2'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.display_name}</p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-text-muted hover:text-red transition-colors p-1"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
