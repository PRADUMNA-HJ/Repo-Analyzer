from typing import List, Optional, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RepoScope API"
    VERSION: str = "3.0.0"
    API_PREFIX: str = "/api/v1"
    APP_ENV: str = "development"
    DEMO_MODE: bool = False
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Database Configuration (PostgreSQL / SQLite fallback)
    DATABASE_URL: str = "sqlite+aiosqlite:///./reposcope.db"

    # Security & Authentication
    JWT_SECRET_KEY: str = "reposcope_academic_evaluation_platform_jwt_secret_key_2026_cse_board_super_secure"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    ADMIN_BOOTSTRAP_EMAIL: str = "faculty@university.edu"
    ADMIN_BOOTSTRAP_PASSWORD: Optional[str] = None

    # Academic Evaluation Methodology
    METHODOLOGY_VERSION: str = "2.1.0"
    UNIVERSITY_NAME: str = "RepoScope Academic Engineering Board"
    DEPARTMENT_NAME: str = "Department of Computer Science & Engineering"

    # GitHub API Configuration
    GITHUB_TOKEN: Optional[str] = None
    GITHUB_API_BASE_URL: str = "https://api.github.com"
    MAX_REPOSITORIES_PER_PROFILE: int = 25
    MAX_FILES_PER_REPOSITORY: int = 80
    MAX_SOURCE_FILE_SIZE: int = 150_000  # 150 KB max per file
    MAX_TOTAL_SOURCE_SIZE: int = 1_500_000  # 1.5 MB max total inspected code per repo
    ANALYSIS_TIMEOUT_SECONDS: int = 60
    MAX_CONCURRENT_REPOSITORIES: int = 3
    ANALYSIS_JOB_TTL_SECONDS: int = 3600  # 1 hour in-memory cache

    # Optional AI-Assisted Explanation Layer
    GEMINI_API_KEY: Optional[str] = None

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173"]

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Converts raw DATABASE_URL to an async-compatible SQLAlchemy connection string."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("sqlite://") and not url.startswith("sqlite+aiosqlite://"):
            url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        # asyncpg requires 'ssl=' instead of 'sslmode='
        if "postgresql+asyncpg://" in url and "sslmode=" in url:
            url = url.replace("sslmode=", "ssl=")
        return url

    @property
    def SYNC_DATABASE_URL(self) -> str:
        """Converts raw DATABASE_URL to a synchronous connection string for Alembic/tools."""
        url = self.DATABASE_URL
        if url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
        elif url.startswith("sqlite+aiosqlite://"):
            url = url.replace("sqlite+aiosqlite://", "sqlite://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        if "postgresql://" in url and "ssl=" in url and "sslmode=" not in url:
            url = url.replace("ssl=", "sslmode=")
        return url

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
