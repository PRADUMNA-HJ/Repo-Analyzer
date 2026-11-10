from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "product" in data
    assert "RepoScope" in data["product"]
    assert data["status"] == "operational"
    assert "/docs" in data["documentation"]
    assert "api_v1" in data


def test_health_check_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["application"] == "RepoScope API"
    assert "version" in data
    assert "environment" in data
    assert data["demo_mode"] is True

