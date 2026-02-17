import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  ArrowLeft,
  Users,
  ChevronDown,
} from 'lucide-react';

const ROLE_STYLES: Record<string, { badge: string; label: string }> = {
  user: { badge: 'bg-blue-bg text-blue', label: 'User' },
  admin: { badge: 'bg-yellow-bg text-yellow', label: 'Admin' },
  super_admin: { badge: 'bg-red-bg text-red', label: 'Super Admin' },
};

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const users = useQuery(api.auth.listUsers);
  const updateRole = useMutation(api.auth.updateUserRole);
  const [openDropdown, setOpenDropdown] = useState<Id<"accounts"> | null>(null);

  const handleRoleChange = async (accountId: Id<"accounts">, newRole: "user" | "admin" | "super_admin") => {
    try {
      await updateRole({ accountId, role: newRole });
    } catch (err) {
      console.error('Failed to update role:', err);
    }
    setOpenDropdown(null);
  };

  if (authLoading || users === undefined) {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Admin Console
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-accent" size={28} />
          User Management
        </h1>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/50">
                <th className="text-left px-5 py-3.5 font-semibold text-text-muted">
                  User
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-text-muted">
                  Email
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-text-muted">
                  Role
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-text-muted">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-text-muted">
                  Last Login
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleStyle = ROLE_STYLES[u.role] ?? ROLE_STYLES.user;
                  const displayName = u.name || u.email.split('@')[0];
                  return (
                    <tr
                      key={u._id}
                      className="border-b border-border/50 hover:bg-surface-2/30 transition-colors"
                    >
                      {/* Avatar + Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img
                              src={u.picture}
                              alt=""
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium">{displayName}</span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-3.5 text-text-muted">{u.email}</td>
                      {/* Role Badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${roleStyle.badge}`}
                        >
                          {roleStyle.label}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green">
                          <span className="w-1.5 h-1.5 rounded-full bg-green" />
                          Active
                        </span>
                      </td>
                      {/* Last Login */}
                      <td className="px-5 py-3.5 text-text-muted">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === u._id ? null : u._id,
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 text-text-muted hover:text-text text-xs font-medium transition-colors cursor-pointer"
                          >
                            Change Role
                            <ChevronDown size={14} />
                          </button>
                          {openDropdown === u._id && (
                            <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-lg shadow-xl shadow-black/40 z-10 py-1">
                              {(['user', 'admin', 'super_admin'] as const).map(
                                (role) => (
                                  <button
                                    key={role}
                                    onClick={() =>
                                      handleRoleChange(u._id, role)
                                    }
                                    className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${u.role === role
                                      ? 'text-accent bg-accent-glow'
                                      : 'text-text-muted hover:text-text hover:bg-surface-2'
                                      }`}
                                  >
                                    {ROLE_STYLES[role].label}
                                  </button>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
