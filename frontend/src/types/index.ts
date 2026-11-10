export type AnalysisType = 'profile' | 'repository';

export type AnalysisStage =
  | 'INITIALIZING'
  | 'FETCHING_REPOSITORIES'
  | 'FILTERING_REPOSITORIES'
  | 'INSPECTING_SOURCE'
  | 'ANALYZING_CODE'
  | 'EVALUATING_PROJECTS'
  | 'RANKING_PROJECTS'
  | 'GENERATING_REPORT'
  | 'COMPLETED'
  | 'FAILED';

export interface LanguageBreakdown {
  name: string;
  percentage: number;
  color: string;
  bytes_count?: number;
}

export interface TechnologyCategory {
  category: string;
  items: string[];
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number;
  score: number;
  max_score: number;
  rating_label: string;
  description: string;
  findings: string[];
  confidence?: string;
}

export interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | string;
  category: string;
  file_path: string;
  line_number?: number;
  explanation: string;
  remediation: string;
  evidence_snippet?: string;
}

export interface CodeComplexityMetrics {
  cyclomatic_complexity_avg?: number;
  cyclomatic_complexity_average?: number;
  maintainability_index?: number;
  total_functions?: number;
  total_classes?: number;
  function_count?: number;
  class_count?: number;
  type_hint_ratio?: number;
  docstring_coverage?: number;
  try_except_blocks?: number;
  max_function_length_statements?: number;
  high_complexity_functions_count?: number;
  notes?: string;
}

export interface EvidenceFileRef {
  path: string;
  category: string;
  line_count: number;
  relevance: string;
}

export interface ExcludedRepositoryInfo {
  name: string;
  reason: string;
}

export interface UserProfileInfo {
  username: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  public_repos_count?: number;
  followers?: number;
  html_url?: string;
}

export interface DetailedProjectAnalysis {
  id: string;
  name: string;
  display_name: string;
  description: string;
  repo_url: string;
  overall_score: number;
  rank: number;
  summary: string;
  stars: number;
  forks: number;
  primary_language: string;
  updated_at: string;
  problem_solved: string;
  key_features: string[];
  architecture_notes: string;
  tech_stack: TechnologyCategory[];
  language_breakdown: LanguageBreakdown[];
  criteria_breakdown: EvaluationCriterion[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];

  // Phase 2 Fields
  confidence_score?: number;
  confidence_label?: string;
  complexity_metrics?: CodeComplexityMetrics;
  security_findings?: SecurityFinding[];
  evidence_files?: EvidenceFileRef[];
  is_fork?: boolean;
  default_branch?: string;
  ranking_rationale?: string;
}

export interface AnalysisResponse {
  is_demo: boolean;
  target_type: AnalysisType;
  target_identifier: string;
  total_repositories_found: number;
  analyzed_projects: DetailedProjectAnalysis[];
  evaluation_date: string;
  disclaimer: string;

  // Phase 2 Fields
  analysis_id?: string;
  status?: AnalysisStage;
  user_profile?: UserProfileInfo;
  excluded_repositories?: ExcludedRepositoryInfo[];
  comparison_summary?: string;
}

export interface AnalysisJobStatus {
  analysis_id: string;
  stage: AnalysisStage;
  progress_percent: number;
  message: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisErrorResponse {
  detail: string;
  code: string;
  hint?: string;
}

export interface HealthResponse {
  status: string;
  application: string;
  version: string;
  environment: string;
  demo_mode: boolean;
  github_auth_configured?: boolean;
}

// Phase 3 Additions: Authentication & Evaluation History

export type UserRole = 'FACULTY' | 'ADMIN' | 'REVIEWER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  full_name: string;
  department: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface EvaluatedProjectSummary {
  id: string;
  name: string;
  display_name: string;
  rank: number;
  overall_score: number;
  primary_language: string;
  confidence_label: string;
}

export interface ReviewNote {
  id: string;
  reviewer_name: string;
  reviewer_department: string;
  overall_comment: string;
  accreditation_verdict: string;
  manual_score_override?: number;
  created_at: string;
}

export interface EvaluationSummary {
  id: string;
  target_type: string;
  target_identifier: string;
  is_demo: boolean;
  methodology_version: string;
  total_repositories_found: number;
  overall_score: number;
  evaluation_date: string;
  created_by_name?: string;
  top_projects: EvaluatedProjectSummary[];
  review_count: number;
  latest_verdict?: string;
}

export interface EvaluationStats {
  total_evaluations: number;
  average_score: number;
  high_confidence_count: number;
  top_languages: { language: string; count: number }[];
  recent_reviews_count: number;
}

export interface AuditRecord {
  id: string;
  action: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  user_email?: string;
}
