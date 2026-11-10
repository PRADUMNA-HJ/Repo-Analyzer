import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import select

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.cors import setup_cors
from app.db.session import init_db, AsyncSessionLocal
from app.models.user import User
from app.auth.security import get_password_hash

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("reposcope")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database initialization and service warmup."""
    logger.info("Initializing database schema on startup...")
    await init_db()

    # Seed default faculty account if none exists
    try:
        async with AsyncSessionLocal() as session:
            res = await session.execute(select(User).where(User.email == "faculty@university.edu"))
            if not res.scalar_one_or_none():
                default_faculty = User(
                    email="faculty@university.edu",
                    hashed_password=get_password_hash("faculty123"),
                    full_name="Dr. Alistair Vance, Ph.D.",
                    department="Department of Computer Science & Engineering",
                    role="FACULTY",
                    is_active=True
                )
                session.add(default_faculty)
                await session.commit()
                logger.info("Seeded default faculty account: faculty@university.edu")
    except Exception as e:
        logger.warning(f"Could not seed default faculty account: {e}")

    yield
    logger.info("Shutting down RepoScope application.")


# Initialize FastAPI instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "RepoScope API — GitHub Project Intelligence & Evaluation Platform.\n\n"
        "Provides REST endpoints to analyze public GitHub user profiles and individual repositories, "
        "inspecting code quality, architecture, technology stack, and engineering execution."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    lifespan=lifespan
)


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# Apply CORS middleware
setup_cors(app)

# Include Version 1 API routes
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Format Pydantic schema validation errors cleanly for client consumption."""
    error_messages = []
    for err in exc.errors():
        loc = " -> ".join(str(item) for item in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        error_messages.append(f"{loc}: {msg}")

    detail_str = "; ".join(error_messages) if error_messages else "Request validation failed"
    logger.warning("Validation error on %s %s: %s", request.method, request.url.path, detail_str)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": detail_str,
            "code": "VALIDATION_ERROR",
            "hint": "Please verify that the GitHub URL is properly formatted (e.g., https://github.com/username)."
        }
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Standardize HTTP exception structures."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "code": f"HTTP_{exc.status_code}",
            "hint": None
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Safely catch unhandled internal exceptions without leaking sensitive server traces."""
    logger.exception("Unhandled server exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "code": "INTERNAL_SERVER_ERROR",
            "hint": "Our engineering telemetry has recorded this incident."
        }
    )


@app.get("/", tags=["Root"])
def root_endpoint():
    """Root entrypoint returning product meta and OpenAPI documentation links."""
    return {
        "product": "RepoScope — GitHub Project Intelligence & Evaluation Platform",
        "version": settings.VERSION,
        "environment": settings.APP_ENV,
        "methodology_version": settings.METHODOLOGY_VERSION,
        "status": "operational",
        "documentation": "/docs",
        "api_v1": {
            "health": f"{settings.API_PREFIX}/health",
            "auth": f"{settings.API_PREFIX}/auth",
            "analysis": f"{settings.API_PREFIX}/analysis",
            "evaluations": f"{settings.API_PREFIX}/evaluations",
        }
    }
