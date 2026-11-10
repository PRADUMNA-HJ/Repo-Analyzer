from datetime import datetime, timezone
import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(255), default="Department of Computer Science & Engineering")
    role: Mapped[str] = mapped_column(String(50), default="FACULTY", index=True)  # FACULTY, ADMIN, REVIEWER, STUDENT
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    evaluations: Mapped[List["Evaluation"]] = relationship("Evaluation", back_populates="created_by", cascade="all, delete-orphan")
    review_notes: Mapped[List["ReviewNote"]] = relationship("ReviewNote", back_populates="reviewer", cascade="all, delete-orphan")
    audit_records: Mapped[List["AuditRecord"]] = relationship("AuditRecord", back_populates="user")
