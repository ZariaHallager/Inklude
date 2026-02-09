import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  Users,
  Loader2,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { identities } from '../lib/api';
import type { Identity, PronounSet, Preference, Visibility } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import PronounBadge from '../components/PronounBadge';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 10;

const EMPTY_PRONOUN_SET: Omit<PronounSet, 'id'> = {
  subject: '',
  object: '',
  possessive: '',
  possessive_pronoun: '',
  reflexive: '',
  is_primary: true,
};

const EMPTY_PREFERENCE: Omit<Preference, 'id' | 'updated_at'> = {
  title: null,
  visibility: 'private',
  language_preference: null,
};

interface CreateFormData {
  email: string;
  display_name: string;
  pronoun_sets: Omit<PronounSet, 'id'>[];
  preference: Omit<Preference, 'id' | 'updated_at'>;
}

const INITIAL_FORM: CreateFormData = {
  email: '',
  display_name: '',
  pronoun_sets: [{ ...EMPTY_PRONOUN_SET }],
  preference: { ...EMPTY_PREFERENCE },
};

/* ------------------------------------------------------------------ */
/*  Visibility label helper                                            */
/* ------------------------------------------------------------------ */

function visibilityLabel(v: Visibility) {
  const map: Record<Visibility, string> = {
    public: 'Public',
    internal: 'Internal',
    team: 'Team',
    private: 'Private',
  };
  return map[v] ?? v;
}

/* ------------------------------------------------------------------ */
/*  IdentitiesPage                                                     */
/* ------------------------------------------------------------------ */

