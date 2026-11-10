import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_evaluations_history_pdf_and_reviews_workflow():
    # 1. Trigger an analysis to ensure at least one evaluation is persisted
    analyze_resp = client.post(
        "/api/v1/analysis",
        json={"github_url": "https://github.com/octocat", "demo_mode": True}
    )
    assert analyze_resp.status_code == 200
    analysis_data = analyze_resp.json()
    assert analysis_data["target_identifier"] == "octocat"

    # 2. List evaluations
    list_resp = client.get("/api/v1/evaluations?page=1&page_size=10")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert "items" in list_data
    assert list_data["total"] >= 1
    eval_id = list_data["items"][0]["id"]

    # 3. Search evaluations by query
    search_resp = client.get("/api/v1/evaluations?q=octocat")
    assert search_resp.status_code == 200
    assert len(search_resp.json()["items"]) >= 1

    # 4. Get evaluation detail
    detail_resp = client.get(f"/api/v1/evaluations/{eval_id}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["id"] == eval_id
    assert len(detail_data["projects"]) >= 1

    # 5. Get evaluation stats summary
    stats_resp = client.get("/api/v1/evaluations/stats/summary")
    assert stats_resp.status_code == 200
    stats_data = stats_resp.json()
    assert stats_data["total_evaluations"] >= 1
    assert "average_score" in stats_data
    assert "top_languages" in stats_data

    # 6. Register a faculty reviewer with dynamic email
    reviewer_email = f"reviewer.{uuid.uuid4().hex[:6]}@university.edu"
    faculty_resp = client.post("/api/v1/auth/register", json={
        "email": reviewer_email,
        "password": "reviewerPassword123",
        "full_name": "Prof. Marcus Thorne",
        "department": "CSE Department",
        "role": "FACULTY"
    })
    assert faculty_resp.status_code == 201
    faculty_token = faculty_resp.json()["access_token"]

    # 7. Add a review note with faculty token
    review_resp = client.post(
        f"/api/v1/evaluations/{eval_id}/reviews",
        headers={"Authorization": f"Bearer {faculty_token}"},
        json={
            "overall_comment": "Excellent project architecture and adherence to standard practices.",
            "accreditation_verdict": "APPROVED_EXEMPLARY",
            "manual_score_override": 9.2
        }
    )
    assert review_resp.status_code == 201
    rev_data = review_resp.json()
    assert rev_data["reviewer_name"] == "Prof. Marcus Thorne"
    assert rev_data["accreditation_verdict"] == "APPROVED_EXEMPLARY"
    assert rev_data["manual_score_override"] == 9.2

    # 8. Download Academic PDF Dossier
    pdf_resp = client.get(f"/api/v1/evaluations/{eval_id}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert "attachment" in pdf_resp.headers["content-disposition"]
    assert len(pdf_resp.content) > 1000

    # 9. View Audit Records
    audit_resp = client.get(
        "/api/v1/evaluations/audit/records",
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert audit_resp.status_code == 200
    records = audit_resp.json()
    assert isinstance(records, list)
    actions = [r["action"] for r in records]
    assert "PDF_DOSSIER_DOWNLOADED" in actions or "HUMAN_REVIEW_RECORDED" in actions
