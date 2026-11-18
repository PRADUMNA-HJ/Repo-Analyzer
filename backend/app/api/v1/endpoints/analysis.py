import asyncio
import logging
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.schemas.analysis import (
    AnalysisError,
    AnalysisJobStatus,
    AnalysisRequest,
    AnalysisResponse,
    AnalysisStage,
    AnalysisType,
    DetailedProjectAnalysis,
)
from app.services.analysis_service import AnalysisService, get_analysis_service
from app.services.job_store import job_store
from app.services.evaluation_persistence import EvaluationPersistenceService
from app.services.pdf_generator import AcademicPdfGenerator
from app.utils.github_validator import validate_and_parse_github_url
from app.db.session import get_db, AsyncSessionLocal
from app.models.user import User
from app.models.evaluation import Evaluation
from app.models.audit import AuditRecord
from app.auth.dependencies import get_optional_current_user

logger = logging.getLogger("reposcope.analysis")
router = APIRouter(prefix="/analysis", tags=["Analysis"])


async def _run_background_analysis(
    service: AnalysisService,
    analysis_id: str,
    target_type: AnalysisType,
    username: str,
    repo_name: Optional[str],
    user_id: Optional[str] = None
):
    try:
        final_response = await service.execute_real_analysis(
            target_type=target_type,
            username=username,
            repo_name=repo_name,
            analysis_id=analysis_id
        )
        # Automatically persist to database for history and PDF export
        try:
            async with AsyncSessionLocal() as session:
                await EvaluationPersistenceService.persist_evaluation(
                    db=session,
                    response=final_response,
                    user_id=user_id
                )
        except Exception as db_err:
            logger.error(f"Failed to persist evaluation {analysis_id}: {db_err}")
    except HTTPException as he:
        await job_store.update_job(
            analysis_id=analysis_id,
            stage=AnalysisStage.FAILED,
            progress_percent=0,
            message="Analysis failed",
            error=str(he.detail)
        )
    except Exception as exc:
        await job_store.update_job(
            analysis_id=analysis_id,
            stage=AnalysisStage.FAILED,
            progress_percent=0,
            message="Internal error during analysis",
            error=str(exc)
        )


@router.post(
    "",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze GitHub Profile or Repository",
    description=(
        "Analyzes a GitHub user profile or single repository URL. "
        "Supports both synchronous evaluation (for demo mode or when sync=true) "
        "and asynchronous background job dispatch with progress tracking."
    ),
    responses={
        400: {"model": AnalysisError, "description": "Bad Request or Malformed Input"},
        404: {"model": AnalysisError, "description": "Target profile or repository not found"},
        422: {"model": AnalysisError, "description": "Unprocessable GitHub URL"},
        429: {"model": AnalysisError, "description": "GitHub API rate limit exhausted"},
    }
)
async def analyze_repository(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    sync: bool = Query(default=False, description="Whether to wait synchronously for real analysis completion"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
    service: AnalysisService = Depends(get_analysis_service)
) -> AnalysisResponse:
    is_valid, target_type_str, username, repo_name = validate_and_parse_github_url(request.github_url)

    if not is_valid or not target_type_str or not username:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid GitHub URL. Must be a valid user profile or repository path on github.com."
        )

    target_type = AnalysisType(target_type_str)

    # 1. Handle Demo Mode (Synchronous return, preserving Phase 1 behavior)
    if service._determine_demo_mode(request):
        demo_resp = await service.analyze_github_target(request)
        try:
            await EvaluationPersistenceService.persist_evaluation(
                db=db,
                response=demo_resp,
                user_id=current_user.id if current_user else None
            )
        except Exception as e:
            logger.warning(f"Could not persist demo evaluation: {e}")
        return demo_resp

    # 2. Synchronous Real Analysis
    if sync:
        real_resp = await service.execute_real_analysis(target_type, username, repo_name)
        try:
            await EvaluationPersistenceService.persist_evaluation(
                db=db,
                response=real_resp,
                user_id=current_user.id if current_user else None
            )
        except Exception as e:
            logger.warning(f"Could not persist real evaluation: {e}")
        return real_resp

    # 3. Asynchronous Background Job Processing
    analysis_id = await job_store.create_job(request.github_url)
    user_id = current_user.id if current_user else None
    background_tasks.add_task(
        _run_background_analysis,
        service,
        analysis_id,
        target_type,
        username,
        repo_name,
        user_id
    )

    # Return initial status with analysis_id so client can poll
    target_identifier = f"{username}/{repo_name}" if repo_name else username
    return AnalysisResponse(
        is_demo=False,
        target_type=target_type,
        target_identifier=target_identifier,
        total_repositories_found=0,
        analyzed_projects=[],
        evaluation_date="",
        disclaimer="",
        analysis_id=analysis_id,
        status=AnalysisStage.INITIALIZING
    )


