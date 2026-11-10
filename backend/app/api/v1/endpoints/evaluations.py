from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.evaluation import Evaluation
from app.models.project import EvaluatedProject
from app.models.review_note import ReviewNote
from app.models.audit import AuditRecord
from app.models.user import User
from app.schemas.evaluation import (
    EvaluationSummaryResponse,
    EvaluatedProjectSummary,
    ReviewNoteCreate,
    ReviewNoteResponse,
    EvaluationStatsResponse,
    AuditRecordResponse,
)
from app.auth.dependencies import get_current_user, get_optional_current_user, require_role
from app.services.pdf_generator import AcademicPdfGenerator

router = APIRouter(prefix="/evaluations", tags=["Faculty History & Evaluation Dossiers"])


@router.get("", response_model=Dict[str, Any])
async def list_evaluations(
    q: Optional[str] = Query(None, description="Search target or project name"),
    target_type: Optional[str] = Query(None, description="Filter by target type: profile or repository"),
    methodology_version: Optional[str] = Query(None, description="Filter by methodology version"),
    min_score: Optional[float] = Query(None, ge=0.0, le=10.0),
    max_score: Optional[float] = Query(None, ge=0.0, le=10.0),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves paginated evaluation history with search, filtering, and summary statistics.
    Accessible to faculty, reviewers, and public evaluation viewers.
    """
    stmt = select(Evaluation).options(
        selectinload(Evaluation.projects),
        selectinload(Evaluation.review_notes),
        selectinload(Evaluation.created_by)
    )

    if q:
        q_term = f"%{q.lower().strip()}%"
        stmt = stmt.where(
            or_(
                func.lower(Evaluation.target_identifier).like(q_term),
                Evaluation.projects.any(func.lower(EvaluatedProject.name).like(q_term)),
                Evaluation.projects.any(func.lower(EvaluatedProject.display_name).like(q_term))
            )
        )

    if target_type:
        stmt = stmt.where(Evaluation.target_type == target_type.lower())

    if methodology_version:
        stmt = stmt.where(Evaluation.methodology_version == methodology_version)

    if min_score is not None:
        stmt = stmt.where(Evaluation.overall_score >= min_score)

    if max_score is not None:
        stmt = stmt.where(Evaluation.overall_score <= max_score)

    # Order by evaluation_date descending
    stmt = stmt.order_by(desc(Evaluation.evaluation_date))

    # Total count query
    count_stmt = select(func.count(Evaluation.id))
    if q or target_type or methodology_version or min_score is not None or max_score is not None:
        # Re-apply filters for count
        count_stmt_filtered = select(func.count()).select_from(stmt.subquery())
        count_res = await db.execute(count_stmt_filtered)
    else:
        count_res = await db.execute(count_stmt)
    total_count = count_res.scalar_one() or 0

    # Pagination
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    result = await db.execute(stmt)
    evaluations = result.scalars().all()

    items = []
    for ev in evaluations:
        top_projects_summary = [
            EvaluatedProjectSummary(
                id=p.id,
                name=p.name,
                display_name=p.display_name,
                rank=p.rank,
                overall_score=p.overall_score,
                primary_language=p.primary_language,
                confidence_label=p.confidence_label
            )
            for p in ev.projects[:3]
        ]

        creator_name = ev.created_by.full_name if ev.created_by else None
        latest_verdict = ev.review_notes[0].accreditation_verdict if ev.review_notes else None

        items.append(EvaluationSummaryResponse(
            id=ev.id,
            target_type=ev.target_type,
            target_identifier=ev.target_identifier,
            is_demo=ev.is_demo,
            methodology_version=ev.methodology_version,
            total_repositories_found=ev.total_repositories_found,
            overall_score=ev.overall_score,
            evaluation_date=ev.evaluation_date,
            created_by_name=creator_name,
            top_projects=top_projects_summary,
            review_count=len(ev.review_notes),
            latest_verdict=latest_verdict
        ))

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 0
    }


@router.get("/stats/summary", response_model=EvaluationStatsResponse)
async def get_evaluations_stats(
    db: AsyncSession = Depends(get_db)
):
    """Returns aggregated academic evaluation statistics."""
    # 1. Total evaluations
    total_res = await db.execute(select(func.count(Evaluation.id)))
    total_evals = total_res.scalar_one() or 0

    # 2. Average score
    avg_res = await db.execute(select(func.avg(Evaluation.overall_score)))
    avg_score = round(float(avg_res.scalar_one() or 0.0), 1)

    # 3. High confidence projects
    high_conf_res = await db.execute(
        select(func.count(EvaluatedProject.id)).where(EvaluatedProject.confidence_label == "High")
    )
    high_conf_count = high_conf_res.scalar_one() or 0

    # 4. Top languages
    lang_res = await db.execute(
        select(EvaluatedProject.primary_language, func.count(EvaluatedProject.id).label("cnt"))
        .where(EvaluatedProject.primary_language != "Unknown")
        .group_by(EvaluatedProject.primary_language)
        .order_by(desc("cnt"))
        .limit(5)
    )
    top_languages = [{"language": row[0], "count": row[1]} for row in lang_res.all()]

    # 5. Recent reviews count
    rev_res = await db.execute(select(func.count(ReviewNote.id)))
    review_count = rev_res.scalar_one() or 0

    return EvaluationStatsResponse(
        total_evaluations=total_evals,
        average_score=avg_score,
        high_confidence_count=high_conf_count,
        top_languages=top_languages,
        recent_reviews_count=review_count
    )


@router.get("/audit/records", response_model=List[AuditRecordResponse])
async def list_audit_records(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(["FACULTY", "ADMIN"]))
):
    """Retrieves system audit records for review and compliance tracking."""
    stmt = select(AuditRecord).options(selectinload(AuditRecord.user)).order_by(desc(AuditRecord.created_at)).limit(50)
    result = await db.execute(stmt)
    records = result.scalars().all()

    output = []
    for r in records:
        output.append(AuditRecordResponse(
            id=r.id,
            action=r.action,
            details=r.details,
            ip_address=r.ip_address,
            created_at=r.created_at,
            user_email=r.user.email if r.user else None
        ))
    return output


@router.get("/{evaluation_id}")
async def get_evaluation_detail(
    evaluation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves full evaluation details including projects and faculty review notes."""
    stmt = select(Evaluation).where(Evaluation.id == evaluation_id).options(
        selectinload(Evaluation.projects),
        selectinload(Evaluation.review_notes).selectinload(ReviewNote.reviewer),
        selectinload(Evaluation.created_by)
    )
    result = await db.execute(stmt)
    ev = result.scalar_one_or_none()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation with ID '{evaluation_id}' was not found in records."
        )

    projects_data = []
    for p in ev.projects:
        projects_data.append({
            "id": p.id,
            "name": p.name,
            "display_name": p.display_name,
            "description": p.description,
            "repo_url": p.repo_url,
            "overall_score": p.overall_score,
            "rank": p.rank,
            "summary": p.summary,
            "stars": p.stars,
            "forks": p.forks,
            "primary_language": p.primary_language,
            "problem_solved": p.problem_solved,
            "architecture_notes": p.architecture_notes,
            "confidence_score": p.confidence_score,
            "confidence_label": p.confidence_label,
            "key_features": p.key_features or [],
            "tech_stack": p.tech_stack or [],
            "language_breakdown": p.language_breakdown or [],
            "criteria_breakdown": p.criteria_breakdown or [],
            "strengths": p.strengths or [],
            "weaknesses": p.weaknesses or [],
            "recommendations": p.recommendations or [],
            "complexity_metrics": p.complexity_metrics,
            "security_findings": p.security_findings or [],
            "evidence_files": p.evidence_files or [],
        })

    reviews_data = []
    for r in ev.review_notes:
        reviews_data.append({
            "id": r.id,
            "reviewer_name": r.reviewer_name,
            "reviewer_department": r.reviewer_department,
            "overall_comment": r.overall_comment,
            "accreditation_verdict": r.accreditation_verdict,
            "manual_score_override": r.manual_score_override,
            "created_at": r.created_at.isoformat()
        })

    return {
        "id": ev.id,
        "target_type": ev.target_type,
        "target_identifier": ev.target_identifier,
        "is_demo": ev.is_demo,
        "methodology_version": ev.methodology_version,
        "total_repositories_found": ev.total_repositories_found,
        "overall_score": ev.overall_score,
        "disclaimer": ev.disclaimer,
        "user_profile": ev.user_profile,
        "excluded_repositories": ev.excluded_repositories or [],
        "evaluation_date": ev.evaluation_date.isoformat(),
        "created_by_name": ev.created_by.full_name if ev.created_by else None,
        "projects": projects_data,
        "review_notes": reviews_data
    }


