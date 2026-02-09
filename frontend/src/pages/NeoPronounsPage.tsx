import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Sparkles,
  Tag,
  Clock,
  Loader2,
} from 'lucide-react';
import { neoPronouns, customPronouns } from '../lib/api';
import type { NeoPronoun, CustomPronounSet } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

/* ------------------------------------------------------------------ */
/*  Popularity filter config                                          */
/* ------------------------------------------------------------------ */
const POPULARITY_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Common', value: 'common' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Emerging', value: 'emerging' },
  { label: 'Historical', value: 'historical' },
] as const;

const POPULARITY_BADGE_COLORS: Record<string, string> = {
  common: 'bg-green-bg text-green border border-green/20',
  moderate: 'bg-blue-bg text-blue border border-blue/20',
  emerging: 'bg-yellow-bg text-yellow border border-yellow/20',
  historical: 'bg-surface-2 text-text-muted border border-border',
};

/* ------------------------------------------------------------------ */
/*  Empty form state                                                  */
/* ------------------------------------------------------------------ */
const EMPTY_FORM = {
  subject: '',
  object: '',
  possessive: '',
  possessive_pronoun: '',
  reflexive: '',
  label: '',
  usage_note: '',
  example: '',
};

/* ================================================================== */
/*  Component                                                         */
/* ================================================================== */
export default function NeoPronounsPage() {
  const { user } = useAuth();

  /* ── Registry state ──────────────────────────────────────────────── */
  const [sets, setSets] = useState<NeoPronoun[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularity, setPopularity] = useState('');
  const [search, setSearch] = useState('');

  /* ── Submission state ────────────────────────────────────────────── */
  const [submitOpen, setSubmitOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* ── Custom pronouns list ────────────────────────────────────────── */
  const [myCustom, setMyCustom] = useState<CustomPronounSet[]>([]);

  /* ── Fetch neo-pronoun registry ──────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    neoPronouns
      .list(popularity || undefined)
      .then((res) => setSets(res.sets))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [popularity]);

  /* ── Fetch user's custom submissions ─────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    customPronouns
      .list()
      .then(setMyCustom)
      .catch(() => {});
  }, [user, submitSuccess]);

  /* ── Client-side search filter ───────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!search.trim()) return sets;
    const q = search.toLowerCase();
    return sets.filter(
      (s) =>
        s.subject.toLowerCase().includes(q) ||
        s.object.toLowerCase().includes(q) ||
        s.possessive.toLowerCase().includes(q) ||
        s.possessive_pronoun.toLowerCase().includes(q) ||
        s.reflexive.toLowerCase().includes(q) ||
        s.label.toLowerCase().includes(q),
    );
  }, [sets, search]);

  /* ── Form helpers ────────────────────────────────────────────────── */
  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitError('');
    setSubmitSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject || !form.object || !form.possessive || !form.possessive_pronoun || !form.reflexive || !form.label) {
      setSubmitError('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await customPronouns.submit({
        subject: form.subject,
        object: form.object,
        possessive: form.possessive,
        possessive_pronoun: form.possessive_pronoun,
        reflexive: form.reflexive,
        label: form.label,
        usage_note: form.usage_note || undefined,
        example: form.example || undefined,
      });
      setSubmitSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */
  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <Sparkles className="inline -mt-1 mr-2 text-accent" size={28} />
          Neo-Pronoun Registry
        </h1>
        <p className="text-text-muted mt-2">
          Browse recognized neo-pronoun sets and submit your own.
        </p>
      </div>

      {/* ── Popularity filter pills ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {POPULARITY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setPopularity(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              popularity === f.value
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-text-muted hover:text-text hover:bg-surface-2/80 border border-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Search by any pronoun form…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
        />
      </div>

      {/* ── Card grid ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          No neo-pronoun sets found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((np) => (
            <div
              key={np.label}
              className="bg-surface border border-border rounded-xl p-5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all"
            >
              {/* Label + Popularity */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-accent-light">{np.label}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    POPULARITY_BADGE_COLORS[np.popularity] ?? POPULARITY_BADGE_COLORS.historical
                  }`}
                >
                  {np.popularity}
                </span>
              </div>

              {/* Conjugation table */}
              <table className="w-full text-sm mb-4">
                <tbody className="divide-y divide-border">
                  {(
                    [
                      ['Subject', np.subject],
                      ['Object', np.object],
                      ['Possessive', np.possessive],
                      ['Possessive Pron.', np.possessive_pronoun],
                      ['Reflexive', np.reflexive],
                    ] as const
                  ).map(([label, val]) => (
                    <tr key={label}>
                      <td className="py-1.5 pr-3 text-text-muted font-medium">{label}</td>
                      <td className="py-1.5 text-text">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Origin */}
              {np.origin && (
                <div className="flex items-start gap-2 text-xs text-text-muted mb-2">
                  <Tag size={13} className="mt-0.5 shrink-0" />
                  <span>{np.origin}</span>
                </div>
              )}

              {/* Usage note */}
              {np.usage_note && (
                <p className="text-xs text-text-muted mb-2">{np.usage_note}</p>
              )}

              {/* Example sentence */}
              {np.example && (
                <p className="text-xs italic text-text-muted/80 border-l-2 border-accent/30 pl-3 mt-3">
                  {np.example}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Submit Your Pronouns ───────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setSubmitOpen((o) => !o)}
          className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-surface-2/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Send size={18} className="text-accent" />
            <span className="font-semibold text-lg">Submit Your Pronouns</span>
          </div>
          {submitOpen ? (
            <ChevronUp size={20} className="text-text-muted" />
          ) : (
            <ChevronDown size={20} className="text-text-muted" />
          )}
        </button>

        {submitOpen && (
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
            <p className="text-sm text-text-muted">
              Have a pronoun set that isn't listed? Submit it for review.
            </p>

            {/* Required fields (3x2 grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  ['subject', 'Subject *'],
                  ['object', 'Object *'],
                  ['possessive', 'Possessive *'],
                  ['possessive_pronoun', 'Possessive Pronoun *'],
                  ['reflexive', 'Reflexive *'],
                  ['label', 'Label *'],
                ] as const
              ).map(([field, placeholder]) => (
                <input
                  key={field}
                  type="text"
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              ))}
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Usage note (optional)"
                value={form.usage_note}
                onChange={(e) => updateField('usage_note', e.target.value)}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
              <input
                type="text"
                placeholder="Example sentence (optional)"
                value={form.example}
                onChange={(e) => updateField('example', e.target.value)}
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>

            {/* Error / Success */}
            {submitError && (
              <p className="text-sm text-red">{submitError}</p>
            )}
            {submitSuccess && (
              <div className="flex items-center gap-2 text-sm text-green">
                <CheckCircle2 size={16} />
                Pronoun set submitted successfully! It will appear after review.
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        )}
      </div>

      {/* ── User's custom submissions ──────────────────────────────── */}
      {user && myCustom.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock size={20} className="text-text-muted" />
            Your Submitted Pronouns
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {myCustom.map((cp) => (
              <div
                key={cp.id}
                className="bg-surface border border-border rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-accent-light">{cp.label}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      cp.is_approved
                        ? 'bg-green-bg text-green border border-green/20'
                        : 'bg-yellow-bg text-yellow border border-yellow/20'
                    }`}
                  >
                    {cp.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <p className="text-sm text-text-muted">
                  {cp.subject} / {cp.object} / {cp.possessive} / {cp.possessive_pronoun} / {cp.reflexive}
                </p>

                {cp.usage_note && (
                  <p className="text-xs text-text-muted">{cp.usage_note}</p>
                )}
                {cp.example && (
                  <p className="text-xs italic text-text-muted/80">{cp.example}</p>
                )}

                <p className="text-xs text-text-muted/60">
                  Submitted {new Date(cp.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
