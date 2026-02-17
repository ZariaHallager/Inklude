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
  BookOpen,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id, Doc } from '../../../convex/_generated/dataModel';
import { useCurrentUser } from '../hooks/useCurrentUser';
import PronounBadge from '../components/PronounBadge';
import NeoPronounPicker from '../components/NeoPronounPicker';

/* ------------------------------------------------------------------ */
/*  Preset pronoun quick-picks                                         */
/* ------------------------------------------------------------------ */

interface PronounPreset {
  label: string;
  subject: string;
  object: string;
  possessive: string;
  possessivePronoun: string;
  reflexive: string;
}

const PRESETS: PronounPreset[] = [
  {
    label: 'he/him',
    subject: 'he',
    object: 'him',
    possessive: 'his',
    possessivePronoun: 'his',
    reflexive: 'himself',
  },
  {
    label: 'she/her',
    subject: 'she',
    object: 'her',
    possessive: 'her',
    possessivePronoun: 'hers',
    reflexive: 'herself',
  },
  {
    label: 'they/them',
    subject: 'they',
    object: 'them',
    possessive: 'their',
    possessivePronoun: 'theirs',
    reflexive: 'themselves',
  },
  {
    label: 'ze/hir',
    subject: 'ze',
    object: 'hir',
    possessive: 'hir',
    possessivePronoun: 'hirs',
    reflexive: 'hirself',
  },
  {
    label: 'xe/xem',
    subject: 'xe',
    object: 'xem',
    possessive: 'xyr',
    possessivePronoun: 'xyrs',
    reflexive: 'xemself',
  },
];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.'];

type Visibility = 'private' | 'team' | 'internal' | 'public';

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

interface PronounSet {
  subject: string;
  object: string;
  possessive: string;
  possessivePronoun: string;
  reflexive: string;
  isPrimary: boolean;
}

const EMPTY_PRONOUN_SET: PronounSet = {
  subject: '',
  object: '',
  possessive: '',
  possessivePronoun: '',
  reflexive: '',
  isPrimary: false,
};

/* ------------------------------------------------------------------ */
/*  MyProfilePage                                                      */
/* ------------------------------------------------------------------ */

export default function MyProfilePage() {
  const { user, loading: userLoading } = useCurrentUser();

  /* ── State ──────────────────────────────────────────────────────── */
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [identityId, setIdentityId] = useState<Id<"identities"> | null>(null);
  const [showNeoPronounPicker, setShowNeoPronounPicker] = useState(false);

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [pronounSets, setPronounSets] = useState<PronounSet[]>([
    { ...EMPTY_PRONOUN_SET, isPrimary: true },
  ]);

  // Convex hooks
  const identity = useQuery(
    api.identities.getIdentityByAccount,
    user?.id ? { accountId: user.id as Id<"accounts"> } : "skip"
  );
  const createIdentity = useMutation(api.identities.createIdentity);
  const updateIdentityName = useMutation(api.identities.updateIdentity);
  const updatePronounSets = useMutation(api.identities.updatePronounSets);
  const updatePreferences = useMutation(api.identities.updatePreferences);

  /* ── Load identity ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    if (identity) {
      setIdentityId(identity._id);
      setDisplayName(identity.displayName);
      setTitle(identity.preference?.title ?? null);
      setVisibility(identity.preference?.visibility ?? 'private');
      setPronounSets(
        identity.pronounSets.length > 0
          ? identity.pronounSets.map((ps: Doc<'pronounSets'>) => ({
            subject: ps.subject,
            object: ps.object,
            possessive: ps.possessive,
            possessivePronoun: ps.possessivePronoun,
            reflexive: ps.reflexive,
            isPrimary: ps.isPrimary,
          }))
          : [{ ...EMPTY_PRONOUN_SET, isPrimary: true }]
      );
    } else {
      setDisplayName(user.name || user.email || '');
    }
  }, [user, identity]);

  /* ── Pronoun set helpers ────────────────────────────────────────── */
  const updateSet = (
    idx: number,
    field: keyof PronounSet,
    value: string | boolean,
  ) => {
    setPronounSets((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'isPrimary' && value === true) {
        next.forEach((s, i) => {
          if (i !== idx) s.isPrimary = false;
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
      setPronounSets([{ ...fields, isPrimary: true }]);
    } else {
      // Check if already added
      const exists = pronounSets.some(
        (s) => s.subject === fields.subject && s.object === fields.object,
      );
      if (!exists) {
        setPronounSets((prev) => [
          ...prev,
          { ...fields, isPrimary: prev.length === 0 },
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
      if (identityId) {
        // Update existing identity
        await updateIdentityName({
          identityId,
          displayName,
        });
        await updatePronounSets({
          identityId,
          pronounSets,
        });
        await updatePreferences({
          identityId,
          title: title as any,
          visibility: visibility as any,
        });
        setSuccess('Profile updated successfully!');
      } else {
        // Create new identity
        const createdId = await createIdentity({
          accountId: user.id as Id<"accounts">,
          email: user.email,
          displayName,
          pronounSets,
          title: title as any,
          visibility: visibility as any,
        });
        setIdentityId(createdId);
        setSuccess('Profile created successfully!');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
      // Auto-hide success after 4s
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  /* ── Preview sentences ──────────────────────────────────────────── */
  const primarySet = useMemo(
    () => pronounSets.find((s) => s.isPrimary) ?? pronounSets[0],
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
      `The idea was ${s.possessivePronoun}.`,
      `${name} did it ${s.reflexive}.`,
    ];
  }, [primarySet, displayName]);

  /* ── Loading state ──────────────────────────────────────────────── */
  if (userLoading) {
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
      {!identityId && (
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
                title="Email"
                placeholder="person@company.com"
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
            title="Title"
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
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${visibility === opt.value
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">Quick pick:</p>
              <button
                onClick={() => setShowNeoPronounPicker(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary-light text-white rounded-lg text-xs font-medium transition-colors"
              >
                <BookOpen size={14} />
                Browse Neo-Pronouns
              </button>
            </div>
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isActive
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
                className={`bg-bg border rounded-lg p-4 space-y-3 ${ps.isPrimary ? 'border-accent/40' : 'border-border'
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
                      isPrimary={ps.isPrimary}
                    />
                    <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ps.isPrimary}
                        onChange={(e) =>
                          updateSet(idx, 'isPrimary', e.target.checked)
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
                      ['possessivePronoun', 'Poss. Pronoun (e.g. theirs)'],
                      ['reflexive', 'Reflexive (e.g. themselves)'],
                    ] as const
                  ).map(([field, placeholder]) => (
                    <div key={field}>
                      <label className="block text-[11px] text-text-muted mb-1 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      <input
                        type="text"
                        value={ps[field as keyof PronounSet] as string}
                        onChange={(e) => updateSet(idx, field as keyof PronounSet, e.target.value)}
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
                    isPrimary={s.isPrimary}
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
              : identityId
                ? 'Save Changes'
                : 'Create Profile'}
          </button>
        </div>
      </div>

      {/* Neo-Pronoun Picker Modal */}
      {showNeoPronounPicker && (
        <NeoPronounPicker
          onSelect={(pronoun) => {
            applyPreset({
              label: pronoun.label || `${pronoun.subject}/${pronoun.object}`,
              subject: pronoun.subject,
              object: pronoun.object,
              possessive: pronoun.possessive,
              possessivePronoun: pronoun.possessive_pronoun,
              reflexive: pronoun.reflexive,
            });
            setShowNeoPronounPicker(false);
          }}
          onClose={() => setShowNeoPronounPicker(false)}
        />
      )}
    </div>
  );
}