@router.get("/{evaluation_id}/pdf")
async def export_evaluation_pdf(
    evaluation_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Generates and downloads the official academic evaluation dossier as a PDF.
    Records audit entry for report download.
    """
    stmt = select(Evaluation).where(Evaluation.id == evaluation_id).options(
        selectinload(Evaluation.projects),
        selectinload(Evaluation.review_notes)
    )
    result = await db.execute(stmt)
    ev = result.scalar_one_or_none()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation with ID '{evaluation_id}' was not found."
        )

    evaluator_name = user.full_name if user else "Academic Review Board"
    pdf_generator = AcademicPdfGenerator()
    pdf_bytes = pdf_generator.generate_dossier_pdf(
        evaluation=ev,
        projects=ev.projects,
        review_notes=ev.review_notes,
        evaluator_name=evaluator_name
    )

    # Record Audit Record
    client_ip = request.client.host if request.client else None
    audit = AuditRecord(
        evaluation_id=ev.id,
        user_id=user.id if user else None,
        action="PDF_DOSSIER_DOWNLOADED",
        details={
            "target": ev.target_identifier,
            "methodology_version": ev.methodology_version,
            "dossier_size_bytes": len(pdf_bytes)
        },
        ip_address=client_ip
    )
    db.add(audit)
    await db.commit()

    safe_target = ev.target_identifier.replace("/", "_").replace("\\", "_")
    filename = f"RepoScope-Dossier-{safe_target}-{ev.id[:8]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )


@router.post("/{evaluation_id}/reviews", response_model=ReviewNoteResponse, status_code=status.HTTP_201_CREATED)
async def add_review_note(
    evaluation_id: str,
    payload: ReviewNoteCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    faculty_user: User = Depends(require_role(["FACULTY", "ADMIN"]))
):
    """
    Adds a faculty human review note, accreditation verdict, and optional score override.
    Enforces role-based access control.
    """
    ev_res = await db.execute(select(Evaluation).where(Evaluation.id == evaluation_id))
    ev = ev_res.scalar_one_or_none()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation with ID '{evaluation_id}' was not found."
        )

    valid_verdicts = ["APPROVED_EXEMPLARY", "APPROVED_SATISFACTORY", "CONDITIONAL_REVISION", "REJECTED"]
    verdict = payload.accreditation_verdict.upper()
    if verdict not in valid_verdicts:
        verdict = "APPROVED_SATISFACTORY"

    note = ReviewNote(
        evaluation_id=ev.id,
        user_id=faculty_user.id,
        reviewer_name=faculty_user.full_name,
        reviewer_department=faculty_user.department,
        overall_comment=payload.overall_comment.strip(),
        accreditation_verdict=verdict,
        manual_score_override=payload.manual_score_override
    )
    db.add(note)

    # If score override provided, update evaluation overall score
    if payload.manual_score_override is not None:
        ev.overall_score = payload.manual_score_override

    # Record Audit Record
    client_ip = request.client.host if request.client else None
    audit = AuditRecord(
        evaluation_id=ev.id,
        user_id=faculty_user.id,
        action="HUMAN_REVIEW_RECORDED",
        details={
            "verdict": verdict,
            "manual_score_override": payload.manual_score_override,
            "reviewer": faculty_user.full_name
        },
        ip_address=client_ip
    )
    db.add(audit)
    await db.commit()
    await db.refresh(note)

    return ReviewNoteResponse.model_validate(note)
