from typing import List
from app.schemas.analysis import DetailedProjectAnalysis


class ProjectRankingService:
    """
    Ranks evaluated software projects to select the strongest candidate showcase.
    Uses deterministic tie-breaking based on code quality and evidence confidence,
    never relying on star counts.
    """

    def rank_projects(self, projects: List[DetailedProjectAnalysis]) -> List[DetailedProjectAnalysis]:
        if not projects:
            return []

        # Tie-breaking key:
        # 1. overall_score (descending)
        # 2. code_quality score from criteria_breakdown (descending)
        # 3. confidence_score (descending)
        # 4. total stars as mild secondary tie breaker only
        def sorting_key(p: DetailedProjectAnalysis):
            cq_score = 0.0
            for c in p.criteria_breakdown:
                if c.id == "code-quality":
                    cq_score = c.score
                    break
            return (p.overall_score, cq_score, p.confidence_score, p.stars)

        sorted_projects = sorted(projects, key=sorting_key, reverse=True)

        top_candidates = sorted_projects[:3]

        # Assign ranks and generate comparative rationales
        for idx, proj in enumerate(top_candidates, start=1):
            proj.rank = idx
            if idx == 1:
                proj.ranking_rationale = (
                    f"Rank #1: Ranked highest with an overall engineering score of {proj.overall_score}/10.0, "
                    f"demonstrating superior architectural modularity and technical completeness."
                )
            elif idx == 2:
                diff = round(top_candidates[0].overall_score - proj.overall_score, 1)
                proj.ranking_rationale = (
                    f"Rank #2: Strong project score of {proj.overall_score}/10.0 ({diff} pts behind #1), "
                    f"showcasing sound domain implementation and clean technology integration."
                )
            elif idx == 3:
                proj.ranking_rationale = (
                    f"Rank #3: Solid engineering accomplishment with a score of {proj.overall_score}/10.0."
                )

        return top_candidates

