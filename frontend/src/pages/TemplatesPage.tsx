import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
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
  Wand2,
} from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import TemplateModal from '../components/TemplateModal';
import type { InclusiveTemplate } from '../lib/types';
import { fadeInUp, staggerContainer } from '../animations/variants';

/* ------------------------------------------------------------------ */
/*  Category config                                                   */
/* ------------------------------------------------------------------ */
type Category = 'offer_letter' | 'performance_review' | 'job_description' | 'announcement';

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
  offer_letter: 'bg-tertiary/10 text-tertiary border border-tertiary/20',
  performance_review: 'bg-warning/10 text-warning border border-warning/20',
  job_description: 'bg-success/10 text-success border border-success/20',
  announcement: 'bg-accent/10 text-accent border border-accent/20',
};

/* ------------------------------------------------------------------ */
/*  Empty form state                                                  */
/* ------------------------------------------------------------------ */
const EMPTY_FORM = {
  title: '',
  category: 'offer_letter' as Category,
  description: '',
  content: '',
};

/* ================================================================== */
/*  Component                                                         */
/* ================================================================== */
export default function TemplatesPage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  /* ── State ───────────────────────────────────────────────────────── */
  const [category, setCategory] = useState<Category | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* Admin form state */
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [useTemplateId, setUseTemplateId] = useState<string | null>(null);

  /* ── Convex queries and mutations ─────────────────────────────────── */
  const templatesData = useQuery(api.templates.listTemplates,
    category ? { category: category as Category } : {}
  );
  const createTemplate = useMutation(api.templates.createTemplate);
  const updateTemplate = useMutation(api.templates.updateTemplate);
  const deleteTemplateMutation = useMutation(api.templates.deleteTemplate);

  const loading = templatesData === undefined;
  const items = templatesData || [];

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
  function openEdit(t: any) {
    setEditingId(t._id);
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
      if (editingId) {
        await updateTemplate({
          templateId: editingId as any,
          title: form.title,
          category: form.category,
          content: form.content,
          description: form.description || undefined,
        });
      } else {
        await createTemplate({
          title: form.title,
          category: form.category,
          content: form.content,
          description: form.description || undefined,
        });
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
      await deleteTemplateMutation({ templateId: id as any });
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
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div
        className="flex items-start justify-between gap-4"
        variants={fadeInUp as Parameters<typeof motion.div>[0]['variants']}
      >
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BookOpen className="inline -mt-1 mr-2 text-accent" size={28} />
            </motion.span>
            Inclusive Templates
          </h1>
          <p className="text-text-muted mt-2">
            Pre-built templates for common business communications.
          </p>
        </div>

        {isAdmin && !showForm && (
          <motion.button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-accent/30 shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} />
            Create Template
          </motion.button>
        )}
      </motion.div>

      {/* ── Category pills ─────────────────────────────────────────── */}
      <motion.div
        className="flex flex-wrap items-center gap-2"
        variants={fadeInUp as Parameters<typeof motion.div>[0]['variants']}
      >
        {CATEGORIES.map((c, index) => (
          <motion.button
            key={c.value}
            onClick={() => setCategory(c.value as Category | '')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${category === c.value
              ? 'bg-gradient-to-r from-accent to-secondary text-white shadow-lg shadow-accent/20'
              : 'bg-surface-2/50 text-text-muted hover:text-text hover:bg-surface-2 border border-border/50'
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {c.label}
          </motion.button>
        ))}
      </motion.div>

      {/* ── Admin create / edit form ───────────────────────────────── */}
      <AnimatePresence>
        {isAdmin && showForm && (
          <motion.div
            className="bg-surface/80 backdrop-blur border border-accent/30 rounded-2xl p-6 space-y-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-display">
                {editingId ? 'Edit Template' : 'Create Template'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-text-muted hover:text-text transition-colors"
                aria-label="Close form"
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
                  className="w-full px-4 py-2.5 bg-bg/50 border border-border/50 rounded-xl text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg/50 border border-border/50 rounded-xl text-sm text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  aria-label="Template category"
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
                className="w-full px-4 py-2.5 bg-bg/50 border border-border/50 rounded-xl text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-y"
              />

              <textarea
                placeholder="Template content *"
                value={form.content}
                onChange={(e) => updateField('content', e.target.value)}
                rows={10}
                className="w-full px-4 py-2.5 bg-bg/50 border border-border/50 rounded-xl text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-y font-mono"
              />

              {saveError && <p className="text-sm text-error">{saveError}</p>}

              <div className="flex items-center gap-3">
                <motion.button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={16} />
                    </motion.div>
                  )}
                  {editingId ? 'Update Template' : 'Create Template'}
                </motion.button>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Template list ──────────────────────────────────────────── */}
      {loading ? (
        <motion.div
          className="flex items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="text-accent" size={28} />
          </motion.div>
        </motion.div>
      ) : items.length === 0 ? (
        <motion.div
          className="text-center py-20 text-text-muted"
          variants={fadeInUp as Parameters<typeof motion.div>[0]['variants']}
        >
          No templates found.
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={staggerContainer}
        >
          {items.map((t: any) => {
            const isExpanded = expandedId === t._id;
            const badge = CATEGORY_BADGE[t.category] ?? 'bg-surface-2/50 text-text-muted border border-border/50';

            return (
              <motion.div
                key={t._id}
                variants={fadeInUp as Parameters<typeof motion.div>[0]['variants']}
                className="bg-surface/80 backdrop-blur border border-border/50 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300"
              >
                {/* Card header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : t._id)}
                  className="flex items-start justify-between gap-4 w-full px-6 py-4 text-left hover:bg-surface-2/30 transition-colors"
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${t.title}`}
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-text">{t.title}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${badge}`}
                      >
                        {CATEGORY_LABELS[t.category] ?? t.category}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-sm text-text-muted line-clamp-2">{t.description}</p>
                    )}
                    <p className="text-xs text-text-muted/60">
                      Created {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    {/* Use Template button */}
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUseTemplateId(t._id);
                      }}
                      className="p-2 rounded-xl text-text-muted hover:text-secondary hover:bg-secondary/10 transition-colors"
                      aria-label="Use template"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Wand2 size={16} />
                    </motion.button>

                    {/* Copy button */}
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(t._id, t.content);
                      }}
                      className="p-2 rounded-xl text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                      aria-label={copiedId === t._id ? 'Copied' : 'Copy template'}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copiedId === t._id ? (
                        <Check size={16} className="text-success" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </motion.button>

                    {/* Admin edit / delete */}
                    {isAdmin && (
                      <>
                        <motion.button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(t);
                          }}
                          className="p-2 rounded-xl text-text-muted hover:text-warning hover:bg-warning/10 transition-colors"
                          aria-label="Edit template"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Pencil size={16} />
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(t._id);
                          }}
                          disabled={deleting === t._id}
                          className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40"
                          aria-label="Delete template"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {deleting === t._id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 size={16} />
                            </motion.div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </motion.button>
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
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="px-6 pb-5 border-t border-border/50"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <pre className="mt-4 p-4 bg-bg/50 rounded-xl text-sm text-text whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                        {t.content}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Template Use Modal */}
      {useTemplateId && (() => {
        const template = items.find((t: any) => t._id === useTemplateId);
        if (!template) return null;
        const inclusiveTemplate: InclusiveTemplate = {
          id: template._id,
          title: template.title,
          category: template.category,
          description: template.description ?? null,
          content: template.content,
          created_by: template.createdBy ?? null,
          created_at: typeof template.createdAt === 'number' ? new Date(template.createdAt).toISOString() : String(template.createdAt),
          updated_at: typeof template.updatedAt === 'number' ? new Date(template.updatedAt).toISOString() : String(template.updatedAt),
        };
        return (
          <TemplateModal
            template={inclusiveTemplate}
            onClose={() => setUseTemplateId(null)}
          />
        );
      })()}
    </motion.div>
  );
}
