import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.schemas.analysis import AnalysisResponse, AnalysisStage, AnalysisType, DetailedProjectAnalysis, EvaluationCriterion
from app.services.job_store import job_store


@pytest.mark.asyncio
async def test_jobs_api_lifecycle(client: TestClient):
    with patch("app.api.v1.endpoints.analysis._run_background_analysis", return_value=None):
        # 1. Start an asynchronous analysis job (demo_mode=False)
        payload = {"github_url": "https://github.com/octocat", "demo_mode": False}
        resp = client.post("/api/v1/analysis", json=payload)
        assert resp.status_code == 200
        data = resp.json()

        assert data["is_demo"] is False
        assert "analysis_id" in data
        assert data["status"] == "INITIALIZING"
        analysis_id = data["analysis_id"]

        # 2. Poll job status
        status_resp = client.get(f"/api/v1/analysis/{analysis_id}/status")
        assert status_resp.status_code == 200
        status_data = status_resp.json()
        assert status_data["analysis_id"] == analysis_id
        assert "stage" in status_data
        assert "progress_percent" in status_data

        # 3. Simulate completion in job_store to verify result retrieval
        mock_project = DetailedProjectAnalysis(
            id="sample-proj",
            name="sample-proj",
            display_name="Sample Project",
            description="Sample description",
            repo_url="https://github.com/octocat/sample-proj",
            overall_score=8.5,
            rank=1,
            summary="Executive summary",
            stars=10,
            forks=2,
            primary_language="Python",
            updated_at="2026-10-01T00:00:00Z",
            problem_solved="Problem solved",
            key_features=["Feature 1"],
            architecture_notes="Architecture notes",
            tech_stack=[],
            language_breakdown=[],
            criteria_breakdown=[
                EvaluationCriterion(
                    id="code-quality", name="Code Quality", weight=20, score=8.5, rating_label="High", description=""
                )
            ],
            strengths=["Clean code"],
            weaknesses=[],
            recommendations=[]
        )

        completed_result = AnalysisResponse(
            is_demo=False,
            target_type=AnalysisType.PROFILE,
            target_identifier="octocat",
            total_repositories_found=1,
            analyzed_projects=[mock_project],
            evaluation_date="2026-11-09T12:00:00Z",
            analysis_id=analysis_id,
            status=AnalysisStage.COMPLETED,
            disclaimer="REAL GITHUB ANALYSIS"
        )

        await job_store.update_job(
            analysis_id=analysis_id,
            stage=AnalysisStage.COMPLETED,
            progress_percent=100,
            message="Completed",
            result=completed_result
        )

        # 4. Fetch completed analysis result
        result_resp = client.get(f"/api/v1/analysis/{analysis_id}")
        assert result_resp.status_code == 200
        res_data = result_resp.json()
        assert res_data["status"] == "COMPLETED"
        assert len(res_data["analyzed_projects"]) == 1
        assert res_data["analyzed_projects"][0]["name"] == "sample-proj"

        # 5. Fetch projects sub-endpoint
        proj_resp = client.get(f"/api/v1/analysis/{analysis_id}/projects")
        assert proj_resp.status_code == 200
        projs = proj_resp.json()
        assert len(projs) == 1

        # 6. Fetch single project sub-endpoint
        single_resp = client.get(f"/api/v1/analysis/{analysis_id}/projects/sample-proj")
        assert single_resp.status_code == 200
        single_p = single_resp.json()
        assert single_p["id"] == "sample-proj"
        assert single_p["overall_score"] == 8.5


def test_jobs_api_not_found(client: TestClient):
    resp = client.get("/api/v1/analysis/non-existent-uuid-1234/status")
    assert resp.status_code == 404
