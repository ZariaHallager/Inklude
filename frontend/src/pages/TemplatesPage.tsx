import { useEffect, useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
} from 'lucide-react';
import { templates } from '../lib/api';
import type { InclusiveTemplate } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

/* ------------------------------------------------------------------ */
/*  Category config                                                   */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Offer Letters', value: 'offer_letter' },
  { label: 'Performance Reviews', value: 'performance_review' },
  { label: 'Job Descriptions', value: 'job_description' },
  { label: 'Announcements', value: 'announcement' },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  offer_letter: 'Offer Letter',
  performance_review: 'Performance Review',
  job_description: 'Job Description',
  announcement: 'Announcement',
};

const CATEGORY_BADGE: Record<string, string> = {
  offer_letter: 'bg-blue-bg text-blue border border-blue/20',
  performance_review: 'bg-yellow-bg text-yellow border border-yellow/20',
  job_description: 'bg-green-bg text-green border border-green/20',
  announcement: 'bg-accent-glow text-accent-light border border-accent/20',
};

/* ------------------------------------------------------------------ */
/*  Empty form state                                                  */
/* ------------------------------------------------------------------ */
const EMPTY_FORM = {
  title: '',
  category: 'offer_letter',
  description: '',
  content: '',
};

/* ================================================================== */
/*  Component                                                         */
/* ================================================================== */
export default function TemplatesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  /* ── State ───────────────────────────────────────────────────────── */
  const [items, setItems] = useState<InclusiveTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* Admin form state */
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  /* ── Fetch templates ─────────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    templates
      .list(category || undefined)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  /* ── Copy to clipboard ───────────────────────────────────────────── */
  async function handleCopy(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  /* ── Admin: open create form ─────────────────────────────────────── */
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setShowForm(true);
  }

  /* ── Admin: open edit form ───────────────────────────────────────── */
  function openEdit(t: InclusiveTemplate) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      category: t.category,
      description: t.description ?? '',
      content: t.content,
    });
    setSaveError('');
    setShowForm(true);
  }

  /* ── Admin: save (create / update) ───────────────────────────────── */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setSaveError('Title and content are required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        title: form.title,
        category: form.category,
        content: form.content,
        description: form.description || undefined,
      };
      if (editingId) {
        const updated = await templates.update(editingId, payload);
        setItems((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      } else {
        const created = await templates.create(payload);
        setItems((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  }

  /* ── Admin: delete ───────────────────────────────────────────────── */
  async function handleDelete(id: string) {
    if (!confirm('Delete this template? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      await templates.delete(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      /* silent */
    } finally {
      setDeleting(null);
    }
  }

  /* ── Form field helper ───────────────────────────────────────────── */
  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveError('');
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */
  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <BookOpen className="inline -mt-1 mr-2 text-accent" size={28} />
            Inclusive Templates
          </h1>
          <p className="text-text-muted mt-2">
            Pre-built templates for common business communications.
          </p>
        </div>

        {isAdmin && !showForm && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} />
            Create Template
          </button>
        )}
      </div>

      {/* ── Category pills ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === c.value
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-text-muted hover:text-text hover:bg-surface-2/80 border border-border'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Admin create / edit form ───────────────────────────────── */}
      {isAdmin && showForm && (
        <div className="bg-surface border border-accent/30 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Template' : 'Create Template'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-text-muted hover:text-text transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              >
                {CATEGORIES.filter((c) => c.value).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-y"
            />

            <textarea
              placeholder="Template content *"
              value={form.content}
              onChange={(e) => updateField('content', e.target.value)}
              rows={10}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-y font-mono"
            />

            {saveError && <p className="text-sm text-red">{saveError}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                {editingId ? 'Update Template' : 'Create Template'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-5 py-2.5 text-sm text-text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Template list ──────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          No templates found.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((t) => {
            const isExpanded = expandedId === t.id;
            const badge = CATEGORY_BADGE[t.category] ?? 'bg-surface-2 text-text-muted border border-border';

            return (
              <div
                key={t.id}
                className="bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-colors"
              >
                {/* Card header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  className="flex items-start justify-between gap-4 w-full px-6 py-4 text-left hover:bg-surface-2/30 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-text">{t.title}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}
                      >
                        {CATEGORY_LABELS[t.category] ?? t.category}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-sm text-text-muted line-clamp-2">{t.description}</p>
                    )}
                    <p className="text-xs text-text-muted/60">
                      Created {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    {/* Copy button (stop propagation to keep expand state) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(t.id, t.content);
                      }}
                      className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent-glow transition-colors"
                      title="Copy template content"
                    >
                      {copiedId === t.id ? (
                        <Check size={16} className="text-green" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>

                    {/* Admin edit / delete */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(t);
                          }}
                          className="p-2 rounded-lg text-text-muted hover:text-yellow hover:bg-yellow-bg transition-colors"
                          title="Edit template"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(t.id);
                          }}
                          disabled={deleting === t.id}
                          className="p-2 rounded-lg text-text-muted hover:text-red hover:bg-red-bg transition-colors disabled:opacity-40"
                          title="Delete template"
                        >
                          {deleting === t.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </>
                    )}

                    {isExpanded ? (
                      <ChevronUp size={18} className="text-text-muted" />
                    ) : (
                      <ChevronDown size={18} className="text-text-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-6 pb-5 border-t border-border">
                    <pre className="mt-4 p-4 bg-bg rounded-lg text-sm text-text whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                      {t.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
