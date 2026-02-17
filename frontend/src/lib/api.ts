/* ------------------------------------------------------------------ */
/*  API Client — wraps fetch with JWT injection                       */
/* ------------------------------------------------------------------ */

// Use VITE_API_BASE for production deployments, fallback to proxied /api/v1 for local dev
const BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/v1`
  : '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('inklude_token');
}

export function setToken(token: string) {
  localStorage.setItem('inklude_token', token);
}

export function clearToken() {
  localStorage.removeItem('inklude_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────
export const auth = {
  me: () => request<any>('/auth/me'),
  loginUrl: () => `${BASE}/auth/login/google`,
};

// ── Analysis ──────────────────────────────────────────────────────
import type {
  AnalysisResult,
  BatchAnalysisResult,
  ToneMode,
} from './types';

export const analysis = {
  text: (text: string, tone: ToneMode = 'gentle') =>
    request<AnalysisResult>('/analyze/text', {
      method: 'POST',
      body: JSON.stringify({ text, tone }),
    }),
  batch: (texts: string[], tone: ToneMode = 'gentle') =>
    request<BatchAnalysisResult>('/analyze/batch', {
      method: 'POST',
      body: JSON.stringify({ texts, tone }),
    }),
  checkPronouns: (text: string, personIds: string[], tone: ToneMode = 'gentle') =>
    request<AnalysisResult>('/analyze/check-pronouns', {
      method: 'POST',
      body: JSON.stringify({ text, person_ids: personIds, tone }),
    }),
};

// ── Identities ────────────────────────────────────────────────────
import type { Identity, PronounSet, Preference } from './types';

export const identities = {
  list: (offset = 0, limit = 50) =>
    request<Identity[]>(`/identities/?offset=${offset}&limit=${limit}`),
  get: (id: string) => request<Identity>(`/identities/${id}`),
  create: (data: {
    email: string;
    display_name: string;
    pronoun_sets?: Omit<PronounSet, 'id'>[];
    preference?: Omit<Preference, 'id' | 'updated_at'>;
  }) =>
    request<Identity>('/identities/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { display_name?: string }) =>
    request<Identity>(`/identities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/identities/${id}`, { method: 'DELETE' }),
  getPronouns: (id: string) =>
    request<PronounSet[]>(`/identities/${id}/pronouns`),
  replacePronouns: (id: string, sets: Omit<PronounSet, 'id'>[]) =>
    request<PronounSet[]>(`/identities/${id}/pronouns`, {
      method: 'PUT',
      body: JSON.stringify(sets),
    }),
  updatePreferences: (id: string, pref: Omit<Preference, 'id' | 'updated_at'>) =>
    request<Preference>(`/identities/${id}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(pref),
    }),
};

// ── Neo-Pronouns ─────────────────────────────────────────────────
import type { NeoPronoun } from './types';

export const neoPronouns = {
  list: (popularity?: string) =>
    request<{ count: number; sets: NeoPronoun[] }>(
      `/neo-pronouns/${popularity ? `?popularity=${popularity}` : ''}`,
    ),
  get: (label: string) => request<NeoPronoun>(`/neo-pronouns/${label}`),
  check: (token: string) =>
    request<{ token: string; is_neo_pronoun: boolean; matching_sets: string[] }>(
      `/neo-pronouns/check?token=${token}`,
    ),
};

// ── Custom Pronouns ──────────────────────────────────────────────
import type { CustomPronounSet } from './types';

export const customPronouns = {
  list: () => request<CustomPronounSet[]>('/custom-pronouns/'),
  submit: (data: {
    subject: string;
    object: string;
    possessive: string;
    possessive_pronoun: string;
    reflexive: string;
    label: string;
    usage_note?: string;
    example?: string;
  }) =>
    request<CustomPronounSet>('/custom-pronouns/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approve: (id: string) =>
    request<CustomPronounSet>(`/custom-pronouns/${id}/approve`, {
      method: 'PUT',
    }),
  delete: (id: string) =>
    request<void>(`/custom-pronouns/${id}`, { method: 'DELETE' }),
};

// ── Templates ────────────────────────────────────────────────────
import type { InclusiveTemplate } from './types';

export const templates = {
  list: (category?: string) =>
    request<InclusiveTemplate[]>(
      `/templates/${category ? `?category=${category}` : ''}`,
    ),
  get: (id: string) => request<InclusiveTemplate>(`/templates/${id}`),
  create: (data: {
    title: string;
    category: string;
    content: string;
    description?: string;
  }) =>
    request<InclusiveTemplate>('/templates/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: { title?: string; category?: string; content?: string; description?: string },
  ) =>
    request<InclusiveTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/templates/${id}`, { method: 'DELETE' }),
};

// ── Analytics ────────────────────────────────────────────────────
import type {
  AnalyticsOverview,
  AnalyticsTrend,
  CategoryBreakdown,
} from './types';

export const analytics = {
  overview: () => request<AnalyticsOverview>('/analytics/overview'),
  trends: (days = 30) =>
    request<AnalyticsTrend[]>(`/analytics/trends?days=${days}`),
  categories: () => request<CategoryBreakdown[]>('/analytics/categories'),
};

// ── Admin ────────────────────────────────────────────────────────
import type { Account, PolicySetting, AuditLogEntry } from './types';

export const admin = {
  listUsers: (offset = 0, limit = 50) =>
    request<Account[]>(`/admin/users?offset=${offset}&limit=${limit}`),
  updateRole: (id: string, role: string) =>
    request<Account>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  getPolicies: () => request<PolicySetting[]>('/admin/policies'),
  updatePolicy: (key: string, value: string) =>
    request<PolicySetting>('/admin/policies', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    }),
  getAuditLog: (offset = 0, limit = 50) =>
    request<AuditLogEntry[]>(`/admin/audit-log?offset=${offset}&limit=${limit}`),
};
