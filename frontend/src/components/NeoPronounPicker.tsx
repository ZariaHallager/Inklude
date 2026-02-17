import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { neoPronouns } from '../lib/api';

interface NeoPronoun {
  label: string;
  subject: string;
  object: string;
  possessive: string;
  possessive_pronoun: string;
  reflexive: string;
  popularity: string;
  origin: string;
  usage_note: string;
  example: string;
}

interface Props {
  onSelect: (pronoun: NeoPronoun) => void;
  onClose: () => void;
}

const POPULARITY_COLORS = {
  common: 'bg-primary text-white',
  moderate: 'bg-secondary text-white',
  emerging: 'bg-accent-yellow text-bg',
  historical: 'bg-accent-lavender text-white',
};

const POPULARITY_LABELS = {
  common: 'Common',
  moderate: 'Moderate',
  emerging: 'Emerging',
  historical: 'Historical',
};

export default function NeoPronounPicker({ onSelect, onClose }: Props) {
  const [pronouns, setPronouns] = useState<NeoPronoun[]>([]);
  const [filtered, setFiltered] = useState<NeoPronoun[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    neoPronouns.list()
      .then((data) => {
        setPronouns(data.sets);
        setFiltered(data.sets);
      })
      .catch(() => setFiltered([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let results = pronouns;

    // Filter by popularity
    if (selectedFilter) {
      results = results.filter((p) => p.popularity === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.object.toLowerCase().includes(q) ||
          p.usage_note.toLowerCase().includes(q)
      );
    }

    setFiltered(results);
  }, [searchQuery, selectedFilter, pronouns]);

  function handleSelect(pronoun: NeoPronoun) {
    onSelect(pronoun);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Browse Neo-Pronouns</h2>
              <p className="text-sm text-text-muted mt-1">
                {filtered.length} pronoun sets available
              </p>
            </div>
            <button
              title="Close"
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pronouns..."
              className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedFilter === ''
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-muted hover:text-text'
                }`}
            >
              All
            </button>
            {Object.entries(POPULARITY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedFilter === key
                  ? POPULARITY_COLORS[key as keyof typeof POPULARITY_COLORS]
                  : 'bg-surface-2 text-text-muted hover:text-text'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-20 text-text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              No pronouns match your search
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((pronoun) => (
                <div
                  key={pronoun.label}
                  className="bg-bg border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{pronoun.label}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${POPULARITY_COLORS[
                            pronoun.popularity as keyof typeof POPULARITY_COLORS
                          ]
                            }`}
                        >
                          {
                            POPULARITY_LABELS[
                            pronoun.popularity as keyof typeof POPULARITY_LABELS
                            ]
                          }
                        </span>
                      </div>

                      <div className="text-sm text-text-muted space-y-1 mb-3">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            Subject: <span className="text-text">{pronoun.subject}</span>
                          </span>
                          <span>
                            Object: <span className="text-text">{pronoun.object}</span>
                          </span>
                          <span>
                            Possessive:{' '}
                            <span className="text-text">{pronoun.possessive}</span>
                          </span>
                          <span>
                            Reflexive: <span className="text-text">{pronoun.reflexive}</span>
                          </span>
                        </div>
                      </div>

                      {pronoun.usage_note && (
                        <p className="text-sm text-text-muted mb-2">{pronoun.usage_note}</p>
                      )}

                      {pronoun.example && (
                        <p className="text-sm text-text italic">"{pronoun.example}"</p>
                      )}

                      {pronoun.origin && (
                        <p className="text-xs text-text-muted mt-2">
                          Origin: {pronoun.origin}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelect(pronoun)}
                      className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
