from fastapi.testclient import TestClient


def test_analyze_valid_profile_url(client: TestClient) -> None:
    payload = {"github_url": "https://github.com/octocat"}
    response = client.post("/api/v1/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_demo"] is True
    assert data["target_type"] == "profile"
    assert data["target_identifier"] == "octocat"
    assert data["total_repositories_found"] > 0
    assert len(data["analyzed_projects"]) == 3
    assert "DEMO DATA" in data["disclaimer"]

    # Check first project structure
    project = data["analyzed_projects"][0]
    assert project["overall_score"] > 0
    assert project["rank"] == 1
    assert len(project["criteria_breakdown"]) == 8

    # Verify criteria weights sum to 100
    weights_sum = sum(criterion["weight"] for criterion in project["criteria_breakdown"])
    assert weights_sum == 100

    # Verify key sections
    assert len(project["key_features"]) > 0
    assert len(project["tech_stack"]) > 0
    assert len(project["language_breakdown"]) > 0
    assert len(project["strengths"]) > 0
    assert len(project["weaknesses"]) > 0
    assert len(project["recommendations"]) > 0


def test_analyze_valid_repository_url(client: TestClient) -> None:
    payload = {"github_url": "https://github.com/torvalds/linux"}
    response = client.post("/api/v1/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_demo"] is True
    assert data["target_type"] == "repository"
    assert data["target_identifier"] == "torvalds/linux"
    assert len(data["analyzed_projects"]) >= 1


def test_analyze_repository_with_git_suffix(client: TestClient) -> None:
    payload = {"github_url": "https://github.com/facebook/react.git"}
    response = client.post("/api/v1/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_identifier"] == "facebook/react"


def test_analyze_invalid_domain_url(client: TestClient) -> None:
    payload = {"github_url": "https://gitlab.com/username/project"}
    response = client.post("/api/v1/analysis", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "Invalid GitHub URL" in data["detail"]


def test_analyze_empty_url(client: TestClient) -> None:
    payload = {"github_url": ""}
    response = client.post("/api/v1/analysis", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"


def test_analyze_malformed_url(client: TestClient) -> None:
    payload = {"github_url": "not-a-valid-url"}
    response = client.post("/api/v1/analysis", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"


def test_analyze_reserved_path_url(client: TestClient) -> None:
    payload = {"github_url": "https://github.com/settings"}
    response = client.post("/api/v1/analysis", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"

