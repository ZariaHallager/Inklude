import { useState, useEffect } from 'react';
import { X, Copy, Check, Search, User as UserIcon } from 'lucide-react';
import type { InclusiveTemplate } from '../lib/types';
import { identities } from '../lib/api';

interface Props {
  template: InclusiveTemplate;
  onClose: () => void;
}

interface VariableValues {
  [key: string]: string;
}

const PRONOUN_PRESETS = [
  { label: 'she/her', subject: 'she', object: 'her', possessive: 'her', possessivePronoun: 'hers', reflexive: 'herself' },
  { label: 'he/him', subject: 'he', object: 'him', possessive: 'his', possessivePronoun: 'his', reflexive: 'himself' },
  { label: 'they/them', subject: 'they', object: 'them', possessive: 'their', possessivePronoun: 'theirs', reflexive: 'themselves' },
  { label: 'ze/hir', subject: 'ze', object: 'hir', possessive: 'hir', possessivePronoun: 'hirs', reflexive: 'hirself' },
  { label: 'ze/zir', subject: 'ze', object: 'zir', possessive: 'zir', possessivePronoun: 'zirs', reflexive: 'zirself' },
  { label: 'xe/xem', subject: 'xe', object: 'xem', possessive: 'xyr', possessivePronoun: 'xyrs', reflexive: 'xemself' },
  { label: 'ey/em', subject: 'ey', object: 'em', possessive: 'eir', possessivePronoun: 'eirs', reflexive: 'emself' },
  { label: 'fae/faer', subject: 'fae', object: 'faer', possessive: 'faer', possessivePronoun: 'faers', reflexive: 'faerself' },
  { label: 've/ver', subject: 've', object: 'ver', possessive: 'vis', possessivePronoun: 'vis', reflexive: 'verself' },
];

const TITLE_OPTIONS = ['', 'Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.'];

