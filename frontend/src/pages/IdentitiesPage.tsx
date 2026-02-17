import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  Users,
  Loader2,
} from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import PronounBadge from '../components/PronounBadge';
import { fadeInUp, staggerContainer } from '../animations/variants';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Visibility = 'private' | 'team' | 'internal' | 'public';
type Title = 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Dr.' | 'Prof.' | null;

interface PronounSetForm {
  subject: string;
  object: string;
  possessive: string;
  possessivePronoun: string;
  reflexive: string;
  isPrimary: boolean;
}

interface CreateFormData {
  email: string;
  displayName: string;
  pronounSets: PronounSetForm[];
  title: Title;
  visibility: Visibility;
}

const EMPTY_PRONOUN_SET: PronounSetForm = {
  subject: '',
  object: '',
  possessive: '',
  possessivePronoun: '',
  reflexive: '',
  isPrimary: true,
};

const INITIAL_FORM: CreateFormData = {
  email: '',
  displayName: '',
  pronounSets: [{ ...EMPTY_PRONOUN_SET }],
  title: null,
  visibility: 'internal',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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
  const { user } = useCurrentUser();

  // Convex queries and mutations
  const identitiesData = useQuery(api.identities.listIdentities, { limit: 50 });
  const createIdentity = useMutation(api.identities.createIdentity);
  const updateIdentity = useMutation(api.identities.updateIdentity);
  const deleteIdentityMutation = useMutation(api.identities.deleteIdentity);

  const loading = identitiesData === undefined;
  const items = identitiesData?.identities || [];

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateFormData>({ ...INITIAL_FORM });
  const [creating, setCreating] = useState(false);

  /* ── Handlers ───────────────────────────────────────────────────── */
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const identity = items.find((i: any) => i._id === id);
      if (identity) setEditName(identity.displayName);
    }
    setConfirmDeleteId(null);
  };

  const handleUpdateName = async (id: string) => {
    setSaving(true);
    try {
      await updateIdentity({ identityId: id as any, displayName: editName });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await deleteIdentityMutation({ identityId: id as any });
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
      await createIdentity({
        email: form.email,
        displayName: form.displayName,
        pronounSets: form.pronounSets,
        title: form.title || undefined,
        visibility: form.visibility,
      });
      setShowCreate(false);
      setForm({ ...INITIAL_FORM });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  /* ── Form helpers ───────────────────────────────────────────────── */
  const updatePronounSet = (
    idx: number,
    field: keyof PronounSetForm,
    value: string | boolean,
  ) => {
    setForm((prev) => {
      const sets = [...prev.pronounSets];
      sets[idx] = { ...sets[idx], [field]: value };
      if (field === 'isPrimary' && value === true) {
        sets.forEach((s, i) => {
          if (i !== idx) s.isPrimary = false;
        });
      }
      return { ...prev, pronounSets: sets };
    });
  };

  const addPronounSet = () => {
    setForm((prev) => ({
      ...prev,
      pronounSets: [
        ...prev.pronounSets,
        { ...EMPTY_PRONOUN_SET, isPrimary: false },
      ],
    }));
  };

  const removePronounSet = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      pronounSets: prev.pronounSets.filter((_, i) => i !== idx),
    }));
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        variants={fadeInUp}
      >
        <div>
          <h1 className="text-2xl font-bold font-display text-text">Identity Management</h1>
          <p className="text-text-muted text-sm mt-1">
            Manage pronoun identities across your organisation.
          </p>
        </div>
        <motion.button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-secondary text-white text-sm font-medium hover:shadow-lg hover:shadow-accent/30 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={16} />
          Create Identity
        </motion.button>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-xl text-sm flex items-center justify-between"
          >
            {error}
            <button onClick={() => setError(null)} className="ml-4 hover:text-white" title="Dismiss">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <motion.div
          className="flex items-center justify-center py-20 text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="mr-2" size={20} />
          </motion.div>
          Loading identities…
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <motion.div
          className="text-center py-20"
          variants={fadeInUp}
        >
          <Users className="mx-auto text-text-muted mb-4" size={40} />
          <p className="text-text-muted">No identities found.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 text-accent hover:text-accent-light text-sm font-medium"
          >
            Create your first identity
          </button>
        </motion.div>
      )}

      {/* Identity list */}
      {!loading && items.length > 0 && (
        <motion.div
          className="space-y-2"
          variants={staggerContainer}
        >
          {items.map((identity: any, index: number) => {
            const isExpanded = expandedId === identity._id;
            return (
              <motion.div
                key={identity._id}
                variants={fadeInUp}
                className="bg-surface/80 backdrop-blur border border-border/50 rounded-2xl overflow-hidden hover:border-accent/30 transition-colors"
              >
                {/* Row */}
                <button
                  onClick={() => toggleExpand(identity._id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-2/30 transition-colors"
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
                      {identity.displayName}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {identity.email}
                    </p>
                  </div>

                  {/* Pronoun badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {identity.pronounSets?.map((ps: any, idx: number) => (
                      <PronounBadge
                        key={idx}
                        label={`${ps.subject}/${ps.object}`}
                        isPrimary={ps.isPrimary}
                      />
                    ))}
                  </div>

                  {/* Visibility */}
                  {identity.preference && (
                    <span className="text-xs bg-surface-2/50 text-text-muted px-2 py-1 rounded-lg border border-border/50">
                      {visibilityLabel(identity.preference.visibility)}
                    </span>
                  )}

                  {/* Created date */}
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(identity.createdAt).toLocaleDateString()}
                  </span>
                </button>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50 bg-surface-2/20 px-6 py-5 space-y-5"
                    >
                      {/* Pronoun sets */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                          Pronoun Sets
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {identity.pronounSets?.map((ps: any, idx: number) => (
                            <div
                              key={idx}
                              className={`bg-surface/80 rounded-xl border p-3 text-sm space-y-1 ${ps.isPrimary
                                ? 'border-accent/40'
                                : 'border-border/50'
                                }`}
                            >
                              {ps.isPrimary && (
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
                                <span className="text-text">{ps.possessivePronoun}</span>
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
                            title="Display name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Display name"
                            className="flex-1 bg-surface/80 border border-border/50 rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/50"
                          />
                          <motion.button
                            onClick={() => handleUpdateName(identity._id)}
                            disabled={saving || editName === identity.displayName}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Pencil size={14} />
                            {saving ? 'Saving…' : 'Save'}
                          </motion.button>
                        </div>
                      </div>

                      {/* Delete */}
                      <div className="pt-2 border-t border-border/50">
                        {confirmDeleteId === identity._id ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-error">
                              Are you sure? This cannot be undone.
                            </span>
                            <button
                              onClick={() => handleDelete(identity._id)}
                              disabled={saving}
                              className="px-3 py-1.5 rounded-lg bg-error text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-colors"
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
                            onClick={() => setConfirmDeleteId(identity._id)}
                            className="inline-flex items-center gap-1.5 text-sm text-error hover:text-error/80 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete Identity
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Create Identity Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-2xl bg-surface/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-border/50 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-lg font-semibold font-display text-text">
                  Create Identity
                </h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-text-muted hover:text-text transition-colors"
                  title="Close"
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
                      className="w-full bg-bg/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, displayName: e.target.value }))
                      }
                      placeholder="Alex Smith"
                      className="w-full bg-bg/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50"
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
                    {form.pronounSets.map((ps, idx) => (
                      <div
                        key={idx}
                        className="bg-bg/50 border border-border/50 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-muted font-medium">
                            Set {idx + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                              <input
                                type="checkbox"
                                checked={ps.isPrimary}
                                onChange={(e) =>
                                  updatePronounSet(
                                    idx,
                                    'isPrimary',
                                    e.target.checked,
                                  )
                                }
                                className="accent-accent"
                              />
                              Primary
                            </label>
                            {form.pronounSets.length > 1 && (
                              <button
                                onClick={() => removePronounSet(idx)}
                                className="text-error/70 hover:text-error text-xs transition-colors"
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
                              'possessivePronoun',
                              'reflexive',
                            ] as const
                          ).map((field) => (
                            <div key={field}>
                              <label className="block text-[11px] text-text-muted mb-1 capitalize">
                                {field.replace(/([A-Z])/g, ' $1').trim()}
                              </label>
                              <input
                                type="text"
                                value={ps[field] as string}
                                onChange={(e) =>
                                  updatePronounSet(idx, field, e.target.value)
                                }
                                placeholder={field}
                                className="w-full bg-surface/80 border border-border/50 rounded-lg px-2.5 py-1.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50"
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">
                        Title
                      </label>
                      <select
                        title="Title"
                        value={form.title ?? ''}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            title: (e.target.value || null) as Title,
                          }))
                        }
                        className="w-full bg-bg/50 border border-border/50 rounded-lg px-2.5 py-1.5 text-sm text-text focus:outline-none focus:border-accent/50"
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
                        title="Visibility"
                        value={form.visibility}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            visibility: e.target.value as Visibility,
                          }))
                        }
                        className="w-full bg-bg/50 border border-border/50 rounded-lg px-2.5 py-1.5 text-sm text-text focus:outline-none focus:border-accent/50"
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
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-surface/95 backdrop-blur border-t border-border/50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-sm text-text-muted hover:text-text hover:bg-surface-2/50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreate}
                  disabled={
                    creating ||
                    !form.email.trim() ||
                    !form.displayName.trim() ||
                    !form.pronounSets[0]?.subject
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-secondary text-white text-sm font-medium hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {creating && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={14} />
                    </motion.div>
                  )}
                  {creating ? 'Creating…' : 'Create Identity'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
