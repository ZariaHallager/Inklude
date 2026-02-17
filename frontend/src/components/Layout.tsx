import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileSearch,
  Users,
  User,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  MessageCircleHeart,
  Heart,
  Sparkles,
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
  const { user, loading, isSignedIn } = useCurrentUser();
  const { user: clerkUser } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-accent" />
          </motion.div>
          <span className="text-text-muted">Loading your workspace...</span>
        </motion.div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const displayName = user?.name || clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress || 'User';
  const email = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <motion.aside
        className="w-64 bg-surface/80 backdrop-blur-xl border-r border-border/50 flex flex-col shrink-0"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="p-6 border-b border-border/50">
          <Link to="/" className="block group">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-8 h-8 text-accent fill-accent/20" />
              </motion.div>
              <span className="text-2xl font-bold font-display bg-gradient-to-r from-accent via-secondary to-tertiary bg-clip-text text-transparent">
                Inklude
              </span>
            </motion.div>
          </Link>
          <p className="text-xs text-text-muted mt-2">Inclusive Language Intelligence</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }, index) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${active
                    ? 'bg-gradient-to-r from-accent/20 to-secondary/10 text-accent-light font-medium shadow-lg shadow-accent/10'
                    : 'text-text-muted hover:text-text hover:bg-surface-2/50 hover:translate-x-1'
                    }`}
                >
                  <Icon size={18} className={active ? 'text-accent' : ''} />
                  {label}
                  {active && (
                    <motion.div
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}

          <AnimatePresence>
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="pt-4 pb-2 px-3">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                {ADMIN_ITEMS.map(({ to, label, icon: Icon }, index) => {
                  const active = location.pathname === to;
                  return (
                    <motion.div
                      key={to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (NAV_ITEMS.length + index) * 0.05, duration: 0.3 }}
                    >
                      <Link
                        to={to}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${active
                          ? 'bg-gradient-to-r from-accent/20 to-secondary/10 text-accent-light font-medium shadow-lg shadow-accent/10'
                          : 'text-text-muted hover:text-text hover:bg-surface-2/50 hover:translate-x-1'
                          }`}
                      >
                        <Icon size={18} className={active ? 'text-accent' : ''} />
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* User info with Clerk UserButton */}
        <motion.div
          className="p-4 border-t border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-2 ring-accent/20",
                  userButtonPopoverCard: "bg-surface border border-border",
                  userButtonPopoverActionButton: "hover:bg-surface-2",
                  userButtonPopoverActionButtonText: "text-text",
                  userButtonPopoverFooter: "hidden",
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-text-muted truncate">{email}</p>
            </div>
            {user?.role && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'super_admin'
                  ? 'bg-accent/20 text-accent'
                  : user.role === 'admin'
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-surface-2 text-text-muted'
                }`}>
                {user.role === 'super_admin' ? 'Super' : user.role === 'admin' ? 'Admin' : 'User'}
              </span>
            )}
          </div>
        </motion.div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          className="max-w-7xl mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
