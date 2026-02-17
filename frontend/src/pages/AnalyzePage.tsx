import { useState, useMemo } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import SeverityBadge from '../components/SeverityBadge';
import {
  FileSearch,
  Send,
  Loader2,
  Layers,
  Sparkles,
  MessageSquare,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '../animations/variants';

type ToneMode = 'gentle' | 'direct' | 'research_backed';

const TONES: { value: ToneMode; label: string; desc: string }[] = [
  { value: 'gentle', label: 'Gentle', desc: 'Kind & encouraging' },
  { value: 'direct', label: 'Direct', desc: 'Clear & concise' },
  { value: 'research_backed', label: 'Research-backed', desc: 'Citations included' },
];

/* ------------------------------------------------------------------ */
/*  Helper: build highlighted HTML from text + issues                  */
/* ------------------------------------------------------------------ */
function buildHighlightedHtml(text: string, issues: any[]): string {
  if (!issues || issues.length === 0) return escapeHtml(text);

  // Sort issues by start index
  const sorted = [...issues].filter(i => i.startIndex !== undefined).sort(
    (a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex,
  );

  // Merge overlapping spans
  const spans: { start: number; end: number }[] = [];
  for (const issue of sorted) {
    const last = spans[spans.length - 1];
    if (last && issue.startIndex <= last.end) {
      last.end = Math.max(last.end, issue.endIndex);
    } else {
      spans.push({ start: issue.startIndex, end: issue.endIndex });
    }
  }

  const parts: string[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start > cursor) {
      parts.push(escapeHtml(text.slice(cursor, span.start)));
    }
    parts.push(
      `<mark class="bg-error/20 text-error rounded px-0.5 border-b-2 border-error/40">${escapeHtml(text.slice(span.start, span.end))}</mark>`,
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
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Batch analysis state
  const [batchText, setBatchText] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  // Convex actions
  const analyzeText = useAction(api.analysis.analyzeText);
  const analyzeBatch = useAction(api.analysis.analyzeBatch);
  const logAnalysis = useMutation(api.analytics.logAnalysis);

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
      const res = await analyzeText({
        text,
        tone,
        provider: 'gemini',
      });
      setResult(res);

      // Log the analysis
      await logAnalysis({
        textLength: text.length,
        issuesFound: res.issues?.length || 0,
        categories: res.metadata?.categories || [],
        tone,
        provider: 'gemini',
      });
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
      const res = await analyzeBatch({
        texts,
        tone,
        provider: 'gemini',
      });
      setBatchResults(res);
    } catch (err: any) {
      setBatchError(err.message || 'Batch analysis failed');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-8"
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
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileSearch size={24} className="text-accent" />
            </motion.div>
            Text Analysis
          </h1>
          <p className="text-text-muted mt-1">
            Analyze text for inclusive language and get actionable suggestions.
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex gap-1 bg-surface/80 backdrop-blur border border-border/50 rounded-xl p-1 w-fit"
        variants={fadeInUp}
      >
        <motion.button
          onClick={() => setTab('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${tab === 'single'
            ? 'bg-gradient-to-r from-accent/20 to-secondary/10 text-accent-light shadow-lg shadow-accent/10'
            : 'text-text-muted hover:text-text hover:bg-surface-2/50'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageSquare size={15} />
          Single
        </motion.button>
        <motion.button
          onClick={() => setTab('batch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${tab === 'batch'
            ? 'bg-gradient-to-r from-accent/20 to-secondary/10 text-accent-light shadow-lg shadow-accent/10'
            : 'text-text-muted hover:text-text hover:bg-surface-2/50'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Layers size={15} />
          Batch
        </motion.button>
      </motion.div>

      {/* Tone Selector */}
      <motion.div
        className="flex gap-3"
        variants={fadeInUp}
      >
        {TONES.map((t, index) => (
          <motion.button
            key={t.value}
            onClick={() => setTone(t.value)}
            className={`flex flex-col items-center px-5 py-3 rounded-xl border text-sm transition-all duration-300 cursor-pointer ${tone === t.value
              ? 'bg-gradient-to-br from-accent/20 to-secondary/10 border-accent/40 text-accent-light shadow-lg shadow-accent/10'
              : 'bg-surface/80 border-border/50 text-text-muted hover:border-accent/20 hover:text-text'
              }`}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="font-semibold">{t.label}</span>
            <span className="text-xs opacity-70 mt-0.5">{t.desc}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ── Single Analysis Tab ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === 'single' && (
          <motion.div
            key="single"
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Input area with overlay highlight */}
            <div className="relative">
              {result && (
                <div
                  className="absolute inset-0 p-4 text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none overflow-hidden bg-surface-2/50 border border-border/50 rounded-2xl"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              )}
              <motion.textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setResult(null);
                }}
                placeholder="Paste text here to analyze for inclusive language..."
                className={`w-full h-48 bg-surface-2/50 backdrop-blur border border-border/50 rounded-2xl p-4 text-sm text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 leading-relaxed ${result ? 'text-transparent caret-text' : ''
                  }`}
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-accent to-secondary hover:from-accent-light hover:to-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={18} />
                  </motion.div>
                ) : (
                  <Send size={18} />
                )}
                Analyze
              </motion.button>
              {result && (
                <motion.span
                  className="text-xs text-text-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {text.length} chars &middot;{' '}
                  {result.issues?.length || 0} issue{(result.issues?.length || 0) !== 1 ? 's' : ''} &middot;{' '}
                  {result.pronouns?.length || 0} pronoun{(result.pronouns?.length || 0) !== 1 ? 's' : ''}
                </motion.span>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-error/10 border border-error/20 rounded-xl p-4 text-error text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  {/* Summary */}
                  <motion.div
                    className="bg-surface/80 backdrop-blur border border-border/50 rounded-2xl p-5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-accent" />
                      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Summary
                      </h3>
                    </div>
                    <p className="text-sm text-text leading-relaxed">{result.summary}</p>
                  </motion.div>

                  {/* Issues */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                      Issues ({result.issues?.length || 0})
                    </h3>
                    {result.issues && result.issues.length > 0 ? (
                      <motion.div
                        className="space-y-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {result.issues.map((issue: any, idx: number) => (
                          <IssueCard key={idx} issue={issue} />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        className="bg-success/10 border border-success/20 rounded-xl p-5 text-success text-sm flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <CheckCircle2 size={18} />
                        No issues found — your text looks inclusive!
                      </motion.div>
                    )}
                  </div>

                  {/* Pronouns Found */}
                  {result.pronouns && result.pronouns.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                        Pronouns Found ({result.pronouns.length})
                      </h3>
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {result.pronouns.map((p: any, idx: number) => (
                          <motion.div
                            key={idx}
                            variants={fadeInUp}
                            className="bg-surface/80 backdrop-blur border border-border/50 rounded-xl p-4 flex items-center gap-3 hover:border-accent/30 transition-colors"
                          >
                            <Tag size={14} className="text-accent shrink-0" />
                            <div className="min-w-0">
                              <span className="text-sm font-medium">
                                "{p.pronoun}"
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-text-muted bg-surface-2/50 rounded-lg px-2 py-0.5 border border-border/50">
                                  {p.type}
                                </span>
                                {p.resolvedTo && (
                                  <span className="text-xs text-tertiary">
                                    → {p.resolvedTo}
                                  </span>
                                )}
                                {p.isNeo && (
                                  <span className="text-xs text-accent bg-accent/10 rounded-lg px-1.5 py-0.5">
                                    neo
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Batch Analysis Tab ──────────────────────────────────────── */}
        {tab === 'batch' && (
          <motion.div
            key="batch"
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-surface/80 backdrop-blur border border-border/50 rounded-2xl p-5">
              <p className="text-sm text-text-muted mb-4">
                Enter multiple texts separated by a blank line. Each block will be analyzed separately.
              </p>
              <motion.textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={`First text block here...\n\nSecond text block here...\n\nThird text block here...`}
                className="w-full h-48 bg-surface-2/50 border border-border/50 rounded-xl p-4 text-sm text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 leading-relaxed"
                whileFocus={{ scale: 1.01 }}
              />
              <div className="flex items-center gap-3 mt-4">
                <motion.button
                  onClick={handleBatchAnalyze}
                  disabled={batchLoading || !batchText.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-accent to-secondary hover:from-accent-light hover:to-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {batchLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={18} />
                    </motion.div>
                  ) : (
                    <Layers size={18} />
                  )}
                  Batch Analyze
                </motion.button>
                <span className="text-xs text-text-muted">
                  {batchText
                    .split(/\n\n+/)
                    .map((t) => t.trim())
                    .filter(Boolean).length}{' '}
                  text block(s)
                </span>
              </div>
            </div>

            <AnimatePresence>
              {batchError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-error/10 border border-error/20 rounded-xl p-4 text-error text-sm"
                >
                  {batchError}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {batchResults && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  {batchResults.map((res, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-surface/80 backdrop-blur border border-border/50 rounded-2xl p-5 space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          Block {idx + 1}
                          <span className="text-text-muted font-normal ml-2">
                            {res.text?.length || 0} chars
                          </span>
                        </h3>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-lg ${(res.issues?.length || 0) > 0
                            ? 'bg-warning/10 text-warning'
                            : 'bg-success/10 text-success'
                            }`}
                        >
                          {res.issues?.length || 0} issue{(res.issues?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <p className="text-sm text-text-muted">{res.summary}</p>

                      {res.issues && res.issues.length > 0 && (
                        <div className="space-y-2">
                          {res.issues.map((issue: any, issIdx: number) => (
                            <IssueCard key={issIdx} issue={issue} compact />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Issue Card sub-component                                           */
/* ------------------------------------------------------------------ */
function IssueCard({
  issue,
  compact = false,
}: {
  issue: any;
  compact?: boolean;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`bg-surface-2/50 backdrop-blur border border-border/50 rounded-xl ${compact ? 'p-3' : 'p-4'
        } space-y-2 hover:border-accent/30 transition-colors`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-error/10 text-error px-2 py-0.5 rounded-lg text-xs font-mono">
          "{issue.text}"
        </span>
        <SeverityBadge severity={issue.severity} />
        <span className="text-xs text-text-muted bg-surface/50 rounded-lg px-2 py-0.5 border border-border/50">
          {issue.category?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Message */}
      <p className={`text-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>
        {issue.explanation || issue.message}
      </p>

      {/* Suggestions */}
      {issue.suggestion && (
        <div className="flex flex-wrap gap-2">
          <div className="group relative">
            <span className="inline-flex items-center gap-1 bg-success/10 text-success border border-success/20 rounded-lg px-2 py-0.5 text-xs cursor-help">
              <CheckCircle2 size={12} />
              {issue.suggestion}
              {!compact && issue.confidence && (
                <span className="text-success/60 ml-1">
                  ({Math.round(issue.confidence * 100)}%)
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
