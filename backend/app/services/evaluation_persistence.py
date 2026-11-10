import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.evaluation import Evaluation
from app.models.project import EvaluatedProject
from app.models.audit import AuditRecord
from app.schemas.analysis import AnalysisResponse, DetailedProjectAnalysis

logger = logging.getLogger("reposcope.persistence")


class EvaluationPersistenceService:
    """Handles persisting AnalysisResponse objects to PostgreSQL/SQLite via SQLAlchemy 2.0."""

    @staticmethod
    async def persist_evaluation(
        db: AsyncSession,
        response: AnalysisResponse,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Evaluation:
        """Persists a complete AnalysisResponse into relational tables."""
        # Calculate overall score: average of analyzed projects or top project's score
        overall_score = 0.0
        if response.analyzed_projects:
            overall_score = round(response.analyzed_projects[0].overall_score, 1)

        eval_date = datetime.now(timezone.utc)
        if response.evaluation_date:
            try:
                eval_date = datetime.fromisoformat(response.evaluation_date.replace("Z", "+00:00"))
            except Exception:
                pass

        user_profile_data = response.user_profile.model_dump() if response.user_profile else None
        excluded_data = [ex.model_dump() for ex in response.excluded_repositories] if response.excluded_repositories else []

        eval_id = response.analysis_id or str(uuid.uuid4())

        # Check if evaluation already exists (e.g. from background task re-save)
        existing = await db.execute(select(Evaluation).where(Evaluation.id == eval_id))
        eval_record = existing.scalar_one_or_none()

        if not eval_record:
            eval_record = Evaluation(
                id=eval_id,
                target_type=response.target_type.value if hasattr(response.target_type, "value") else str(response.target_type),
                target_identifier=response.target_identifier,
                is_demo=response.is_demo,
                methodology_version=settings.METHODOLOGY_VERSION,
                total_repositories_found=response.total_repositories_found,
                overall_score=overall_score,
                disclaimer=response.disclaimer,
                user_profile=user_profile_data,
                excluded_repositories=excluded_data,
                created_by_user_id=user_id,
                evaluation_date=eval_date,
            )
            db.add(eval_record)
            await db.flush()

        # Add Evaluated Projects
        for p in response.analyzed_projects:
            # Check if project already stored
            proj_id = f"{eval_id}_{p.id}"
            existing_proj = await db.execute(select(EvaluatedProject).where(EvaluatedProject.id == proj_id))
            if existing_proj.scalar_one_or_none():
                continue

            tech_stack_data = [ts.model_dump() for ts in p.tech_stack] if p.tech_stack else []
            lang_data = [lb.model_dump() for lb in p.language_breakdown] if p.language_breakdown else []
            crit_data = [cb.model_dump() for cb in p.criteria_breakdown] if p.criteria_breakdown else []
            sec_data = [sf.model_dump() for sf in p.security_findings] if p.security_findings else []
            ev_data = [ef.model_dump() for ef in p.evidence_files] if p.evidence_files else []
            comp_data = p.complexity_metrics.model_dump() if p.complexity_metrics else None

            project_record = EvaluatedProject(
                id=proj_id,
                evaluation_id=eval_record.id,
                name=p.name,
                display_name=p.display_name,
                description=p.description,
                repo_url=p.repo_url,
                overall_score=p.overall_score,
                rank=p.rank,
                summary=p.summary,
                stars=p.stars,
                forks=p.forks,
                primary_language=p.primary_language,
                problem_solved=p.problem_solved,
                architecture_notes=p.architecture_notes,
                confidence_score=p.confidence_score,
                confidence_label=p.confidence_label,
                key_features=p.key_features,
                tech_stack=tech_stack_data,
                language_breakdown=lang_data,
                criteria_breakdown=crit_data,
                strengths=p.strengths,
                weaknesses=p.weaknesses,
                recommendations=p.recommendations,
                complexity_metrics=comp_data,
                security_findings=sec_data,
                evidence_files=ev_data,
            )
            db.add(project_record)

        # Audit Record
        audit = AuditRecord(
            evaluation_id=eval_record.id,
            user_id=user_id,
            action="EVALUATION_PERSISTED",
            details={
                "target_identifier": eval_record.target_identifier,
                "overall_score": overall_score,
                "project_count": len(response.analyzed_projects),
                "is_demo": response.is_demo,
            },
            ip_address=ip_address,
        )
        db.add(audit)
        await db.commit()
        await db.refresh(eval_record)
        logger.info(f"Successfully persisted evaluation '{eval_record.id}' for target '{eval_record.target_identifier}'")
        return eval_record
