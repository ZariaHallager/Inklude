import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Users,
  Settings,
  MessageCircleHeart,
  ScrollText,
  ChevronRight,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    to: '/admin/users',
    label: 'User Management',
    description: 'View, edit, and manage user accounts and roles',
    icon: Users,
    color: 'text-blue',
    bg: 'bg-blue-bg',
  },
  {
    to: '/admin/policies',
    label: 'Policy Configuration',
    description: 'Configure enforcement modes, checks, and defaults',
    icon: Settings,
    color: 'text-yellow',
    bg: 'bg-yellow-bg',
  },
  {
    to: '/admin/custom-pronouns',
    label: 'Custom Pronoun Approvals',
    description: 'Review and approve submitted custom pronoun sets',
    icon: MessageCircleHeart,
    color: 'text-green',
    bg: 'bg-green-bg',
  },
  {
    to: '/admin/audit-log',
    label: 'Audit Log',
    description: 'Track all administrative actions and system events',
    icon: ScrollText,
    color: 'text-accent',
    bg: 'bg-accent-glow',
  },
];

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-text-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="text-accent" size={28} />
          Admin Console
        </h1>
        <p className="text-text-muted mt-1">
          Manage users, policies, and system configuration
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group bg-surface border border-border rounded-xl p-6 hover:border-accent/40 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}
                >
                  <action.icon size={22} className={action.color} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-text-muted text-sm mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-text-muted group-hover:text-accent transition-colors mt-1 shrink-0"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
