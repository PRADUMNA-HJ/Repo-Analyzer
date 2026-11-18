from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def setup_cors(app: FastAPI) -> None:
    """Configure Cross-Origin Resource Sharing (CORS) on the FastAPI instance."""
    raw_origins = list(settings.ALLOWED_ORIGINS) if isinstance(settings.ALLOWED_ORIGINS, (list, tuple)) else [settings.ALLOWED_ORIGINS]
    if settings.FRONTEND_ORIGIN:
        raw_origins.append(settings.FRONTEND_ORIGIN)

    # Sanitize and deduplicate origins: strip whitespace and trailing slashes
    sanitized_origins = []
    for origin in raw_origins:
        cleaned = origin.strip().rstrip("/")
        if cleaned and cleaned not in sanitized_origins:
            sanitized_origins.append(cleaned)

    # If "*" is explicitly in origins, credentials cannot be enabled per CORS specification
    allow_credentials = "*" not in sanitized_origins

    app.add_middleware(
        CORSMiddleware,
        allow_origins=sanitized_origins,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition", "Content-Type", "Content-Length"],
    )

