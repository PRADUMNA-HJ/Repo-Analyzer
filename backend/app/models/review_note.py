from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlalchemy import String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class ReviewNote(Base):
    __tablename__ = "review_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id: Mapped[str] = mapped_column(String(36), ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    reviewer_department: Mapped[str] = mapped_column(String(255), default="Department of Computer Science & Engineering")
    overall_comment: Mapped[str] = mapped_column(Text, nullable=False)
    accreditation_verdict: Mapped[str] = mapped_column(
        String(50),
        default="APPROVED_SATISFACTORY",
        index=True
    )  # APPROVED_EXEMPLARY, APPROVED_SATISFACTORY, CONDITIONAL_REVISION, REJECTED
    manual_score_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="review_notes")
    reviewer: Mapped["User"] = relationship("User", back_populates="review_notes")

