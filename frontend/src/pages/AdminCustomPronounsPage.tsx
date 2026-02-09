import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  MessageCircleHeart,
  CheckCircle,
  Trash2,
  Clock,
  Filter,
} from 'lucide-react';
import { customPronouns } from '../lib/api';
import type { CustomPronounSet } from '../lib/types';

type TabFilter = 'pending' | 'approved' | 'all';

export default function AdminCustomPronounsPage() {
  const { user, loading: authLoading } = useAuth();
  const [pronouns, setPronouns] = useState<CustomPronounSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('pending');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    customPronouns
      .list()
      .then(setPronouns)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = pronouns.filter((p) => {
    if (tab === 'pending') return !p.is_approved;
    if (tab === 'approved') return p.is_approved;
    return true;
  });

  const handleApprove = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const updated = await customPronouns.approve(id);
      setPronouns((prev) =>
        prev.map((p) => (p.id === id ? updated : p)),
      );
    } catch (err) {
      console.error('Failed to approve:', err);
    }
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleDelete = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await customPronouns.delete(id);
      setPronouns((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const tabCounts = {
    pending: pronouns.filter((p) => !p.is_approved).length,
    approved: pronouns.filter((p) => p.is_approved).length,
    all: pronouns.length,
  };

  if (authLoading) {
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
          <MessageCircleHeart className="text-accent" size={28} />
          Custom Pronoun Approvals
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
        {(['pending', 'approved', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === t
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            {t === 'pending' && <Clock size={14} />}
            {t === 'approved' && <CheckCircle size={14} />}
            {t === 'all' && <Filter size={14} />}
            <span className="capitalize">{t}</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                tab === t
                  ? 'bg-white/20'
                  : 'bg-surface-2 text-text-muted'
              }`}
            >
              {tabCounts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Pronoun List */}
      {loading ? (
        <div className="text-text-muted text-center py-12 animate-pulse">
          Loading submissions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <MessageCircleHeart
            size={40}
            className="text-text-muted mx-auto mb-3"
          />
          <p className="text-text-muted">
            No {tab === 'all' ? '' : tab} pronoun submissions found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-surface border border-border rounded-xl p-5 hover:border-border/80 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  {/* Label & Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{p.label}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                        p.is_approved
                          ? 'bg-green-bg text-green'
                          : 'bg-yellow-bg text-yellow'
                      }`}
                    >
                      {p.is_approved ? (
                        <>
                          <CheckCircle size={12} />
                          Approved
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Conjugation */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[
                      { label: 'Subject', value: p.subject },
                      { label: 'Object', value: p.object },
                      { label: 'Possessive', value: p.possessive },
                      { label: 'Poss. Pronoun', value: p.possessive_pronoun },
                      { label: 'Reflexive', value: p.reflexive },
                    ].map((form) => (
                      <span
                        key={form.label}
                        className="inline-flex items-center gap-1.5 bg-surface-2 rounded-lg px-2.5 py-1 text-xs"
                      >
                        <span className="text-text-muted">{form.label}:</span>
                        <span className="text-text font-medium">
                          {form.value}
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>
                      Submitted by:{' '}
                      <span className="text-text">{p.submitted_by}</span>
                    </span>
                    <span>
                      {new Date(p.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Usage note / example */}
                  {(p.usage_note || p.example) && (
                    <div className="mt-2 text-xs text-text-muted space-y-0.5">
                      {p.usage_note && <p>Note: {p.usage_note}</p>}
                      {p.example && (
                        <p>
                          Example:{' '}
                          <span className="italic text-text/80">
                            {p.example}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!p.is_approved && (
                    <button
                      onClick={() => handleApprove(p.id)}
                      disabled={actionLoading[p.id]}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green/10 text-green text-sm font-medium hover:bg-green/20 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={actionLoading[p.id]}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red/10 text-red text-sm font-medium hover:bg-red/20 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