@router.get(
    "/{analysis_id}/status",
    response_model=AnalysisJobStatus,
    summary="Get Analysis Job Status",
    description="Returns current progress percent and execution stage for an asynchronous job."
)
async def get_analysis_status(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> AnalysisJobStatus:
    status_entry = await job_store.get_status(analysis_id)
    if not status_entry:
        # Fallback to database check in case worker restarted or handled by separate Uvicorn process
        eval_record = await db.get(Evaluation, analysis_id)
        if eval_record:
            return AnalysisJobStatus(
                analysis_id=analysis_id,
                stage=AnalysisStage.COMPLETED,
                progress_percent=100,
                message="Analysis completed and persisted."
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{analysis_id}' not found or expired."
        )
    return status_entry


@router.get(
    "/{analysis_id}",
    response_model=AnalysisResponse,
    summary="Get Completed Analysis Result",
    description="Returns full evaluated analysis report once processing has completed."
)
async def get_analysis_result(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> AnalysisResponse:
    result = await job_store.get_result(analysis_id)
    if not result:
        # Check database fallback
        stmt = select(Evaluation).where(Evaluation.id == analysis_id).options(selectinload(Evaluation.projects))
        db_res = await db.execute(stmt)
        eval_rec = db_res.scalar_one_or_none()
        if eval_rec:
            return EvaluationPersistenceService.evaluation_to_analysis_response(eval_rec)

        status_entry = await job_store.get_status(analysis_id)
        if status_entry and status_entry.stage != AnalysisStage.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_202_ACCEPTED,
                detail=f"Analysis is still in progress: {status_entry.message}"
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' results not available."
        )
    return result


@router.get(
    "/{analysis_id}/projects",
    response_model=List[DetailedProjectAnalysis],
    summary="Get All Projects in Analysis",
    description="Returns the list of analyzed projects for this target."
)
async def get_analysis_projects(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> List[DetailedProjectAnalysis]:
    result = await job_store.get_result(analysis_id)
    if not result:
        # Check database fallback
        stmt = select(Evaluation).where(Evaluation.id == analysis_id).options(selectinload(Evaluation.projects))
        db_res = await db.execute(stmt)
        eval_rec = db_res.scalar_one_or_none()
        if eval_rec:
            resp = EvaluationPersistenceService.evaluation_to_analysis_response(eval_rec)
            return resp.analyzed_projects

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis results not found."
        )
    return result.analyzed_projects


@router.get(
    "/{analysis_id}/projects/{project_id}",
    response_model=DetailedProjectAnalysis,
    summary="Get Single Project Analysis",
    description="Returns detailed engineering evaluation for a specific project."
)
async def get_single_project(
    analysis_id: str,
    project_id: str,
    db: AsyncSession = Depends(get_db)
) -> DetailedProjectAnalysis:
    result = await job_store.get_result(analysis_id)
    projects_list: List[DetailedProjectAnalysis] = []
    if result:
        projects_list = result.analyzed_projects
    else:
        # Check database fallback
        stmt = select(Evaluation).where(Evaluation.id == analysis_id).options(selectinload(Evaluation.projects))
        db_res = await db.execute(stmt)
        eval_rec = db_res.scalar_one_or_none()
        if eval_rec:
            resp = EvaluationPersistenceService.evaluation_to_analysis_response(eval_rec)
            projects_list = resp.analyzed_projects

    if not projects_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis results not found."
        )

    for p in projects_list:
        if p.id.lower() == project_id.lower() or p.name.lower() == project_id.lower():
            return p
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Project '{project_id}' not found in analysis '{analysis_id}'."
    )


