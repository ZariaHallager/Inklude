import { useEffect, useState, useMemo } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Eye,
  Check,
  AlertCircle,
  User,
} from 'lucide-react';
import { identities } from '../lib/api';
import type { Identity, PronounSet, Preference, Visibility } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import PronounBadge from '../components/PronounBadge';

/* ------------------------------------------------------------------ */
/*  Preset pronoun quick-picks                                         */
/* ------------------------------------------------------------------ */

interface PronounPreset {
  label: string;
  subject: string;
  object: string;
  possessive: string;
  possessive_pronoun: string;
  reflexive: string;
}

const PRESETS: PronounPreset[] = [
  {
    label: 'he/him',
    subject: 'he',
    object: 'him',
    possessive: 'his',
    possessive_pronoun: 'his',
    reflexive: 'himself',
  },
  {
    label: 'she/her',
    subject: 'she',
    object: 'her',
    possessive: 'her',
    possessive_pronoun: 'hers',
    reflexive: 'herself',
  },
  {
    label: 'they/them',
    subject: 'they',
    object: 'them',
    possessive: 'their',
    possessive_pronoun: 'theirs',
    reflexive: 'themselves',
  },
  {
    label: 'ze/hir',
    subject: 'ze',
    object: 'hir',
    possessive: 'hir',
    possessive_pronoun: 'hirs',
    reflexive: 'hirself',
  },
  {
    label: 'xe/xem',
    subject: 'xe',
    object: 'xem',
    possessive: 'xyr',
    possessive_pronoun: 'xyrs',
    reflexive: 'xemself',
  },
];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.'];

const VISIBILITY_OPTIONS: {
  value: Visibility;
  label: string;
  description: string;
}[] = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can see your pronouns',
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Visible to members of your team',
  },
  {
    value: 'internal',
    label: 'Internal',
    description: 'Visible to everyone in the organisation',
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Visible to anyone, including external contacts',
  },
];

const EMPTY_PRONOUN_SET: Omit<PronounSet, 'id'> = {
  subject: '',
  object: '',
  possessive: '',
  possessive_pronoun: '',
  reflexive: '',
  is_primary: false,
};

/* ------------------------------------------------------------------ */
/*  MyProfilePage                                                      */
/* ------------------------------------------------------------------ */

