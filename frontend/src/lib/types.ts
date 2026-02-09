/* ------------------------------------------------------------------ */
/*  Shared TypeScript types mirroring the FastAPI schemas             */
/* ------------------------------------------------------------------ */

// ── Analysis ──────────────────────────────────────────────────────
export type IssueSeverity = 'low' | 'medium' | 'high';
export type IssueCategory =
  | 'gendered_language'
  | 'misgendering'
  | 'gendered_title'
  | 'gendered_colloquialism'
  | 'gendered_salutation';
export type ToneMode = 'gentle' | 'direct' | 'research_backed';

export interface TextSpan {
  start: number;
  end: number;
  text: string;
}

export interface Suggestion {
  replacement: string;
  explanation: string;
  confidence: number;
}

export interface DetectedIssue {
  span: TextSpan;
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  suggestions: Suggestion[];
}

export interface PronounOccurrence {
  span: TextSpan;
  pronoun_type: string;
  resolved_entity: string | null;
  is_neo_pronoun: boolean;
}

export interface AnalysisResult {
  text_length: number;
  issues: DetectedIssue[];
  pronouns_found: PronounOccurrence[];
  summary: string;
}

export interface BatchAnalysisResult {
  results: AnalysisResult[];
}

// ── Identity ──────────────────────────────────────────────────────
export type Visibility = 'public' | 'internal' | 'team' | 'private';

export interface PronounSet {
  id?: string;
  subject: string;
  object: string;
  possessive: string;
  possessive_pronoun: string;
  reflexive: string;
  is_primary: boolean;
}

export interface Preference {
  id?: string;
  title: string | null;
  visibility: Visibility;
  language_preference: string | null;
  updated_at?: string;
}

export interface Identity {
  id: string;
  email: string;
  display_name: string;
  pronoun_sets: PronounSet[];
  preference: Preference | null;
  created_at: string;
  updated_at: string;
}

// ── Neo-Pronouns ─────────────────────────────────────────────────
export interface NeoPronoun {
  subject: string;
  object: string;
  possessive: string;
  possessive_pronoun: string;
  reflexive: string;
  label: string;
  popularity: string;
  origin: string;
  usage_note: string;
  example: string;
}

// ── Custom Pronouns ──────────────────────────────────────────────
export interface CustomPronounSet {
  id: string;
  subject: string;
  object: string;
  possessive: string;
  possessive_pronoun: string;
  reflexive: string;
  label: string;
  usage_note: string | null;
  example: string | null;
  is_approved: boolean;
  submitted_by: string;
  created_at: string;
}

// ── Auth / Account ───────────────────────────────────────────────
export interface Account {
  id: string;
  email: string;
  display_name: string;
  role: 'user' | 'admin' | 'super_admin';
  avatar_url: string | null;
  identity_id: string | null;
  is_active?: boolean;
  created_at?: string;
  last_login?: string | null;
}

// ── Templates ────────────────────────────────────────────────────
export interface InclusiveTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Analytics ────────────────────────────────────────────────────
export interface AnalyticsOverview {
  total_analyses: number;
  total_issues_found: number;
  total_identities: number;
  total_accounts: number;
  total_templates: number;
}

export interface AnalyticsTrend {
  date: string;
  count: number;
  issues: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
}

// ── Admin ────────────────────────────────────────────────────────
export interface PolicySetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  account_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  created_at: string;
}
