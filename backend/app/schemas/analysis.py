from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from app.utils.github_validator import validate_and_parse_github_url


class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="API health status")
    application: str = Field(default="RepoScope API", description="Application name")
    version: str = Field(default="2.0.0", description="API semantic version")
    environment: str = Field(default="development", description="Current execution environment")
    demo_mode: bool = Field(default=True, description="Whether demo data mode is enabled")
    github_auth_configured: bool = Field(default=False, description="Whether GITHUB_TOKEN is present")
    database: Optional[str] = Field(default=None, description="Database connection status: connected or disconnected")
    database_type: Optional[str] = Field(default=None, description="Active database engine: postgresql or sqlite")


class AnalysisType(str, Enum):
    PROFILE = "profile"
    REPOSITORY = "repository"


class AnalysisStage(str, Enum):
    INITIALIZING = "INITIALIZING"
    FETCHING_REPOSITORIES = "FETCHING_REPOSITORIES"
    FILTERING_REPOSITORIES = "FILTERING_REPOSITORIES"
    INSPECTING_SOURCE = "INSPECTING_SOURCE"
    ANALYZING_CODE = "ANALYZING_CODE"
    EVALUATING_PROJECTS = "EVALUATING_PROJECTS"
    RANKING_PROJECTS = "RANKING_PROJECTS"
    GENERATING_REPORT = "GENERATING_REPORT"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AnalysisRequest(BaseModel):
    github_url: str = Field(
        ...,
        description="Public GitHub user profile or repository URL",
        examples=["https://github.com/torvalds", "https://github.com/fastapi/fastapi"],
    )
    demo_mode: Optional[bool] = Field(
        default=None,
        description="Explicitly force demonstration data or live GitHub analysis"
    )

    @field_validator("github_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        trimmed = (v or "").strip()
        if not trimmed:
            raise ValueError("GitHub URL cannot be empty")
        is_valid, _, _, _ = validate_and_parse_github_url(trimmed)
        if not is_valid:
            raise ValueError(
                "Invalid GitHub URL. Please provide a valid GitHub profile (e.g., https://github.com/username) "
                "or repository URL (e.g., https://github.com/username/repository)."
            )
        return trimmed


class LanguageBreakdown(BaseModel):
    name: str = Field(..., description="Programming language name")
    percentage: float = Field(..., ge=0.0, le=100.0, description="Calculated usage percentage")
    color: str = Field(..., description="Hex color representing language in charts")
    bytes_count: Optional[int] = Field(None, description="Raw bytes detected")


class TechnologyCategory(BaseModel):
    category: str = Field(..., description="Category name (e.g., Frontend, Backend, Database, DevOps)")
    items: List[str] = Field(..., description="List of detected frameworks, libraries or tools")


class EvaluationCriterion(BaseModel):
    id: str = Field(..., description="Criterion identifier")
    name: str = Field(..., description="Criterion display name")
    weight: int = Field(..., ge=1, le=100, description="Weight percentage in evaluation framework")
    score: float = Field(..., ge=0.0, le=10.0, description="Score awarded out of 10")
    max_score: float = Field(default=10.0, description="Maximum possible score")
    rating_label: str = Field(..., description="Qualitative rating label (e.g., Excellent, Strong, Moderate)")
    description: str = Field(..., description="Short explanation of evaluated dimension")
    findings: List[str] = Field(default_factory=list, description="Specific evidence-based observations")
    confidence: Optional[str] = Field(default="High", description="Confidence tier: High, Moderate, Limited")


class SecurityFinding(BaseModel):
    severity: str = Field(..., description="Severity level: critical, high, medium, low")
    category: str = Field(..., description="Vulnerability category or pattern type")
    file_path: str = Field(..., description="Source file relative path")
    line_number: Optional[int] = Field(None, description="Line number if localized")
    explanation: str = Field(..., description="Detailed explanation of the risk")
    remediation: str = Field(..., description="Remediation guidance")
    evidence_snippet: Optional[str] = Field(None, description="Redacted pattern evidence")


class CodeComplexityMetrics(BaseModel):
    cyclomatic_complexity_avg: Optional[float] = Field(None, description="Estimated average cyclomatic complexity")
    maintainability_index: Optional[float] = Field(None, description="Estimated maintainability index (0-100)")
    total_functions: int = Field(default=0, description="Count of detected functions/methods")
    total_classes: int = Field(default=0, description="Count of detected classes/structs")
    high_complexity_functions_count: int = Field(default=0, description="Functions with excessive branching")
    notes: Optional[str] = Field(None, description="Analysis observations or measurement limitations")


class EvidenceFileRef(BaseModel):
    path: str = Field(..., description="Inspected repository file path")
    category: str = Field(..., description="File role: entry_point, manifest, test, model, architecture")
    description: str = Field(..., description="Why this file was inspected")


class ExcludedRepositoryInfo(BaseModel):
    name: str = Field(..., description="Repository name")
    reason: str = Field(..., description="Reason for exclusion: fork, archived, empty, tutorial")


class UserProfileInfo(BaseModel):
    username: str = Field(..., description="GitHub login username")
    name: Optional[str] = Field(None, description="Public profile display name")
    avatar_url: Optional[str] = Field(None, description="Profile avatar picture URL")
    bio: Optional[str] = Field(None, description="Profile biography")
    public_repos_count: int = Field(default=0, description="Reported public repository count")
    followers: int = Field(default=0, description="Follower count")
    html_url: str = Field(..., description="GitHub web profile URL")


class DetailedProjectAnalysis(BaseModel):
    id: str = Field(..., description="Unique project slug or ID")
    name: str = Field(..., description="Repository name")
    display_name: str = Field(..., description="Human-friendly project title")
    description: str = Field(..., description="Project summary description")
    repo_url: str = Field(..., description="Repository URL or placeholder")
    overall_score: float = Field(..., ge=0.0, le=10.0, description="Overall explainable score out of 10")
    rank: int = Field(..., ge=1, description="Rank among discovered projects")
    summary: str = Field(..., description="Executive technical summary")
    stars: int = Field(default=0, description="Repository star count")
    forks: int = Field(default=0, description="Repository fork count")
    primary_language: str = Field(..., description="Primary detected language")
    updated_at: str = Field(..., description="Last repository update timestamp")
    problem_solved: str = Field(..., description="Core real-world problem addressed")
    key_features: List[str] = Field(..., description="Primary functional highlights")
    architecture_notes: str = Field(..., description="Software architectural design review")
    tech_stack: List[TechnologyCategory] = Field(..., description="Grouped technology stack")
    language_breakdown: List[LanguageBreakdown] = Field(..., description="Language percentage distribution")
    criteria_breakdown: List[EvaluationCriterion] = Field(..., description="Detailed 8-pillar scores")
    strengths: List[str] = Field(..., description="Key technical merits and engineering strengths")
    weaknesses: List[str] = Field(..., description="Identified areas for engineering improvement")
    recommendations: List[str] = Field(..., description="Actionable recommendations for enhancement")

    # Phase 2 Additions
    confidence_score: float = Field(default=0.9, ge=0.0, le=1.0, description="Confidence in evaluation evidence")
    confidence_label: str = Field(default="High", description="Confidence label: High, Moderate, Limited")
    complexity_metrics: Optional[CodeComplexityMetrics] = Field(None, description="Code complexity indicators")
    security_findings: List[SecurityFinding] = Field(default_factory=list, description="Static security observations")
    evidence_files: List[EvidenceFileRef] = Field(default_factory=list, description="Inspected source references")
    is_fork: bool = Field(default=False, description="Whether the repository is a fork")
    default_branch: str = Field(default="main", description="Default Git branch analyzed")
    ranking_rationale: Optional[str] = Field(None, description="Why this project was selected and ranked")


class AnalysisJobStatus(BaseModel):
    analysis_id: str = Field(..., description="Unique job identifier")
    stage: AnalysisStage = Field(..., description="Current processing stage")
    progress_percent: int = Field(default=0, ge=0, le=100, description="Progress indicator 0-100")
    message: str = Field(..., description="Human-readable stage description")
    error: Optional[str] = Field(None, description="Error message if failed")
    created_at: str = Field(..., description="Job start timestamp")
    updated_at: str = Field(..., description="Last stage update timestamp")


class AnalysisResponse(BaseModel):
    is_demo: bool = Field(default=True, description="Indicates whether this response contains demonstration data")
    target_type: AnalysisType = Field(..., description="Identified target type: profile or repository")
    target_identifier: str = Field(..., description="Username or owner/repo identifier")
    total_repositories_found: int = Field(..., description="Total public repositories discovered")
    analyzed_projects: List[DetailedProjectAnalysis] = Field(..., description="Top analyzed projects")
    evaluation_date: str = Field(..., description="Evaluation timestamp (ISO 8601)")
    disclaimer: str = Field(
        default="DEMO DATA: Phase 1 provides structured demonstration data to validate frontend/backend integration and UI layout. Real repository analysis will be activated in Phase 2.",
        description="Prominent demo data disclaimer"
    )

    # Phase 2 Additions
    analysis_id: Optional[str] = Field(None, description="Associated asynchronous job ID")
    status: Optional[AnalysisStage] = Field(None, description="Final analysis status")
    user_profile: Optional[UserProfileInfo] = Field(None, description="GitHub user profile metadata if profile target")
    excluded_repositories: List[ExcludedRepositoryInfo] = Field(default_factory=list, description="Repositories excluded and reasons")
    comparison_summary: Optional[str] = Field(None, description="Synthesis comparing the top projects")


class AnalysisError(BaseModel):
    detail: str = Field(..., description="Error message")
    code: str = Field(..., description="Machine-readable error code")
    hint: Optional[str] = Field(None, description="Helpful suggestion for fixing the issue")
