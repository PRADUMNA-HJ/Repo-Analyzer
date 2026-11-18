import os
os.environ["DEMO_MODE"] = "true"
os.environ["APP_ENV"] = "testing"

import pytest
from fastapi.testclient import TestClient
from app.core.config import settings
settings.DEMO_MODE = True
settings.APP_ENV = "testing"
from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """Session fixture providing a FastAPI TestClient."""
    with TestClient(app) as test_client:
        yield test_client

