import logging
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.config import settings
from app.schemas.analysis import HealthResponse
from app.db.session import get_db

logger = logging.getLogger("reposcope.health")
router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description="Returns the health status, active version, database connectivity, and environment of the RepoScope backend API."
)
async def get_health(
    response: Response,
    db: AsyncSession = Depends(get_db)
) -> HealthResponse:
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        db_status = "disconnected"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    overall_status = "healthy" if db_status == "connected" else "degraded"
    db_type = "postgresql" if "postgresql" in settings.ASYNC_DATABASE_URL else "sqlite"

    return HealthResponse(
        status=overall_status,
        application=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.APP_ENV,
        demo_mode=settings.DEMO_MODE,
        github_auth_configured=bool(settings.GITHUB_TOKEN and settings.GITHUB_TOKEN.strip()),
        database=db_status,
        database_type=db_type,
    )

