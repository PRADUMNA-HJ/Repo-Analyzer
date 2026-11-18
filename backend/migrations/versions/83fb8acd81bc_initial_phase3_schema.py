"""initial_phase3_schema

Revision ID: 83fb8acd81bc
Revises: 
Create Date: 2026-11-10 17:02:55.951699

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '83fb8acd81bc'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Creates users, evaluations, evaluated_projects, review_notes, and audit_records tables."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. users table
    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("full_name", sa.String(length=255), nullable=False),
            sa.Column("department", sa.String(length=255), server_default="Department of Computer Science & Engineering", nullable=False),
            sa.Column("role", sa.String(length=50), server_default="FACULTY", nullable=False),
            sa.Column("is_active", sa.Boolean(), server_default=sa.text("1"), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_users_email", "users", ["email"], unique=True)
        op.create_index("ix_users_role", "users", ["role"], unique=False)

    # 2. evaluations table
    if "evaluations" not in existing_tables:
        op.create_table(
            "evaluations",
            sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
            sa.Column("target_type", sa.String(length=50), nullable=False),
            sa.Column("target_identifier", sa.String(length=255), nullable=False),
            sa.Column("is_demo", sa.Boolean(), server_default=sa.text("0"), nullable=False),
            sa.Column("methodology_version", sa.String(length=50), server_default="2.1.0", nullable=False),
            sa.Column("total_repositories_found", sa.Integer(), server_default="0", nullable=False),
            sa.Column("overall_score", sa.Float(), server_default="0.0", nullable=False),
            sa.Column("disclaimer", sa.Text(), nullable=True),
            sa.Column("user_profile", sa.JSON(), nullable=True),
            sa.Column("excluded_repositories", sa.JSON(), nullable=True),
            sa.Column("created_by_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.Column("evaluation_date", sa.DateTime(timezone=True), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_evaluations_target_type", "evaluations", ["target_type"], unique=False)
        op.create_index("ix_evaluations_target_identifier", "evaluations", ["target_identifier"], unique=False)
        op.create_index("ix_evaluations_overall_score", "evaluations", ["overall_score"], unique=False)
        op.create_index("ix_evaluations_methodology_version", "evaluations", ["methodology_version"], unique=False)

    # 3. evaluated_projects table
    if "evaluated_projects" not in existing_tables:
        op.create_table(
            "evaluated_projects",
            sa.Column("id", sa.String(length=255), primary_key=True, nullable=False),
            sa.Column("evaluation_id", sa.String(length=36), sa.ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("display_name", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("repo_url", sa.String(length=500), nullable=False),
            sa.Column("overall_score", sa.Float(), server_default="0.0", nullable=False),
            sa.Column("rank", sa.Integer(), server_default="1", nullable=False),
            sa.Column("summary", sa.Text(), server_default="", nullable=False),
            sa.Column("stars", sa.Integer(), server_default="0", nullable=False),
            sa.Column("forks", sa.Integer(), server_default="0", nullable=False),
            sa.Column("primary_language", sa.String(length=100), server_default="Unknown", nullable=False),
            sa.Column("problem_solved", sa.Text(), nullable=True),
            sa.Column("architecture_notes", sa.Text(), nullable=True),
            sa.Column("confidence_score", sa.Float(), server_default="0.8", nullable=False),
            sa.Column("confidence_label", sa.String(length=50), server_default="High", nullable=False),
            sa.Column("key_features", sa.JSON(), nullable=True),
            sa.Column("tech_stack", sa.JSON(), nullable=True),
            sa.Column("language_breakdown", sa.JSON(), nullable=True),
            sa.Column("criteria_breakdown", sa.JSON(), nullable=True),
            sa.Column("strengths", sa.JSON(), nullable=True),
            sa.Column("weaknesses", sa.JSON(), nullable=True),
            sa.Column("recommendations", sa.JSON(), nullable=True),
            sa.Column("complexity_metrics", sa.JSON(), nullable=True),
            sa.Column("security_findings", sa.JSON(), nullable=True),
            sa.Column("evidence_files", sa.JSON(), nullable=True),
        )
        op.create_index("ix_evaluated_projects_evaluation_id", "evaluated_projects", ["evaluation_id"], unique=False)

    # 4. review_notes table
    if "review_notes" not in existing_tables:
        op.create_table(
            "review_notes",
            sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
            sa.Column("evaluation_id", sa.String(length=36), sa.ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("reviewer_name", sa.String(length=255), nullable=False),
            sa.Column("reviewer_department", sa.String(length=255), server_default="Department of Computer Science & Engineering", nullable=False),
            sa.Column("overall_comment", sa.Text(), nullable=False),
            sa.Column("accreditation_verdict", sa.String(length=50), server_default="APPROVED_SATISFACTORY", nullable=False),
            sa.Column("manual_score_override", sa.Float(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_review_notes_evaluation_id", "review_notes", ["evaluation_id"], unique=False)
        op.create_index("ix_review_notes_user_id", "review_notes", ["user_id"], unique=False)
        op.create_index("ix_review_notes_accreditation_verdict", "review_notes", ["accreditation_verdict"], unique=False)

    # 5. audit_records table
    if "audit_records" not in existing_tables:
        op.create_table(
            "audit_records",
            sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
            sa.Column("evaluation_id", sa.String(length=36), sa.ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=True),
            sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.Column("action", sa.String(length=100), nullable=False),
            sa.Column("details", sa.JSON(), nullable=True),
            sa.Column("ip_address", sa.String(length=50), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_audit_records_evaluation_id", "audit_records", ["evaluation_id"], unique=False)
        op.create_index("ix_audit_records_user_id", "audit_records", ["user_id"], unique=False)
        op.create_index("ix_audit_records_action", "audit_records", ["action"], unique=False)
        op.create_index("ix_audit_records_created_at", "audit_records", ["created_at"], unique=False)


def downgrade() -> None:
    """Downgrade schema: Drops all tables in reverse dependency order."""
    op.drop_table("audit_records")
    op.drop_table("review_notes")
    op.drop_table("evaluated_projects")
    op.drop_table("evaluations")
    op.drop_table("users")
