import { useEffect, useState } from 'react';
import {
  BarChart3,
  FileSearch,
  Users,
  UserCog,
  BookOpen,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { analytics } from '../lib/api';
import type {
  AnalyticsOverview,
  AnalyticsTrend,
  CategoryBreakdown,
} from '../lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const DAYS_OPTIONS = [7, 30, 90, 365] as const;

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analytics.overview(),
      analytics.trends(days),
      analytics.categories(),
    ])
      .then(([ov, tr, cat]) => {
        setOverview(ov);
        setTrends(tr);
        setCategories(cat);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const statCards = overview
    ? [
        {
          label: 'Total Analyses',
          value: overview.total_analyses,
          icon: FileSearch,
          color: 'text-accent',
          bg: 'bg-accent-glow',
        },
        {
          label: 'Issues Found',
          value: overview.total_issues_found,
          icon: AlertTriangle,
          color: 'text-yellow',
          bg: 'bg-yellow-bg',
        },
        {
          label: 'Identities',
          value: overview.total_identities,
          icon: Users,
          color: 'text-green',
          bg: 'bg-green-bg',
        },
        {
          label: 'Accounts',
          value: overview.total_accounts,
          icon: UserCog,
          color: 'text-blue',
          bg: 'bg-blue-bg',
        },
        {
          label: 'Templates',
          value: overview.total_templates,
          icon: BookOpen,
          color: 'text-accent',
          bg: 'bg-accent-glow',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-text-muted animate-pulse">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="text-accent" size={28} />
          Analytics
        </h1>
        <p className="text-text-muted mt-1">
          Inclusivity metrics and trends
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
              >
                <card.icon size={20} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            <p className="text-text-muted text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Days Range Selector */}
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-text-muted" />
        <span className="text-sm text-text-muted mr-2">Time range:</span>
        {DAYS_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              days === d
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-text-muted hover:text-text hover:bg-surface-2/80'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Trend Line Chart */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Trends Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e4a" />
              <XAxis
                dataKey="date"
                stroke="#8888a8"
                tick={{ fill: '#8888a8', fontSize: 12 }}
                tickFormatter={(v: string) =>
                  new Date(v).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <YAxis
                stroke="#8888a8"
                tick={{ fill: '#8888a8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a24',
                  border: '1px solid #2e2e4a',
                  borderRadius: '8px',
                  color: '#e8e8f0',
                }}
                labelFormatter={(v: string) =>
                  new Date(v).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Analyses"
                stroke="#7c5cff"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#7c5cff' }}
              />
              <Line
                type="monotone"
                dataKey="issues"
                name="Issues"
                stroke="#f87171"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#f87171' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e4a" />
              <XAxis
                dataKey="category"
                stroke="#8888a8"
                tick={{ fill: '#8888a8', fontSize: 12 }}
                tickFormatter={(v: string) =>
                  v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                }
              />
              <YAxis
                stroke="#8888a8"
                tick={{ fill: '#8888a8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a24',
                  border: '1px solid #2e2e4a',
                  borderRadius: '8px',
                  color: '#e8e8f0',
                }}
                labelFormatter={(v: string) =>
                  v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                }
              />
              <Bar
                dataKey="count"
                name="Count"
                fill="#7c5cff"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
