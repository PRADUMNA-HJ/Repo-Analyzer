from datetime import datetime, timezone
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import String, Boolean, Float, Integer, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    target_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # "profile" or "repository"
    target_identifier: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    methodology_version: Mapped[str] = mapped_column(String(50), default="2.1.0", index=True)
    total_repositories_found: Mapped[int] = mapped_column(Integer, default=0)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    disclaimer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Structured metadata stored as JSON
    user_profile: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    excluded_repositories: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)

    # Optional faculty author link
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    evaluation_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    created_by: Mapped[Optional["User"]] = relationship("User", back_populates="evaluations")
    projects: Mapped[List["EvaluatedProject"]] = relationship("EvaluatedProject", back_populates="evaluation", cascade="all, delete-orphan", order_by="EvaluatedProject.rank")
    review_notes: Mapped[List["ReviewNote"]] = relationship("ReviewNote", back_populates="evaluation", cascade="all, delete-orphan", order_by="ReviewNote.created_at.desc()")
    audit_records: Mapped[List["AuditRecord"]] = relationship("AuditRecord", back_populates="evaluation", cascade="all, delete-orphan")
