from typing import AsyncGenerator
import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.db.base import Base
import app.models  # Ensure all models are imported so metadata knows about them

logger = logging.getLogger("reposcope.db")

# Create asynchronous engine
# connect_args={"check_same_thread": False} is required if using sqlite
is_sqlite = "sqlite" in settings.ASYNC_DATABASE_URL
connect_args = {}
engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,
}

if is_sqlite:
    connect_args["check_same_thread"] = False
else:
    # Production PostgreSQL connection pool configuration
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 300,
        "pool_timeout": 30,
    })

engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initializes database schema if tables do not exist."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")

