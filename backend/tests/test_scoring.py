from app.analysis.scoring.scoring_engine import ScoringEngine
from app.analysis.scoring.ranking_service import ProjectRankingService
from app.analysis.analyzers.base import AnalyzerResult
from app.schemas.analysis import DetailedProjectAnalysis, SecurityFinding, TechnologyCategory, EvaluationCriterion


def test_scoring_engine_weights_and_scale():
    engine = ScoringEngine()

    mock_analyzer = AnalyzerResult(
        language="Python",
        loc=450,
        function_count=12,
        class_count=3,
        avg_complexity=2.5,
        has_error_handling=True,
        has_type_annotations=True
    )

    tech_cats = [
        TechnologyCategory(category="Frontend", items=["React"]),
        TechnologyCategory(category="Backend API", items=["FastAPI"]),
        TechnologyCategory(category="Database & Cache", items=["PostgreSQL"]),
    ]

    doc_data = {
        "has_readme": True,
        "has_installation": True,
        "has_api_docs": True,
        "key_features": ["Feature 1", "Feature 2", "Feature 3"]
    }

    tree_paths = ["app/main.py", "tests/test_app.py", "Dockerfile", ".github/workflows/ci.yml"]

    (
        overall_score,
        criteria,
        strengths,
        weaknesses,
        recommendations,
        complexity_metrics,
        confidence
    ) = engine.calculate_evaluation(
        repo_data={"name": "test-repo", "stargazers_count": 0, "has_issues": True, "default_branch": "main"},
        analyzer_results=[mock_analyzer],
        tech_categories=tech_cats,
        architecture_findings=["Layered architecture isolating API from models."],
        doc_data=doc_data,
        doc_findings=["README provides installation instructions."],
        security_findings=[],
        commits_data=[{"sha": "c1"}, {"sha": "c2"}, {"sha": "c3"}],
        tree_paths=tree_paths
    )

    # Verify 8 criteria
    assert len(criteria) == 8
    total_weight = sum(c.weight for c in criteria)
    assert total_weight == 100

    # Overall score must be on scale 0.0 - 10.0
    assert 0.0 <= overall_score <= 10.0
    assert overall_score >= 7.0  # Quality project with typing, tests, and docs gets solid score
    assert len(strengths) > 0
    assert confidence >= 0.8


def test_ranking_service_tie_breaking():
    ranking = ProjectRankingService()

    # Project A: High score 8.8, 10 stars
    proj_a = DetailedProjectAnalysis(
        id="proj-a",
        name="proj-a",
        display_name="Project A",
        description="Desc A",
        repo_url="https://github.com/u/proj-a",
        overall_score=8.8,
        rank=1,
        summary="Summary A",
        stars=10,
        forks=2,
        primary_language="Python",
        updated_at="2026-10-01T00:00:00Z",
        problem_solved="Problem A",
        key_features=["Feature A"],
        architecture_notes="Arch A",
        tech_stack=[],
        language_breakdown=[],
        criteria_breakdown=[
            EvaluationCriterion(
                id="code-quality", name="Code Quality", weight=20, score=9.0, rating_label="High", description=""
            )
        ],
        strengths=[], weaknesses=[], recommendations=[], confidence_score=0.9
    )

    # Project B: Score 8.5, but 500 stars (stars must NOT beat higher quality Project A!)
    proj_b = DetailedProjectAnalysis(
        id="proj-b",
        name="proj-b",
        display_name="Project B",
        description="Desc B",
        repo_url="https://github.com/u/proj-b",
        overall_score=8.5,
        rank=2,
        summary="Summary B",
        stars=500,
        forks=50,
        primary_language="JavaScript",
        updated_at="2026-10-01T00:00:00Z",
        problem_solved="Problem B",
        key_features=["Feature B"],
        architecture_notes="Arch B",
        tech_stack=[],
        language_breakdown=[],
        criteria_breakdown=[
            EvaluationCriterion(
                id="code-quality", name="Code Quality", weight=20, score=8.0, rating_label="High", description=""
            )
        ],
        strengths=[], weaknesses=[], recommendations=[], confidence_score=0.8
    )

    ranked = ranking.rank_projects([proj_b, proj_a])
    assert len(ranked) == 2
    assert ranked[0].id == "proj-a"  # Higher score wins over stars
    assert ranked[0].rank == 1
    assert ranked[1].id == "proj-b"
    assert ranked[1].rank == 2
    assert "Rank #1" in ranked[0].ranking_rationale

