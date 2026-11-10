import asyncio
from datetime import datetime, timezone
import time
from typing import Dict, Optional
import uuid
from app.core.config import settings
from app.schemas.analysis import AnalysisJobStatus, AnalysisResponse, AnalysisStage


class JobEntry:
    def __init__(self, analysis_id: str, github_url: str):
        now = datetime.now(timezone.utc).isoformat()
        self.analysis_id = analysis_id
        self.github_url = github_url
        self.stage = AnalysisStage.INITIALIZING
        self.progress_percent = 5
        self.message = "Initializing RepoScope analysis engine..."
        self.result: Optional[AnalysisResponse] = None
        self.error: Optional[str] = None
        self.created_at = now
        self.updated_at = now
        self.created_timestamp = time.time()


class JobStore:
    """
    Thread-safe in-memory temporary job store for asynchronous analysis execution.
    Manages job lifecycle and auto-evicts expired jobs based on ANALYSIS_JOB_TTL_SECONDS.
    """

    def __init__(self, ttl_seconds: Optional[int] = None):
        self.ttl = ttl_seconds or settings.ANALYSIS_JOB_TTL_SECONDS
        self._jobs: Dict[str, JobEntry] = {}
        self._lock = asyncio.Lock()

    async def create_job(self, github_url: str) -> str:
        async with self._lock:
            self._cleanup_expired()
            analysis_id = str(uuid.uuid4())
            self._jobs[analysis_id] = JobEntry(analysis_id=analysis_id, github_url=github_url)
            return analysis_id

    async def update_job(
        self,
        analysis_id: str,
        stage: AnalysisStage,
        progress_percent: int,
        message: str,
        result: Optional[AnalysisResponse] = None,
        error: Optional[str] = None
    ) -> None:
        async with self._lock:
            job = self._jobs.get(analysis_id)
            if job:
                job.stage = stage
                job.progress_percent = progress_percent
                job.message = message
                job.updated_at = datetime.now(timezone.utc).isoformat()
                if result is not None:
                    job.result = result
                if error is not None:
                    job.error = error

    async def get_status(self, analysis_id: str) -> Optional[AnalysisJobStatus]:
        async with self._lock:
            job = self._jobs.get(analysis_id)
            if not job:
                return None
            return AnalysisJobStatus(
                analysis_id=job.analysis_id,
                stage=job.stage,
                progress_percent=job.progress_percent,
                message=job.message,
                error=job.error,
                created_at=job.created_at,
                updated_at=job.updated_at
            )

    async def get_result(self, analysis_id: str) -> Optional[AnalysisResponse]:
        async with self._lock:
            job = self._jobs.get(analysis_id)
            if not job:
                return None
            return job.result

    def _cleanup_expired(self) -> None:
        now = time.time()
        expired_ids = [
            jid for jid, job in self._jobs.items()
            if now - job.created_timestamp > self.ttl
        ]
        for jid in expired_ids:
            self._jobs.pop(jid, None)


# Global singleton instance
job_store = JobStore()

