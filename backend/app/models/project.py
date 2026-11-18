import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import String, Float, Integer, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class EvaluatedProject(Base):
    __tablename__ = "evaluated_projects"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id: Mapped[str] = mapped_column(String(36), ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    repo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    rank: Mapped[int] = mapped_column(Integer, default=1)
    summary: Mapped[str] = mapped_column(Text, default="")
    stars: Mapped[int] = mapped_column(Integer, default=0)
    forks: Mapped[int] = mapped_column(Integer, default=0)
    primary_language: Mapped[str] = mapped_column(String(100), default="Unknown")
    problem_solved: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    architecture_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.8)
    confidence_label: Mapped[str] = mapped_column(String(50), default="High")

    # Structured collections stored as JSON
    key_features: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    tech_stack: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, default=list)
    language_breakdown: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, default=list)
    criteria_breakdown: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, default=list)
    strengths: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    weaknesses: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    recommendations: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    complexity_metrics: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    security_findings: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, default=list)
    evidence_files: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, default=list)

    # Relationships
    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="projects")

