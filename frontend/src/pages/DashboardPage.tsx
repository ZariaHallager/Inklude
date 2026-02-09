import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analytics, analysis } from '../lib/api';
import type { AnalyticsOverview, AnalysisResult, ToneMode } from '../lib/types';
import SeverityBadge from '../components/SeverityBadge';
import {
  BarChart3,
  AlertTriangle,
  Users,
  UserCog,
  BookOpen,
  Sparkles,
  Send,
  Loader2,
} from 'lucide-react';

const TONE_OPTIONS: { value: ToneMode; label: string }[] = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'direct', label: 'Direct' },
  { value: 'research_backed', label: 'Research-backed' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Quick Analyze state
  const [qaText, setQaText] = useState('');
  const [qaTone, setQaTone] = useState<ToneMode>('gentle');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResult, setQaResult] = useState<AnalysisResult | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  useEffect(() => {
    analytics
      .overview()
      .then(setOverview)
      .catch(() => {})
      .finally(() => setOverviewLoading(false));
  }, []);

  const handleQuickAnalyze = async () => {
    if (!qaText.trim()) return;
    setQaLoading(true);
    setQaError(null);
    setQaResult(null);
    try {
      const result = await analysis.text(qaText, qaTone);
      setQaResult(result);
    } catch (err: any) {
      setQaError(err.message || 'Analysis failed');
    } finally {
      setQaLoading(false);
    }
  };

  const STAT_CARDS: {
    key: keyof AnalyticsOverview;
    label: string;
    icon: typeof BarChart3;
    color: string;
  }[] = [
    { key: 'total_analyses', label: 'Total Analyses', icon: BarChart3, color: 'text-accent' },
    { key: 'total_issues_found', label: 'Issues Found', icon: AlertTriangle, color: 'text-yellow' },
    { key: 'total_identities', label: 'Identities', icon: Users, color: 'text-green' },
    { key: 'total_accounts', label: 'Accounts', icon: UserCog, color: 'text-blue' },
    { key: 'total_templates', label: 'Templates', icon: BookOpen, color: 'text-accent-light' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-muted mt-1">
          Welcome back, <span className="text-text">{user?.display_name}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 transition-colors hover:border-accent/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {label}
              </span>
              <Icon size={16} className={color} />
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {overviewLoading ? (
                <div className="h-9 w-16 bg-surface-2 rounded animate-pulse" />
              ) : (
                (overview?.[key] ?? 0).toLocaleString()
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Analyze */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-accent" />
          <h2 className="text-lg font-semibold">Quick Analyze</h2>
        </div>

        <textarea
          value={qaText}
          onChange={(e) => setQaText(e.target.value)}
          placeholder="Type or paste text to quickly check for inclusive language..."
          className="w-full h-32 bg-surface-2 border border-border rounded-lg p-4 text-sm text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
        />

        <div className="flex items-center gap-3 mt-4">
          {/* Tone select */}
          <select
            value={qaTone}
            onChange={(e) => setQaTone(e.target.value as ToneMode)}
            className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent/50 cursor-pointer"
          >
            {TONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleQuickAnalyze}
            disabled={qaLoading || !qaText.trim()}
            className="flex items-center gap-2 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] cursor-pointer"
          >
            {qaLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Analyze
          </button>
        </div>

        {/* Error */}
        {qaError && (
          <div className="mt-4 bg-red-bg border border-red/20 rounded-lg p-4 text-red text-sm">
            {qaError}
          </div>
        )}

        {/* Quick Result */}
        {qaResult && (
          <div className="mt-6 space-y-4">
            {/* Summary */}
            <div className="bg-surface-2 border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-text-muted mb-1">Summary</h3>
              <p className="text-sm text-text">{qaResult.summary}</p>
            </div>

            {/* Issues */}
            {qaResult.issues.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-text-muted">
                  Issues ({qaResult.issues.length})
                </h3>
                {qaResult.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-2 border border-border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-red-bg text-red px-2 py-0.5 rounded text-xs font-mono">
                        "{issue.span.text}"
                      </span>
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-xs text-text-muted bg-surface rounded px-2 py-0.5 border border-border">
                        {issue.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">{issue.message}</p>
                    {issue.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {issue.suggestions.map((s, si) => (
                          <span
                            key={si}
                            className="inline-flex items-center gap-1 bg-green-bg text-green border border-green/20 rounded px-2 py-0.5 text-xs"
                          >
                            {s.replacement}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-green-bg border border-green/20 rounded-lg p-4 text-green text-sm">
                No issues found — your text looks inclusive!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
