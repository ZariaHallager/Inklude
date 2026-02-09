import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Settings,
  Save,
  Plus,
  Check,
} from 'lucide-react';
import { admin } from '../lib/api';
import type { PolicySetting } from '../lib/types';

const POLICY_SUGGESTIONS: Record<string, string[]> = {
  enforcement_mode: ['suggest_only', 'auto_correct', 'block'],
  job_post_check: ['enabled', 'disabled'],
  email_check: ['enabled', 'disabled'],
  tone_default: ['gentle', 'direct', 'research_backed'],
};

export default function AdminPoliciesPage() {
  const { user, loading: authLoading } = useAuth();
  const [policies, setPolicies] = useState<PolicySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    admin
      .getPolicies()
      .then((data) => {
        setPolicies(data);
        const vals: Record<string, string> = {};
        data.forEach((p) => (vals[p.key] = p.value));
        setEditValues(vals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    const value = editValues[key];
    if (value === undefined) return;

    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const updated = await admin.updatePolicy(key, value);
      setPolicies((prev) =>
        prev.map((p) => (p.key === key ? updated : p)),
      );
      setSaved((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
    } catch (err) {
      console.error('Failed to save policy:', err);
    }
    setSaving((prev) => ({ ...prev, [key]: false }));
  };

  const handleAddPolicy = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setAddingNew(true);
    try {
      const created = await admin.updatePolicy(newKey.trim(), newValue.trim());
      setPolicies((prev) => [...prev, created]);
      setEditValues((prev) => ({ ...prev, [created.key]: created.value }));
      setNewKey('');
      setNewValue('');
    } catch (err) {
      console.error('Failed to add policy:', err);
    }
    setAddingNew(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-text-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Admin Console
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="text-accent" size={28} />
          Policy Configuration
        </h1>
      </div>

      {/* Existing Policies */}
      {loading ? (
        <div className="text-text-muted text-center py-12 animate-pulse">
          Loading policies...
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => {
            const suggestions = POLICY_SUGGESTIONS[policy.key];
            return (
              <div
                key={policy.id}
                className="bg-surface border border-border rounded-xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-text mb-1.5">
                      {policy.key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </label>
                    <p className="text-xs text-text-muted mb-2">
                      Key: <code className="text-accent/80">{policy.key}</code>
                    </p>
                    {suggestions ? (
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() =>
                              setEditValues((prev) => ({
                                ...prev,
                                [policy.key]: opt,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              editValues[policy.key] === opt
                                ? 'bg-accent text-white'
                                : 'bg-surface-2 text-text-muted hover:text-text'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editValues[policy.key] ?? ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [policy.key]: e.target.value,
                          }))
                        }
                        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => handleSave(policy.key)}
                    disabled={
                      saving[policy.key] ||
                      editValues[policy.key] === policy.value
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                  >
                    {saved[policy.key] ? (
                      <>
                        <Check size={16} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {saving[policy.key] ? 'Saving...' : 'Save'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Policy */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={18} className="text-accent" />
          Add Policy
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Policy key (e.g. enforcement_mode)"
            className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={handleAddPolicy}
            disabled={addingNew || !newKey.trim() || !newValue.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          >
            <Save size={16} />
            {addingNew ? 'Saving...' : 'Save'}
          </button>
        </div>
        {/* Suggestions */}
        <div className="mt-4">
          <p className="text-xs text-text-muted mb-2">Common policy keys:</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(POLICY_SUGGESTIONS).map((key) => (
              <button
                key={key}
                onClick={() => setNewKey(key)}
                className="px-2.5 py-1 rounded-md bg-surface-2 text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
