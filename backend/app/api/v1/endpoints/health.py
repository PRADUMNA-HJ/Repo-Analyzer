from fastapi import APIRouter
from app.core.config import settings
from app.schemas.analysis import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description="Returns the health status, active version, and environment of the RepoScope backend API."
)
def get_health() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        application=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.APP_ENV,
        demo_mode=settings.DEMO_MODE,
        github_auth_configured=bool(settings.GITHUB_TOKEN and settings.GITHUB_TOKEN.strip()),
    )

