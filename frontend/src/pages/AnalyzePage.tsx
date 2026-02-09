import { useState, useMemo } from 'react';
import { analysis } from '../lib/api';
import type { AnalysisResult, ToneMode, DetectedIssue } from '../lib/types';
import SeverityBadge from '../components/SeverityBadge';
import {
  FileSearch,
  Send,
  Loader2,
  Layers,
  Sparkles,
  MessageSquare,
  Tag,
} from 'lucide-react';

const TONES: { value: ToneMode; label: string; desc: string }[] = [
  { value: 'gentle', label: 'Gentle', desc: 'Kind & encouraging' },
  { value: 'direct', label: 'Direct', desc: 'Clear & concise' },
  { value: 'research_backed', label: 'Research-backed', desc: 'Citations included' },
];

/* ------------------------------------------------------------------ */
/*  Helper: build highlighted HTML from text + issues                  */
/* ------------------------------------------------------------------ */
function buildHighlightedHtml(text: string, issues: DetectedIssue[]): string {
  if (issues.length === 0) return escapeHtml(text);

  // Sort issues by span start, then by span end descending (longer spans first)
  const sorted = [...issues].sort(
    (a, b) => a.span.start - b.span.start || b.span.end - a.span.end,
  );

  // Merge overlapping spans
  const spans: { start: number; end: number }[] = [];
  for (const issue of sorted) {
    const last = spans[spans.length - 1];
    if (last && issue.span.start <= last.end) {
      last.end = Math.max(last.end, issue.span.end);
    } else {
      spans.push({ start: issue.span.start, end: issue.span.end });
    }
  }

  const parts: string[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start > cursor) {
      parts.push(escapeHtml(text.slice(cursor, span.start)));
    }
    parts.push(
      `<mark class="bg-red-bg text-red rounded px-0.5 border-b-2 border-red/40">${escapeHtml(text.slice(span.start, span.end))}</mark>`,
    );
    cursor = span.end;
  }
  if (cursor < text.length) {
    parts.push(escapeHtml(text.slice(cursor)));
  }
  return parts.join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AnalyzePage() {
  const [tab, setTab] = useState<'single' | 'batch'>('single');

  // Single analysis state
  const [text, setText] = useState('');
  const [tone, setTone] = useState<ToneMode>('gentle');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Batch analysis state
  const [batchText, setBatchText] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<AnalysisResult[] | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  const highlightedHtml = useMemo(() => {
    if (!result) return '';
    return buildHighlightedHtml(text, result.issues);
  }, [result, text]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analysis.text(text, tone);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAnalyze = async () => {
    const texts = batchText
      .split(/\n\n+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (texts.length === 0) return;
    setBatchLoading(true);
    setBatchError(null);
    setBatchResults(null);
    try {
      const res = await analysis.batch(texts, tone);
      setBatchResults(res.results);
    } catch (err: any) {
      setBatchError(err.message || 'Batch analysis failed');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSearch size={24} className="text-accent" />
            Text Analysis
          </h1>
          <p className="text-text-muted mt-1">
            Analyze text for inclusive language and get actionable suggestions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === 'single'
              ? 'bg-accent-glow text-accent-light'
              : 'text-text-muted hover:text-text hover:bg-surface-2'
          }`}
        >
          <MessageSquare size={15} />
          Single
        </button>
        <button
          onClick={() => setTab('batch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === 'batch'
              ? 'bg-accent-glow text-accent-light'
              : 'text-text-muted hover:text-text hover:bg-surface-2'
          }`}
        >
          <Layers size={15} />
          Batch
        </button>
      </div>

      {/* Tone Selector */}
      <div className="flex gap-3">
        {TONES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTone(t.value)}
            className={`flex flex-col items-center px-5 py-3 rounded-xl border text-sm transition-all duration-200 cursor-pointer ${
              tone === t.value
                ? 'bg-accent-glow border-accent/40 text-accent-light shadow-md shadow-accent/10'
                : 'bg-surface border-border text-text-muted hover:border-accent/20 hover:text-text'
            }`}
          >
            <span className="font-semibold">{t.label}</span>
            <span className="text-xs opacity-70 mt-0.5">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* ── Single Analysis Tab ─────────────────────────────────────── */}
      {tab === 'single' && (
        <div className="space-y-6">
          {/* Input area with overlay highlight */}
          <div className="relative">
            {result && (
              <div
                className="absolute inset-0 p-4 text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none overflow-hidden bg-surface-2 border border-border rounded-xl"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            )}
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
              }}
              placeholder="Paste text here to analyze for inclusive language..."
              className={`w-full h-48 bg-surface-2 border border-border rounded-xl p-4 text-sm text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors leading-relaxed ${
                result ? 'text-transparent caret-text' : ''
              }`}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              Analyze
            </button>
            {result && (
              <span className="text-xs text-text-muted">
                {result.text_length} chars &middot;{' '}
                {result.issues.length} issue{result.issues.length !== 1 ? 's' : ''} &middot;{' '}
                {result.pronouns_found.length} pronoun{result.pronouns_found.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-bg border border-red/20 rounded-xl p-4 text-red text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                    Summary
                  </h3>
                </div>
                <p className="text-sm text-text leading-relaxed">{result.summary}</p>
              </div>

              {/* Issues */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Issues ({result.issues.length})
                </h3>
                {result.issues.length > 0 ? (
                  <div className="space-y-3">
                    {result.issues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-bg border border-green/20 rounded-xl p-5 text-green text-sm flex items-center gap-2">
                    <Sparkles size={16} />
                    No issues found — your text looks inclusive!
                  </div>
                )}
              </div>

              {/* Pronouns Found */}
              {result.pronouns_found.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Pronouns Found ({result.pronouns_found.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.pronouns_found.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-surface border border-border rounded-lg p-4 flex items-center gap-3"
                      >
                        <Tag size={14} className="text-accent shrink-0" />
                        <div className="min-w-0">
                          <span className="text-sm font-medium">
                            "{p.span.text}"
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-muted bg-surface-2 rounded px-2 py-0.5 border border-border">
                              {p.pronoun_type}
                            </span>
                            {p.resolved_entity && (
                              <span className="text-xs text-blue">
                                → {p.resolved_entity}
                              </span>
                            )}
                            {p.is_neo_pronoun && (
                              <span className="text-xs text-accent bg-accent-glow rounded px-1.5 py-0.5">
                                neo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Batch Analysis Tab ──────────────────────────────────────── */}
      {tab === 'batch' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm text-text-muted mb-4">
              Enter multiple texts separated by a blank line. Each block will be analyzed separately.
            </p>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`First text block here...\n\nSecond text block here...\n\nThird text block here...`}
              className="w-full h-48 bg-surface-2 border border-border rounded-lg p-4 text-sm text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors leading-relaxed"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleBatchAnalyze}
                disabled={batchLoading || !batchText.trim()}
                className="flex items-center gap-2 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] cursor-pointer"
              >
                {batchLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Layers size={18} />
                )}
                Batch Analyze
              </button>
              <span className="text-xs text-text-muted">
                {batchText
                  .split(/\n\n+/)
                  .map((t) => t.trim())
                  .filter(Boolean).length}{' '}
                text block(s)
              </span>
            </div>
          </div>

          {batchError && (
            <div className="bg-red-bg border border-red/20 rounded-xl p-4 text-red text-sm">
              {batchError}
            </div>
          )}

          {batchResults && (
            <div className="space-y-6">
              {batchResults.map((res, idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-border rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Block {idx + 1}
                      <span className="text-text-muted font-normal ml-2">
                        {res.text_length} chars
                      </span>
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        res.issues.length > 0
                          ? 'bg-yellow-bg text-yellow'
                          : 'bg-green-bg text-green'
                      }`}
                    >
                      {res.issues.length} issue{res.issues.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-sm text-text-muted">{res.summary}</p>

                  {res.issues.length > 0 && (
                    <div className="space-y-2">
                      {res.issues.map((issue, issIdx) => (
                        <IssueCard key={issIdx} issue={issue} compact />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Issue Card sub-component                                           */
/* ------------------------------------------------------------------ */
function IssueCard({
  issue,
  compact = false,
}: {
  issue: DetectedIssue;
  compact?: boolean;
}) {
  return (
    <div
      className={`bg-surface-2 border border-border rounded-lg ${
        compact ? 'p-3' : 'p-4'
      } space-y-2`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-red-bg text-red px-2 py-0.5 rounded text-xs font-mono">
          "{issue.span.text}"
        </span>
        <SeverityBadge severity={issue.severity} />
        <span className="text-xs text-text-muted bg-surface rounded px-2 py-0.5 border border-border">
          {issue.category.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Message */}
      <p className={`text-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>
        {issue.message}
      </p>

      {/* Suggestions */}
      {issue.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {issue.suggestions.map((s, si) => (
            <div key={si} className="group relative">
              <span className="inline-flex items-center gap-1 bg-green-bg text-green border border-green/20 rounded px-2 py-0.5 text-xs cursor-help">
                ↳ {s.replacement}
                {!compact && (
                  <span className="text-green/60 ml-1">
                    ({Math.round(s.confidence * 100)}%)
                  </span>
                )}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64">
                <div className="bg-bg border border-border rounded-lg p-3 shadow-xl text-xs text-text-muted leading-relaxed">
                  {s.explanation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