export default function TemplateModal({ template, onClose }: Props) {
  const [mode, setMode] = useState<'manual' | 'lookup'>('manual');
  const [values, setValues] = useState<VariableValues>({});
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPronounPreset, setSelectedPronounPreset] = useState('they/them');

  // Extract variables from template
  const variables = extractVariables(template.content);

  // Search identities
  useEffect(() => {
    if (mode === 'lookup' && searchQuery.length >= 2) {
      identities.list(0, 200).then((results) => {
        const filtered = results.filter(
          (id: any) =>
            id.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (id.email && id.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(filtered.slice(0, 5));
      }).catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, mode]);

  function extractVariables(content: string): string[] {
    const regex = /\{\{([A-Z_]+)\}\}/g;
    const vars: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (!vars.includes(match[1])) {
        vars.push(match[1]);
      }
    }
    return vars;
  }

  function fillTemplate(): string {
    let filled = template.content;
    for (const [key, value] of Object.entries(values)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      filled = filled.replace(regex, value);
    }
    return filled;
  }

  function handleCopy() {
    const filled = fillTemplate();
    navigator.clipboard.writeText(filled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function selectIdentity(identity: any) {
    const pronounSet = identity.pronoun_sets?.[0];
    const nameParts = (identity.display_name || '').split(' ');
    setValues({
      ...values,
      NAME: identity.display_name || '',
      FIRST_NAME: nameParts[0] || '',
      LAST_NAME: nameParts.slice(1).join(' ') || '',
      ...(pronounSet && {
        PRONOUN_SUBJECT: pronounSet.subject,
        PRONOUN_SUBJECT_CAPITALIZED: capitalize(pronounSet.subject),
        PRONOUN_OBJECT: pronounSet.object,
        PRONOUN_POSSESSIVE: pronounSet.possessive,
        PRONOUN_POSSESSIVE_PRONOUN: pronounSet.possessive_pronoun,
        PRONOUN_REFLEXIVE: pronounSet.reflexive,
      }),
    });
    setSearchQuery('');
    setSearchResults([]);
  }

  function selectPronounPreset(label: string) {
    const preset = PRONOUN_PRESETS.find((p) => p.label === label);
    if (preset) {
      setValues({
        ...values,
        PRONOUN_SUBJECT: preset.subject,
        PRONOUN_SUBJECT_CAPITALIZED: capitalize(preset.subject),
        PRONOUN_OBJECT: preset.object,
        PRONOUN_POSSESSIVE: preset.possessive,
        PRONOUN_POSSESSIVE_PRONOUN: preset.possessivePronoun,
        PRONOUN_REFLEXIVE: preset.reflexive,
      });
    }
    setSelectedPronounPreset(label);
  }

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const filledContent = fillTemplate();
  const allFieldsFilled = variables.every((v) => values[v]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{template.title}</h2>
            {template.description && (
              <p className="text-sm text-text-muted mt-1">{template.description}</p>
            )}
          </div>
          <button
            title="Close"
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-bg rounded-lg w-fit">
            <button
              onClick={() => setMode('manual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'manual'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text'
                }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setMode('lookup')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'lookup'
                ? 'bg-secondary text-white'
                : 'text-text-muted hover:text-text'
                }`}
            >
              Lookup Identity
            </button>
          </div>

          {/* Identity Lookup Mode */}
          {mode === 'lookup' && (
            <div>
              <label className="block text-sm font-medium mb-2">Search for Identity</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-bg border border-border rounded-lg overflow-hidden">
                  {searchResults.map((identity) => (
                    <button
                      key={identity.id}
                      onClick={() => selectIdentity(identity)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left"
                    >
                      <UserIcon size={16} className="text-text-muted" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{identity.display_name}</div>
                        {identity.email && (
                          <div className="text-xs text-text-muted truncate">{identity.email}</div>
                        )}
                      </div>
                      {identity.pronoun_sets?.[0] && (
                        <span className="text-xs text-text-muted">
                          {identity.pronoun_sets[0].subject}/{identity.pronoun_sets[0].object}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Variable Fields */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Fill Template Variables</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name fields */}
              {(variables.includes('NAME') || variables.includes('FIRST_NAME')) && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">First Name</label>
                  <input
                    title="First Name"
                    type="text"
                    value={values.FIRST_NAME || ''}
                    onChange={(e) => setValues({ ...values, FIRST_NAME: e.target.value, NAME: `${e.target.value} ${values.LAST_NAME || ''}`.trim() })}
                    className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
              {(variables.includes('NAME') || variables.includes('LAST_NAME')) && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Last Name</label>
                  <input
                    title="Last Name"
                    type="text"
                    value={values.LAST_NAME || ''}
                    onChange={(e) => setValues({ ...values, LAST_NAME: e.target.value, NAME: `${values.FIRST_NAME || ''} ${e.target.value}`.trim() })}
                    className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {/* Title */}
              {variables.includes('TITLE') && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <select
                    title="Title"
                    value={values.TITLE || ''}
                    onChange={(e) => setValues({ ...values, TITLE: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {TITLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt || 'None'}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pronouns */}
              {variables.some((v) => v.startsWith('PRONOUN_')) && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Pronoun Set</label>
                  <div className="flex flex-wrap gap-2">
                    {PRONOUN_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => selectPronounPreset(preset.label)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedPronounPreset === preset.label
                          ? 'bg-primary text-white'
                          : 'bg-surface-2 text-text-muted hover:text-text hover:bg-surface-2/80'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Other custom variables */}
              {variables
                .filter((v) => !['NAME', 'FIRST_NAME', 'LAST_NAME', 'TITLE'].includes(v) && !v.startsWith('PRONOUN_'))
                .map((varName) => (
                  <div key={varName}>
                    <label className="block text-sm font-medium mb-1.5">{varName.replace(/_/g, ' ')}</label>
                    <input
                      title={varName.replace(/_/g, ' ')}
                      placeholder={varName.replace(/_/g, ' ')}
                      type="text"
                      value={values[varName] || ''}
                      onChange={(e) => setValues({ ...values, [varName]: e.target.value })}
                      className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Preview</h3>
            <div className="bg-bg border border-border rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-text">
                {filledContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <div className="text-sm text-text-muted">
            {allFieldsFilled ? 'Ready to copy' : `${variables.filter((v) => !values[v]).length} fields remaining`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCopy}
              disabled={!allFieldsFilled}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