export default function MyProfilePage() {
  const { user } = useAuth();

  /* ── State ──────────────────────────────────────────────────────── */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [pronounSets, setPronounSets] = useState<Omit<PronounSet, 'id'>[]>([
    { ...EMPTY_PRONOUN_SET, is_primary: true },
  ]);

  /* ── Load identity ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    if (user.identity_id) {
      identities
        .get(user.identity_id)
        .then((data) => {
          setIdentity(data);
          setDisplayName(data.display_name);
          setTitle(data.preference?.title ?? null);
          setVisibility(data.preference?.visibility ?? 'private');
          setPronounSets(
            data.pronoun_sets.length > 0
              ? data.pronoun_sets.map(({ id, ...rest }) => rest)
              : [{ ...EMPTY_PRONOUN_SET, is_primary: true }],
          );
        })
        .catch((err: any) =>
          setError(err.message ?? 'Failed to load profile'),
        )
        .finally(() => setLoading(false));
    } else {
      setDisplayName(user.display_name);
      setLoading(false);
    }
  }, [user]);

  /* ── Pronoun set helpers ────────────────────────────────────────── */
  const updateSet = (
    idx: number,
    field: keyof Omit<PronounSet, 'id'>,
    value: string | boolean,
  ) => {
    setPronounSets((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'is_primary' && value === true) {
        next.forEach((s, i) => {
          if (i !== idx) s.is_primary = false;
        });
      }
      return next;
    });
  };

  const addSet = () => {
    setPronounSets((prev) => [...prev, { ...EMPTY_PRONOUN_SET }]);
  };

  const removeSet = (idx: number) => {
    setPronounSets((prev) => prev.filter((_, i) => i !== idx));
  };

  const applyPreset = (preset: PronounPreset) => {
    const { label, ...fields } = preset;
    // If the first set is still empty, replace it
    if (
      pronounSets.length === 1 &&
      !pronounSets[0].subject &&
      !pronounSets[0].object
    ) {
      setPronounSets([{ ...fields, is_primary: true }]);
    } else {
      // Check if already added
      const exists = pronounSets.some(
        (s) => s.subject === fields.subject && s.object === fields.object,
      );
      if (!exists) {
        setPronounSets((prev) => [
          ...prev,
          { ...fields, is_primary: prev.length === 0 },
        ]);
      }
    }
  };

  /* ── Save ────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (identity) {
        // Update existing identity
        await identities.update(identity.id, { display_name: displayName });
        await identities.replacePronouns(identity.id, pronounSets);
        await identities.updatePreferences(identity.id, {
          title,
          visibility,
          language_preference: identity.preference?.language_preference ?? null,
        });
        // Refresh
        const updated = await identities.get(identity.id);
        setIdentity(updated);
        setSuccess('Profile updated successfully!');
      } else {
        // Create new identity
        const created = await identities.create({
          email: user.email,
          display_name: displayName,
          pronoun_sets: pronounSets,
          preference: {
            title,
            visibility,
            language_preference: null,
          },
        });
        setIdentity(created);
        setSuccess('Profile created successfully!');
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to save profile');
    } finally {
      setSaving(false);
      // Auto-hide success after 4s
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  /* ── Preview sentences ──────────────────────────────────────────── */
  const primarySet = useMemo(
    () => pronounSets.find((s) => s.is_primary) ?? pronounSets[0],
    [pronounSets],
  );

  const previewSentences = useMemo(() => {
    if (!primarySet?.subject) return [];
    const name = displayName || 'this person';
    const s = primarySet;
    return [
      `${s.subject.charAt(0).toUpperCase() + s.subject.slice(1)} is joining the meeting.`,
      `Please send the report to ${s.object}.`,
      `This is ${s.possessive} desk.`,
      `The idea was ${s.possessive_pronoun}.`,
      `${name} did it ${s.reflexive}.`,
    ];
  }, [primarySet, displayName]);

  /* ── Loading state ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading profile…
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Pronoun Preferences</h1>
        <p className="text-text-muted text-sm mt-1">
          Set your pronouns, display name, title, and visibility preferences.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-bg border border-red/30 text-red px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-bg border border-green/30 text-green px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Setup banner when no identity */}
      {!identity && (
        <div className="bg-blue-bg border border-blue/30 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue/20 flex items-center justify-center shrink-0">
            <User size={20} className="text-blue" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text mb-1">
              Set Up Your Profile
            </h2>
            <p className="text-xs text-text-muted">
              You don't have a pronoun profile yet. Fill out the form below to
              create one and let others know your preferred pronouns.
            </p>
          </div>
        </div>
      )}

      {/* ── Form ──────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Display Name & Email */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text">Basic Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text-muted cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text">Title</h2>
          <select
            value={title ?? ''}
            onChange={(e) => setTitle(e.target.value || null)}
            className="w-full sm:w-48 bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
          >
            <option value="">None</option>
            {TITLE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Visibility */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-text-muted" />
            <h2 className="text-sm font-semibold text-text">Visibility</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {VISIBILITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  visibility === opt.value
                    ? 'bg-accent-glow border-accent/40'
                    : 'bg-bg border-border hover:border-border/80'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={opt.value}
                  checked={visibility === opt.value}
                  onChange={() => setVisibility(opt.value)}
                  className="mt-0.5 accent-accent"
                />
                <div>
                  <span className="text-sm font-medium text-text">
                    {opt.label}
                  </span>
                  <p className="text-xs text-text-muted mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pronoun Sets */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <h2 className="text-sm font-semibold text-text">Pronoun Sets</h2>
            </div>
            <button
              onClick={addSet}
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light font-medium transition-colors"
            >
              <Plus size={14} />
              Add Pronoun Set
            </button>
          </div>

          {/* Quick-pick presets */}
          <div>
            <p className="text-xs text-text-muted mb-2">Quick pick:</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => {
                const isActive = pronounSets.some(
                  (s) =>
                    s.subject === preset.subject &&
                    s.object === preset.object,
                );
                return (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isActive
                        ? 'bg-accent/15 text-accent-light border-accent/30'
                        : 'bg-bg text-text-muted border-border hover:border-accent/30 hover:text-text'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pronoun set cards */}
          <div className="space-y-4">
            {pronounSets.map((ps, idx) => (
              <div
                key={idx}
                className={`bg-bg border rounded-lg p-4 space-y-3 ${
                  ps.is_primary ? 'border-accent/40' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PronounBadge
                      label={
                        ps.subject && ps.object
                          ? `${ps.subject}/${ps.object}`
                          : `Set ${idx + 1}`
                      }
                      isPrimary={ps.is_primary}
                    />
                    <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ps.is_primary}
                        onChange={(e) =>
                          updateSet(idx, 'is_primary', e.target.checked)
                        }
                        className="accent-accent"
                      />
                      Primary
                    </label>
                  </div>
                  {pronounSets.length > 1 && (
                    <button
                      onClick={() => removeSet(idx)}
                      className="inline-flex items-center gap-1 text-xs text-red/70 hover:text-red transition-colors"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {(
                    [
                      ['subject', 'Subject (e.g. they)'],
                      ['object', 'Object (e.g. them)'],
                      ['possessive', 'Possessive (e.g. their)'],
                      ['possessive_pronoun', 'Poss. Pronoun (e.g. theirs)'],
                      ['reflexive', 'Reflexive (e.g. themselves)'],
                    ] as const
                  ).map(([field, placeholder]) => (
                    <div key={field}>
                      <label className="block text-[11px] text-text-muted mb-1 capitalize">
                        {field.replace('_', ' ')}
                      </label>
                      <input
                        type="text"
                        value={(ps as any)[field]}
                        onChange={(e) => updateSet(idx, field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-accent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {primarySet?.subject && (
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-text-muted" />
              <h2 className="text-sm font-semibold text-text">
                How your pronouns appear
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {pronounSets
                .filter((s) => s.subject)
                .map((s, idx) => (
                  <PronounBadge
                    key={idx}
                    label={`${s.subject}/${s.object}`}
                    isPrimary={s.is_primary}
                  />
                ))}
            </div>
            <div className="bg-bg rounded-lg border border-border p-4">
              <p className="text-xs text-text-muted mb-2 font-medium">
                Example sentences using your primary pronouns:
              </p>
              <ul className="space-y-1.5">
                {previewSentences.map((sentence, idx) => (
                  <li key={idx} className="text-sm text-text">
                    <span className="text-accent mr-1.5">&bull;</span>
                    {sentence}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving
              ? 'Saving…'
              : identity
                ? 'Save Changes'
                : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