@router.get(
    "/{analysis_id}/pdf",
    summary="Download Academic PDF Dossier Directly from Analysis",
    description="Generates and streams an academic evaluation dossier for an analysis job."
)
async def export_direct_analysis_pdf(
    analysis_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    # 1. Try to find persisted evaluation in database
    stmt = select(Evaluation).where(Evaluation.id == analysis_id).options(
        selectinload(Evaluation.projects),
        selectinload(Evaluation.review_notes)
    )
    result = await db.execute(stmt)
    ev = result.scalar_one_or_none()

    if ev and ev.projects:
        evaluator_name = current_user.full_name if current_user else "Academic Evaluation Committee"
        generator = AcademicPdfGenerator()
        pdf_bytes = generator.generate_dossier_pdf(
            evaluation=ev,
            projects=ev.projects,
            review_notes=ev.review_notes,
            evaluator_name=evaluator_name
        )
        safe_target = ev.target_identifier.replace("/", "_").replace("\\", "_")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="RepoScope-Dossier-{safe_target}-{analysis_id[:8]}.pdf"',
                "Cache-Control": "no-cache"
            }
        )

    # 2. Fallback: check job_store in-memory results
    analysis_resp = await job_store.get_result(analysis_id)
    if not analysis_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation data not found or still processing."
        )

    # Persist and return PDF
    ev = await EvaluationPersistenceService.persist_evaluation(
        db=db,
        response=analysis_resp,
        user_id=current_user.id if current_user else None,
        ip_address=request.client.host if request.client else None
    )
    # Re-fetch with relationships loaded
    stmt = select(Evaluation).where(Evaluation.id == ev.id).options(
        selectinload(Evaluation.projects),
        selectinload(Evaluation.review_notes)
    )
    res = await db.execute(stmt)
    ev_loaded = res.scalar_one()

    evaluator_name = current_user.full_name if current_user else "Academic Evaluation Committee"
    generator = AcademicPdfGenerator()
    pdf_bytes = generator.generate_dossier_pdf(
        evaluation=ev_loaded,
        projects=ev_loaded.projects,
        review_notes=ev_loaded.review_notes,
        evaluator_name=evaluator_name
    )

    safe_target = ev_loaded.target_identifier.replace("/", "_").replace("\\", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="RepoScope-Dossier-{safe_target}-{analysis_id[:8]}.pdf"',
            "Cache-Control": "no-cache"
        }
    )


@router.post(
    "/{analysis_id}/retry",
    response_model=AnalysisJobStatus,
    summary="Retry Failed Analysis Job",
    description="Restarts an analysis job that previously failed or timed out."
)
async def retry_analysis(
    analysis_id: str,
    background_tasks: BackgroundTasks,
    service: AnalysisService = Depends(get_analysis_service)
) -> AnalysisJobStatus:
    status_entry = await job_store.get_status(analysis_id)
    if not status_entry:
        raise HTTPException(status_code=404, detail="Analysis job not found to retry.")

    # Re-fetch github_url from store
    job_entry = job_store._jobs.get(analysis_id)
    if not job_entry:
        raise HTTPException(status_code=404, detail="Job entry expired.")

    is_valid, target_type_str, username, repo_name = validate_and_parse_github_url(job_entry.github_url)
    if not is_valid:
        raise HTTPException(status_code=422, detail="Invalid target URL.")

    target_type = AnalysisType(target_type_str)
    await job_store.update_job(analysis_id, AnalysisStage.INITIALIZING, 5, "Retrying analysis...")

    background_tasks.add_task(
        _run_background_analysis,
        service,
        analysis_id,
        target_type,
        username,
        repo_name
    )

    updated_status = await job_store.get_status(analysis_id)
    return updated_status
