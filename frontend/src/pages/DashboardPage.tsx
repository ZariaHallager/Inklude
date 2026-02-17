import { useState } from 'react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle2,
} from 'lucide-react';
import { fadeInUp, staggerContainer, scaleIn } from '../animations/variants';

type ToneMode = 'gentle' | 'direct' | 'research_backed';

const TONE_OPTIONS: { value: ToneMode; label: string }[] = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'direct', label: 'Direct' },
  { value: 'research_backed', label: 'Research-backed' },
];

export default function DashboardPage() {
  const { user } = useCurrentUser();

  // Convex queries
  const overview = useQuery(api.analytics.getOverview);
  const overviewLoading = overview === undefined;

  // Quick Analyze state
  const [qaText, setQaText] = useState('');
  const [qaTone, setQaTone] = useState<ToneMode>('gentle');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResult, setQaResult] = useState<any | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  // Convex action for analysis
  const analyzeText = useAction(api.analysis.analyzeText);
  const logAnalysis = useMutation(api.analytics.logAnalysis);

  const handleQuickAnalyze = async () => {
    if (!qaText.trim()) return;
    setQaLoading(true);
    setQaError(null);
    setQaResult(null);
    try {
      const result = await analyzeText({
        text: qaText,
        tone: qaTone,
        provider: 'gemini',
      });
      setQaResult(result);

      // Log the analysis
      await logAnalysis({
        textLength: qaText.length,
        issuesFound: result.issues?.length || 0,
        categories: result.metadata?.categories || [],
        tone: qaTone,
        provider: 'gemini',
      });
    } catch (err: any) {
      setQaError(err.message || 'Analysis failed');
    } finally {
      setQaLoading(false);
    }
  };

  const STAT_CARDS: {
    key: string;
    label: string;
    icon: typeof BarChart3;
    color: string;
    gradient: string;
  }[] = [
      { key: 'totalAnalyses', label: 'Total Analyses', icon: BarChart3, color: 'text-accent', gradient: 'from-accent/20 to-accent/5' },
      { key: 'totalIssues', label: 'Issues Found', icon: AlertTriangle, color: 'text-warning', gradient: 'from-warning/20 to-warning/5' },
      { key: 'totalIdentities', label: 'Identities', icon: Users, color: 'text-success', gradient: 'from-success/20 to-success/5' },
      { key: 'totalAccounts', label: 'Accounts', icon: UserCog, color: 'text-tertiary', gradient: 'from-tertiary/20 to-tertiary/5' },
      { key: 'totalTemplates', label: 'Templates', icon: BookOpen, color: 'text-secondary', gradient: 'from-secondary/20 to-secondary/5' },
    ];

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-text-muted mt-1">
          Welcome back, <span className="text-accent font-medium">{user?.name || 'there'}</span>
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        variants={staggerContainer}
      >
        {STAT_CARDS.map(({ key, label, icon: Icon, color, gradient }, index) => (
          <motion.div
            key={key}
            variants={scaleIn}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`bg-gradient-to-br ${gradient} backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {label}
              </span>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                <Icon size={18} className={color} />
              </motion.div>
            </div>
            <div className="text-3xl font-bold tabular-nums font-display">
              {overviewLoading ? (
                <motion.div
                  className="h-9 w-16 bg-surface-2/50 rounded-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ) : (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {((overview as any)?.[key] ?? 0).toLocaleString()}
                </motion.span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Analyze */}
      <motion.div
        variants={fadeInUp}
        className="bg-surface/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={18} className="text-accent" />
          </motion.div>
          <h2 className="text-lg font-semibold font-display">Quick Analyze</h2>
        </div>

        <motion.textarea
          value={qaText}
          onChange={(e) => setQaText(e.target.value)}
          placeholder="Type or paste text to quickly check for inclusive language..."
          className="w-full h-32 bg-surface-2/50 border border-border/50 rounded-xl p-4 text-sm text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
          whileFocus={{ scale: 1.01 }}
        />

        <div className="flex items-center gap-3 mt-4">
          {/* Tone select */}
          <select
            title="Tone"
            value={qaTone}
            onChange={(e) => setQaTone(e.target.value as ToneMode)}
            className="bg-surface-2/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent/50 cursor-pointer transition-all duration-200"
          >
            {TONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <motion.button
            onClick={handleQuickAnalyze}
            disabled={qaLoading || !qaText.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-accent to-secondary hover:from-accent-light hover:to-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {qaLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={16} />
              </motion.div>
            ) : (
              <Send size={16} />
            )}
            Analyze
          </motion.button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {qaError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-error/10 border border-error/20 rounded-xl p-4 text-error text-sm"
            >
              {qaError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Result */}
        <AnimatePresence>
          {qaResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 space-y-4"
            >
              {/* Summary */}
              <motion.div
                className="bg-surface-2/50 border border-border/50 rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-sm font-medium text-text-muted mb-1">Summary</h3>
                <p className="text-sm text-text">{qaResult.summary}</p>
              </motion.div>

              {/* Issues */}
              {qaResult.issues && qaResult.issues.length > 0 ? (
                <motion.div
                  className="space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-sm font-medium text-text-muted">
                    Issues ({qaResult.issues.length})
                  </h3>
                  {qaResult.issues.map((issue: any, idx: number) => (
                    <motion.div
                      key={idx}
                      variants={fadeInUp}
                      className="bg-surface-2/50 border border-border/50 rounded-xl p-4 space-y-2 hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-error/10 text-error px-2 py-0.5 rounded-lg text-xs font-mono">
                          "{issue.text}"
                        </span>
                        <SeverityBadge severity={issue.severity} />
                        <span className="text-xs text-text-muted bg-surface/50 rounded-lg px-2 py-0.5 border border-border/50">
                          {issue.category?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted">{issue.explanation}</p>
                      {issue.suggestion && (
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 bg-success/10 text-success border border-success/20 rounded-lg px-2 py-0.5 text-xs">
                            <CheckCircle2 size={12} />
                            {issue.suggestion}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-success/10 border border-success/20 rounded-xl p-4 text-success text-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  No issues found — your text looks inclusive!
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
