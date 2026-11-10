from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def setup_cors(app: FastAPI) -> None:
    """Configure Cross-Origin Resource Sharing (CORS) on the FastAPI instance."""
    origins = settings.ALLOWED_ORIGINS
    if settings.FRONTEND_ORIGIN not in origins:
        origins.append(settings.FRONTEND_ORIGIN)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
        allow_headers=["*"],
    )