export default function IdentitiesPage() {
  const { user } = useAuth();

  /* ── State ──────────────────────────────────────────────────────── */
  const [items, setItems] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Expanded detail panel
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Inline edit
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateFormData>({ ...INITIAL_FORM });
  const [creating, setCreating] = useState(false);

  /* ── Fetch ──────────────────────────────────────────────────────── */
  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await identities.list(p * PAGE_SIZE, PAGE_SIZE);
      setItems(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load identities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  /* ── Handlers ───────────────────────────────────────────────────── */
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const identity = items.find((i) => i.id === id);
      if (identity) setEditName(identity.display_name);
    }
    setConfirmDeleteId(null);
  };

  const handleUpdateName = async (id: string) => {
    setSaving(true);
    try {
      const updated = await identities.update(id, { display_name: editName });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await identities.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setExpandedId(null);
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      await identities.create({
        email: form.email,
        display_name: form.display_name,
        pronoun_sets: form.pronoun_sets,
        preference: form.preference,
      });
      setShowCreate(false);
      setForm({ ...INITIAL_FORM });
      fetchPage(page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  /* ── Form helpers ───────────────────────────────────────────────── */
  const updatePronounSet = (
    idx: number,
    field: keyof Omit<PronounSet, 'id'>,
    value: string | boolean,
  ) => {
    setForm((prev) => {
      const sets = [...prev.pronoun_sets];
      sets[idx] = { ...sets[idx], [field]: value };
      // If setting this set as primary, un-primary others
      if (field === 'is_primary' && value === true) {
        sets.forEach((s, i) => {
          if (i !== idx) s.is_primary = false;
        });
      }
      return { ...prev, pronoun_sets: sets };
    });
  };

  const addPronounSet = () => {
    setForm((prev) => ({
      ...prev,
      pronoun_sets: [
        ...prev.pronoun_sets,
        { ...EMPTY_PRONOUN_SET, is_primary: false },
      ],
    }));
  };

  const removePronounSet = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      pronoun_sets: prev.pronoun_sets.filter((_, i) => i !== idx),
    }));
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Identity Management</h1>
          <p className="text-text-muted text-sm mt-1">
            Manage pronoun identities across your organisation.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
        >
          <Plus size={16} />
          Create Identity
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-bg border border-red/30 text-red px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-4 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-text-muted">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading identities…
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-20">
          <Users className="mx-auto text-text-muted mb-4" size={40} />
          <p className="text-text-muted">No identities found.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 text-accent hover:text-accent-light text-sm font-medium"
          >
            Create your first identity
          </button>
        </div>
      )}

      {/* Identity list */}
      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((identity) => {
            const isExpanded = expandedId === identity.id;
            return (
              <div
                key={identity.id}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                {/* Row */}
                <button
                  onClick={() => toggleExpand(identity.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-2/50 transition-colors"
                >
                  <span className="text-text-muted">
                    {isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </span>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {identity.display_name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {identity.email}
                    </p>
                  </div>

                  {/* Pronoun badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {identity.pronoun_sets.map((ps, idx) => (
                      <PronounBadge
                        key={idx}
                        label={`${ps.subject}/${ps.object}`}
                        isPrimary={ps.is_primary}
                      />
                    ))}
                  </div>

                  {/* Visibility */}
                  {identity.preference && (
                    <span className="text-xs bg-surface-2 text-text-muted px-2 py-1 rounded-full border border-border">
                      {visibilityLabel(identity.preference.visibility)}
                    </span>
                  )}

                  {/* Created date */}
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(identity.created_at).toLocaleDateString()}
                  </span>
                </button>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="border-t border-border bg-surface-2/30 px-6 py-5 space-y-5">
                    {/* Pronoun sets */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                        Pronoun Sets
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {identity.pronoun_sets.map((ps, idx) => (
                          <div
                            key={idx}
                            className={`bg-surface rounded-lg border p-3 text-sm space-y-1 ${
                              ps.is_primary
                                ? 'border-accent/40'
                                : 'border-border'
                            }`}
                          >
                            {ps.is_primary && (
                              <span className="text-[10px] font-semibold uppercase text-accent">
                                Primary
                              </span>
                            )}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                              <span className="text-text-muted">Subject</span>
                              <span className="text-text">{ps.subject}</span>
                              <span className="text-text-muted">Object</span>
                              <span className="text-text">{ps.object}</span>
                              <span className="text-text-muted">Possessive</span>
                              <span className="text-text">{ps.possessive}</span>
                              <span className="text-text-muted">Poss. Pronoun</span>
                              <span className="text-text">{ps.possessive_pronoun}</span>
                              <span className="text-text-muted">Reflexive</span>
                              <span className="text-text">{ps.reflexive}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Edit display name */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                        Edit Display Name
                      </h3>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
                        />
                        <button
                          onClick={() => handleUpdateName(identity.id)}
                          disabled={saving || editName === identity.display_name}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Pencil size={14} />
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="pt-2 border-t border-border">
                      {confirmDeleteId === identity.id ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-red">
                            Are you sure? This cannot be undone.
                          </span>
                          <button
                            onClick={() => handleDelete(identity.id)}
                            disabled={saving}
                            className="px-3 py-1.5 rounded-lg bg-red text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-colors"
                          >
                            {saving ? 'Deleting…' : 'Confirm Delete'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-sm text-text-muted hover:text-text"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(identity.id)}
                          className="inline-flex items-center gap-1.5 text-sm text-red hover:text-red/80 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete Identity
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && (items.length > 0 || page > 0) && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-text-muted">
            Page {page + 1}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Create Identity Modal ──────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-text">
                Create Identity
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-text-muted hover:text-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Basic info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="person@company.com"
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, display_name: e.target.value }))
                    }
                    placeholder="Alex Smith"
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Pronoun sets */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Pronoun Sets
                  </h3>
                  <button
                    onClick={addPronounSet}
                    className="text-xs text-accent hover:text-accent-light transition-colors font-medium"
                  >
                    + Add Set
                  </button>
                </div>
                <div className="space-y-4">
                  {form.pronoun_sets.map((ps, idx) => (
                    <div
                      key={idx}
                      className="bg-bg border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted font-medium">
                          Set {idx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ps.is_primary}
                              onChange={(e) =>
                                updatePronounSet(
                                  idx,
                                  'is_primary',
                                  e.target.checked,
                                )
                              }
                              className="accent-accent"
                            />
                            Primary
                          </label>
                          {form.pronoun_sets.length > 1 && (
                            <button
                              onClick={() => removePronounSet(idx)}
                              className="text-red/70 hover:text-red text-xs transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {(
                          [
                            'subject',
                            'object',
                            'possessive',
                            'possessive_pronoun',
                            'reflexive',
                          ] as const
                        ).map((field) => (
                          <div key={field}>
                            <label className="block text-[11px] text-text-muted mb-1 capitalize">
                              {field.replace('_', ' ')}
                            </label>
                            <input
                              type="text"
                              value={(ps as any)[field]}
                              onChange={(e) =>
                                updatePronounSet(idx, field, e.target.value)
                              }
                              placeholder={field}
                              className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-accent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                  Preferences
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">
                      Title
                    </label>
                    <select
                      value={form.preference.title ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          preference: {
                            ...f.preference,
                            title: e.target.value || null,
                          },
                        }))
                      }
                      className="w-full bg-bg border border-border rounded-md px-2.5 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
                    >
                      <option value="">None</option>
                      {['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.'].map(
                        (t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">
                      Visibility
                    </label>
                    <select
                      value={form.preference.visibility}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          preference: {
                            ...f.preference,
                            visibility: e.target.value as Visibility,
                          },
                        }))
                      }
                      className="w-full bg-bg border border-border rounded-md px-2.5 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
                    >
                      {(['private', 'team', 'internal', 'public'] as const).map(
                        (v) => (
                          <option key={v} value={v}>
                            {visibilityLabel(v)}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">
                      Language
                    </label>
                    <input
                      type="text"
                      value={form.preference.language_preference ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          preference: {
                            ...f.preference,
                            language_preference: e.target.value || null,
                          },
                        }))
                      }
                      placeholder="en"
                      className="w-full bg-bg border border-border rounded-md px-2.5 py-1.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  creating ||
                  !form.email.trim() ||
                  !form.display_name.trim() ||
                  !form.pronoun_sets[0]?.subject
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {creating && <Loader2 className="animate-spin" size={14} />}
                {creating ? 'Creating…' : 'Create Identity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
