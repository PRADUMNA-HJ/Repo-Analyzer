from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class EvaluatedProjectSummary(BaseModel):
    id: str
    name: str
    display_name: str
    rank: int
    overall_score: float
    primary_language: str
    confidence_label: str

    model_config = ConfigDict(from_attributes=True)


class ReviewNoteCreate(BaseModel):
    overall_comment: str = Field(..., min_length=5, description="Faculty qualitative evaluation remarks.")
    accreditation_verdict: str = Field(
        "APPROVED_SATISFACTORY",
        description="Verdict: APPROVED_EXEMPLARY, APPROVED_SATISFACTORY, CONDITIONAL_REVISION, REJECTED"
    )
    manual_score_override: Optional[float] = Field(None, ge=0.0, le=10.0)


class ReviewNoteResponse(BaseModel):
    id: str
    reviewer_name: str
    reviewer_department: str
    overall_comment: str
    accreditation_verdict: str
    manual_score_override: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvaluationSummaryResponse(BaseModel):
    id: str
    target_type: str
    target_identifier: str
    is_demo: bool
    methodology_version: str
    total_repositories_found: int
    overall_score: float
    evaluation_date: datetime
    created_by_name: Optional[str] = None
    top_projects: List[EvaluatedProjectSummary] = []
    review_count: int = 0
    latest_verdict: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EvaluationStatsResponse(BaseModel):
    total_evaluations: int
    average_score: float
    high_confidence_count: int
    top_languages: List[Dict[str, Any]]
    recent_reviews_count: int


class AuditRecordResponse(BaseModel):
    id: str
    action: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime
    user_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
